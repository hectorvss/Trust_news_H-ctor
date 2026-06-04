import { createClient } from '@supabase/supabase-js';

export const TODDY_DEPTHS = {
  basic: {
    credits: 1,
    label: 'Respuesta breve',
    maxArticles: 6,
    instruction: 'Responde de forma clara, breve y pedagógica. Prioriza explicación simple y contexto mínimo.'
  },
  deep: {
    credits: 3,
    label: 'Análisis completo',
    maxArticles: 10,
    instruction: 'Responde con análisis completo: hechos, contexto, actores, cifras, consenso, sesgos y dudas abiertas.'
  },
  source_audit: {
    credits: 5,
    label: 'Auditoría de fuentes',
    maxArticles: 14,
    instruction: 'Audita fuentes: compara sesgos, claims, cifras, omisiones, documentos y diferencias editoriales.'
  }
};

const DEFAULT_MODEL = process.env.TODDY_ANTHROPIC_MODEL || process.env.ANTHROPIC_MODEL || 'claude-3-5-haiku-20241022';
const TODDY_PROMPT_VERSION = 'toddy-story-agent-v1';
const STATUS_STEPS = [
  'leyendo la noticia',
  'comparando fuentes',
  'verificando claims',
  'redactando respuesta'
];

const DEPTH_CONTEXT_LIMITS = {
  basic: { excerpt: 700, fullText: 0, maxEvidenceArticles: 6 },
  deep: { excerpt: 1200, fullText: 700, maxEvidenceArticles: 10 },
  source_audit: { excerpt: 1600, fullText: 1000, maxEvidenceArticles: 14 }
};

export function createSupabaseAdmin() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Missing Supabase service configuration');
  }
  return createClient(url, key);
}

export function getBearerToken(req) {
  const header = req.headers?.authorization || req.headers?.Authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : null;
}

export async function authenticateUser(req, supabase) {
  const token = getBearerToken(req);
  if (!token) return { error: 'auth_required' };

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return { error: 'auth_required' };
  return { user: data.user };
}

function normalizeArticles(story, sourceIndex = {}) {
  const raw = Array.isArray(story.articles) ? story.articles : [];
  return raw.map((article, index) => {
    const sourceName = article.source || article.origin || article.name || article.medio || `Fuente ${index + 1}`;
    const sourceProfile = sourceIndex[sourceName.toLowerCase()] || {};
    return {
      article_id: String(article.article_id || article.id || article.url || `${story.id}-${index + 1}`),
      source: sourceName,
      url: article.url || article.link || null,
      headline: article.title || article.headline || article.titular || null,
      author: article.author || article.autor || null,
      date: article.date || article.published_at || article.fecha || null,
      bias: article.bias || article.bias_label || sourceProfile.bias_label || sourceProfile.political_lean || null,
      bias_score: article.bias_score ?? sourceProfile.bias_score ?? null,
      factuality: article.factuality || sourceProfile.factuality || null,
      summary: article.summary || article.resumen || article.extract || null,
      angle: article.angle || article.angulo || article.editorial_reason || null,
      tone: article.tone || article.tono || null,
      difference: article.difference || article.diferencia || article.difference_from_consensus || null,
      opening_reason: article.opening_reason || article.razon_editorial || null
    };
  });
}

function compactText(value, max = 900) {
  if (!value) return null;
  const text = String(value).replace(/\s+/g, ' ').trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trim()}…`;
}

function asPlainText(value, max = 1200) {
  if (value == null) return null;
  if (typeof value === 'string') return compactText(value, max);
  if (Array.isArray(value)) {
    return compactText(value.map((item) => asPlainText(item, Math.ceil(max / Math.max(value.length, 1)))).filter(Boolean).join(' | '), max);
  }
  if (typeof value === 'object') {
    const text = Object.entries(value)
      .map(([key, val]) => `${key}: ${typeof val === 'object' ? asPlainText(val, 260) : val}`)
      .join(' | ');
    return compactText(text, max);
  }
  return compactText(String(value), max);
}

function tokenize(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 3);
}

function relevanceScore(article, query) {
  const queryTerms = new Set(tokenize(query));
  if (!queryTerms.size) return 0;
  const haystack = tokenize([
    article.title,
    article.headline,
    article.excerpt,
    article.content_excerpt,
    article.lead,
    article.summary,
    article.event_signature,
    article.entity_fingerprint,
    asPlainText(article.claims, 500),
    asPlainText(article.figures, 500),
    asPlainText(article.entities, 500)
  ].filter(Boolean).join(' '));
  return haystack.reduce((score, token) => score + (queryTerms.has(token) ? 1 : 0), 0);
}

function extractArrayField(value, maxItems = 8) {
  if (!value) return [];
  if (Array.isArray(value)) return value.slice(0, maxItems);
  if (typeof value === 'string') {
    return value
      .split(/\n|;|\|/)
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, maxItems);
  }
  if (typeof value === 'object') return [value].slice(0, maxItems);
  return [];
}

function pickSegmentTrace(story) {
  const metadata = story.generation_metadata || {};
  const segmentTrace = metadata.segment_trace || metadata.segment_summary || {};
  const evidence = metadata.evidence || {};
  const llm = metadata.llm || {};
  return {
    segment_trace: segmentTrace,
    evidence_quality: metadata.evidence_quality || evidence.quality || evidence.score || null,
    evidence_hash: evidence.hash || metadata.evidence_pack_hash || null,
    prompt_version: llm.prompt_version || metadata.prompt_version || null,
    llm_confidence: llm.confidence || metadata.llm_confidence || null
  };
}

async function fetchClusterContext(supabase, story) {
  const clusterId = story.pipeline_cluster_id || story.cluster_id;
  let query = supabase
    .from('story_clusters')
    .select('id,title,topic_summary,topic_keywords,article_ids,article_count,source_count,bias_distribution,coverage_left,coverage_center,coverage_right,confidence_score,diversity_score,freshness_score,synthesis_score,status,window_start,window_end,analysis')
    .limit(1);

  query = clusterId ? query.eq('id', clusterId) : query.eq('story_id', story.id);
  const { data, error } = await query.maybeSingle();
  if (error) return null;
  return data || null;
}

function compactRawArticle(article, sourceProfile, depth, question) {
  const content = Array.isArray(article.article_content) ? article.article_content[0] : article.article_content;
  const limits = DEPTH_CONTEXT_LIMITS[depth] || DEPTH_CONTEXT_LIMITS.basic;
  const title = content?.resolved_title || article.title;
  const excerpt = content?.content_excerpt || article.excerpt || article.summary || null;
  const selectedText = limits.fullText > 0 ? compactText(content?.content_text, limits.fullText) : null;
  const sourceName = sourceProfile?.nombre || sourceProfile?.name || article.source_name || article.source_id || 'Fuente';

  return {
    article_id: String(article.id),
    source: sourceName,
    source_profile: {
      bias: sourceProfile?.political_lean || sourceProfile?.bias_label || sourceProfile?.bias || null,
      bias_score: sourceProfile?.bias_score ?? null,
      factuality: sourceProfile?.factuality || null,
      country: sourceProfile?.country || sourceProfile?.pais || null,
      language: sourceProfile?.language || null,
      scope: sourceProfile?.source_scope || null,
      fact_check_score: sourceProfile?.fact_check_score ?? null,
      bias_confidence: sourceProfile?.bias_confidence ?? null
    },
    title,
    subtitle: content?.subtitle || null,
    lead: compactText(content?.lead, 500),
    url: content?.canonical_url || article.url,
    author: content?.byline || article.author,
    published_at: content?.published_at || article.published_at,
    section: content?.section || null,
    excerpt: compactText(excerpt, limits.excerpt),
    selected_text: selectedText,
    event_signature: article.event_signature || content?.event_signature || null,
    entity_fingerprint: article.entity_fingerprint || content?.entity_fingerprint || null,
    extraction: {
      status: content?.extraction_status || article.extraction_status || null,
      quality: content?.extraction_quality_score ?? 0,
      parser_used: content?.parser_used || null,
      content_source: content?.content_source || null,
      paywall_detected: Boolean(content?.paywall_detected),
      blocked_reason: content?.blocked_reason || null
    },
    tags: extractArrayField(content?.tags, 8),
    entities: extractArrayField(content?.extracted_entities, 10),
    claims: extractArrayField(content?.extracted_claims || article.structured_data?.claims, 8),
    figures: extractArrayField(content?.extracted_figures || article.structured_data?.figures, 8),
    quotes: extractArrayField(content?.extracted_quotes || article.structured_data?.quotes, 5),
    documents: extractArrayField(content?.extracted_documents || article.structured_data?.documents, 6),
    outbound_links: extractArrayField(content?.outbound_links, 6),
    tone: content?.extracted_tone || article.structured_data?.tone || null,
    relevance: relevanceScore({ ...article, ...content, claims: content?.extracted_claims, figures: content?.extracted_figures, entities: content?.extracted_entities }, question)
  };
}

async function fetchEvidenceArticles(supabase, story, cluster, depth, question) {
  const ids = Array.isArray(cluster?.article_ids) ? cluster.article_ids : [];
  let query = supabase
    .from('raw_articles')
    .select('id,source_id,title,excerpt,author,url,image_url,published_at,language,structured_data,event_signature,entity_fingerprint,cluster_id,extraction_status,article_content(content_text,content_excerpt,resolved_title,subtitle,lead,canonical_url,byline,section,published_at,modified_at,tags,images,outbound_links,extracted_claims,extracted_figures,extracted_documents,extracted_quotes,extracted_entities,extracted_tone,extraction_status,extraction_quality_score,parser_used,content_source,paywall_detected,blocked_reason)')
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(40);

  if (ids.length) query = query.in('id', ids);
  else if (cluster?.id) query = query.eq('cluster_id', cluster.id);
  else return [];

  const { data: rawArticles, error } = await query;
  if (error || !rawArticles?.length) return [];

  const sourceIds = [...new Set(rawArticles.map((article) => article.source_id).filter(Boolean))];
  const sourceMap = {};
  if (sourceIds.length) {
    const { data: sources } = await supabase
      .from('sources')
      .select('id,nombre,name,bias,bias_label,bias_score,political_lean,factuality,ownership,country,pais,language,source_scope,media_type,fact_check_score,bias_confidence')
      .in('id', sourceIds);
    (sources || []).forEach((source) => { sourceMap[source.id] = source; });
  }

  const limits = DEPTH_CONTEXT_LIMITS[depth] || DEPTH_CONTEXT_LIMITS.basic;
  return rawArticles
    .map((article) => compactRawArticle(article, sourceMap[article.source_id] || {}, depth, question))
    .sort((a, b) => {
      const scoreA = (a.relevance * 3) + Number(a.extraction.quality || 0) + (a.claims.length ? 0.5 : 0) + (a.figures.length ? 0.5 : 0);
      const scoreB = (b.relevance * 3) + Number(b.extraction.quality || 0) + (b.claims.length ? 0.5 : 0) + (b.figures.length ? 0.5 : 0);
      return scoreB - scoreA;
    })
    .slice(0, limits.maxEvidenceArticles);
}

function summarizeEvidenceCoverage(evidenceArticles, storyArticles) {
  const all = evidenceArticles.length ? evidenceArticles : storyArticles;
  const sources = new Set(all.map((article) => article.source).filter(Boolean));
  const blocked = evidenceArticles.filter((article) => article.extraction?.blocked_reason || article.extraction?.paywall_detected);
  const claims = evidenceArticles.reduce((sum, article) => sum + (article.claims?.length || 0), 0);
  const figures = evidenceArticles.reduce((sum, article) => sum + (article.figures?.length || 0), 0);
  const avgQuality = evidenceArticles.length
    ? evidenceArticles.reduce((sum, article) => sum + Number(article.extraction?.quality || 0), 0) / evidenceArticles.length
    : null;
  return {
    source_count: sources.size,
    evidence_article_count: evidenceArticles.length,
    claims_count: claims,
    figures_count: figures,
    blocked_or_paywalled_count: blocked.length,
    average_extraction_quality: avgQuality == null ? null : Number(avgQuality.toFixed(3))
  };
}

export async function buildToddyStoryContext(supabase, storyId, depth = 'basic', question = '') {
  const { data: story, error } = await supabase
    .from('stories')
    .select('id,status,title,summary,full_content,category,location,published_at,updated_at,bias,source_count,sources_count,articles,consenso_narrativo,consensus_narrative,blind_spot,cifras_clave,verificacion_info,origen_info,impacto_social,impacto_sistemico,documentos_info,protagonistas_info,preguntas_info,analytical_snippet,generation_metadata,editorial_validation,coverage_left,coverage_center,coverage_right,pipeline_cluster_id,cluster_id')
    .eq('id', storyId)
    .single();

  if (error || !story) return { error: 'story_not_found' };
  if (story.status !== 'published') return { error: 'story_not_published' };

  const depthPolicy = TODDY_DEPTHS[depth] || TODDY_DEPTHS.basic;
  const articles = normalizeArticles(story)
    .sort((a, b) => Number(Boolean(b.summary || b.angle)) - Number(Boolean(a.summary || a.angle)))
    .slice(0, depthPolicy.maxArticles);

  const biasDistribution = story.bias || {
    left: story.coverage_left || 0,
    center: story.coverage_center || 0,
    right: story.coverage_right || 0
  };

  const trace = pickSegmentTrace(story);
  const cluster = await fetchClusterContext(supabase, story);
  const evidenceArticles = await fetchEvidenceArticles(supabase, story, cluster, depth, question);
  const context = {
    story: {
      id: story.id,
      title: story.title,
      category: story.category,
      location: story.location,
      published_at: story.published_at,
      updated_at: story.updated_at,
      summary: compactText(story.summary, 1000),
      analytical_snippet: compactText(story.analytical_snippet, 700)
    },
    editorial_segments: {
      resumen: compactText(story.summary, 900),
      contexto: compactText(story.full_content, 1200),
      consenso_narrativo: compactText(story.consenso_narrativo || story.consensus_narrative, 1000),
      blind_spot: compactText(story.blind_spot, 700),
      verificacion: compactText(story.verificacion_info, 900),
      origen: asPlainText(story.origen_info, 700),
      impacto_social: compactText(story.impacto_social, 700),
      impacto_sistemico: compactText(story.impacto_sistemico, 700),
      protagonistas: asPlainText(story.protagonistas_info, 700),
      preguntas_abiertas: asPlainText(story.preguntas_info, 700)
    },
    cluster: cluster ? {
      id: cluster.id,
      title: cluster.title,
      topic_summary: compactText(cluster.topic_summary, 900),
      topic_keywords: cluster.topic_keywords || [],
      article_count: cluster.article_count,
      source_count: cluster.source_count,
      status: cluster.status,
      window_start: cluster.window_start,
      window_end: cluster.window_end,
      scores: {
        confidence: cluster.confidence_score ?? null,
        diversity: cluster.diversity_score ?? null,
        freshness: cluster.freshness_score ?? null,
        synthesis: cluster.synthesis_score ?? null
      },
      analysis: cluster.analysis || null
    } : null,
    bias_distribution: biasDistribution,
    cifras_clave: extractArrayField(story.cifras_clave, 10),
    documentos: extractArrayField(story.documentos_info, 8),
    articles,
    evidence_articles: evidenceArticles,
    evidence_coverage: summarizeEvidenceCoverage(evidenceArticles, articles),
    source_count: story.source_count || story.sources_count || articles.length,
    editorial_validation: story.editorial_validation || {},
    generation_trace: trace
  };

  const sourceTrace = (evidenceArticles.length ? evidenceArticles : articles)
    .map((a) => ({
      article_id: a.article_id,
      source: a.source,
      url: a.url,
      bias: a.bias || a.source_profile?.bias || null,
      extraction_quality: a.extraction?.quality ?? null
    }));

  return { story, context, sourcesUsed: sourceTrace };
}

function buildToddyPrompt(context, message, depth, conversationHistory = []) {
  const depthPolicy = TODDY_DEPTHS[depth] || TODDY_DEPTHS.basic;
  const history = conversationHistory
    .slice(-8)
    .map((item) => `${item.role === 'assistant' ? 'Toddy' : 'Usuario'}: ${compactText(item.content, 420)}`)
    .join('\n');
  return [
    {
      role: 'user',
      content: [
        `Contexto compacto de Trust News para Toddy (${TODDY_PROMPT_VERSION}).`,
        `Profundidad solicitada: ${depth} - ${depthPolicy.label}.`,
        depthPolicy.instruction,
        '',
        'Reglas:',
        '- Responde en español claro y natural.',
        '- No inventes datos. Si falta evidencia, dilo explícitamente.',
        '- Cita fuentes de forma compacta usando nombre del medio y article_id cuando hables de claims, cifras o diferencias.',
        '- Cuando uses cifras, citas o claims, incluye una referencia concreta entre parentesis: fuente + article_id.',
        '- Si la pregunta no esta cubierta por el contexto, responde con lo disponible y marca claramente que falta.',
        '- En deep/source_audit, termina con "Fuentes usadas:" cuando hayas usado articulos concretos.',
        '- Distingue hechos, interpretaciones y dudas abiertas.',
        '- No modifiques la noticia ni publiques nada: sólo explica la story ya publicada.',
        '',
        history ? `Historial reciente:\n${history}\n` : '',
        'Contexto JSON:',
        JSON.stringify(context),
        '',
        `Pregunta del usuario: ${message}`
      ].join('\n')
    }
  ];
}

async function callAnthropic({ context, message, depth, conversationHistory = [] }) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      max_tokens: depth === 'basic' ? 800 : depth === 'deep' ? 1400 : 1900,
      temperature: 0.2,
      system: 'Eres Toddy, el agente de Trust News. Ayudas al lector a entender una noticia publicada usando sólo evidencia editorial y fuentes proporcionadas.',
      messages: buildToddyPrompt(context, message, depth, conversationHistory)
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Anthropic error ${response.status}: ${text.slice(0, 240)}`);
  }

  const payload = await response.json();
  const content = (payload.content || [])
    .map((part) => part.type === 'text' ? part.text : '')
    .filter(Boolean)
    .join('\n')
    .trim();

  return {
    content,
    model: payload.model || DEFAULT_MODEL,
    tokenUsage: payload.usage || {},
    confidence: content.includes('no hay evidencia') || content.includes('falta evidencia') ? 0.72 : 0.86
  };
}

function setSseHeaders(res) {
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  if (typeof res.flushHeaders === 'function') res.flushHeaders();
}

function writeSse(res, event, data) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

async function streamText(res, text) {
  const chunks = text.match(/.{1,160}(\s|$)/g) || [text];
  for (const chunk of chunks) {
    writeSse(res, 'delta', { text: chunk });
    await new Promise((resolve) => setTimeout(resolve, 18));
  }
}

async function getOrCreateConversation(supabase, userId, storyId, title) {
  const { data: existing } = await supabase
    .from('toddy_conversations')
    .select('id,user_id,story_id,title,created_at,updated_at')
    .eq('user_id', userId)
    .eq('story_id', storyId)
    .maybeSingle();

  if (existing) return existing;

  const { data, error } = await supabase
    .from('toddy_conversations')
    .insert({ user_id: userId, story_id: storyId, title })
    .select('id,user_id,story_id,title,created_at,updated_at')
    .single();

  if (error) throw error;
  return data;
}

async function getConversationMessages(supabase, conversationId) {
  const { data, error } = await supabase
    .from('toddy_messages')
    .select('id,role,content,depth,sources_used,token_usage,credits_charged,model,status,confidence,created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

async function loadProfile(supabase, userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id,role,subscription_tier,subscription_status,ai_credit_balance')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

function isPaidProfile(profile) {
  return ['premium', 'elite'].includes(profile?.subscription_tier);
}

async function hasUsedFreeStoryAnswer(supabase, userId, storyId) {
  const { count, error } = await supabase
    .from('toddy_messages')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('story_id', storyId)
    .eq('role', 'assistant')
    .eq('credits_charged', 0);

  if (error) throw error;
  return (count || 0) > 0;
}

export async function handleToddyGet(req, res) {
  const supabase = createSupabaseAdmin();
  const { user, error: authError } = await authenticateUser(req, supabase);
  if (authError) return res.status(401).json({ error: authError });

  const storyId = req.query?.story_id || new URL(req.url, 'http://localhost').searchParams.get('story_id');
  if (!storyId) return res.status(400).json({ error: 'story_id_required' });

  const { story, error } = await buildToddyStoryContext(supabase, storyId, 'basic');
  if (error) return res.status(error === 'story_not_published' ? 403 : 404).json({ error });

  const profile = await loadProfile(supabase, user.id);
  const conversation = await getOrCreateConversation(supabase, user.id, storyId, story.title);
  const messages = await getConversationMessages(supabase, conversation.id);
  const freeUsed = await hasUsedFreeStoryAnswer(supabase, user.id, storyId);

  return res.status(200).json({
    conversation,
    messages,
    credits: profile.ai_credit_balance || 0,
    is_paid: isPaidProfile(profile),
    free_available: !isPaidProfile(profile) && !freeUsed,
    depth_costs: Object.fromEntries(Object.entries(TODDY_DEPTHS).map(([key, value]) => [key, value.credits]))
  });
}

export async function handleToddyPost(req, res) {
  const supabase = createSupabaseAdmin();
  const { user, error: authError } = await authenticateUser(req, supabase);
  if (authError) return res.status(401).json({ error: authError });

  const { story_id: storyId, message, depth = 'basic' } = req.body || {};
  if (!storyId || !message) return res.status(400).json({ error: 'story_id_and_message_required' });
  if (!TODDY_DEPTHS[depth]) return res.status(400).json({ error: 'invalid_depth' });

  const { story, context, sourcesUsed, error } = await buildToddyStoryContext(supabase, storyId, depth, message);
  if (error) return res.status(error === 'story_not_published' ? 403 : 404).json({ error });

  const profile = await loadProfile(supabase, user.id);
  const paid = isPaidProfile(profile);
  const creditsNeeded = paid ? TODDY_DEPTHS[depth].credits : 0;
  const freeUsed = await hasUsedFreeStoryAnswer(supabase, user.id, storyId);

  if (!paid && freeUsed) {
    return res.status(402).json({ error: 'free_limit_used', message: 'La consulta gratuita de Toddy para esta noticia ya se ha usado.' });
  }

  if (paid && (profile.ai_credit_balance || 0) < creditsNeeded) {
    return res.status(402).json({ error: 'insufficient_credits', credits_required: creditsNeeded, credits_available: profile.ai_credit_balance || 0 });
  }

  const conversation = await getOrCreateConversation(supabase, user.id, storyId, story.title);
  await supabase
    .from('toddy_conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversation.id);

  await supabase.from('toddy_messages').insert({
    conversation_id: conversation.id,
    user_id: user.id,
    story_id: storyId,
    role: 'user',
    content: message,
    depth,
    status: 'completed'
  });
  const conversationHistory = await getConversationMessages(supabase, conversation.id);

  setSseHeaders(res);
  for (const state of STATUS_STEPS) {
    writeSse(res, 'status', { state });
    await new Promise((resolve) => setTimeout(resolve, 90));
  }

  try {
    const llm = await callAnthropic({ context, message, depth, conversationHistory });
    const { data: assistantMessage, error: insertError } = await supabase
      .from('toddy_messages')
      .insert({
        conversation_id: conversation.id,
        user_id: user.id,
        story_id: storyId,
        role: 'assistant',
        content: llm.content,
        depth,
        thinking_states: STATUS_STEPS,
        sources_used: sourcesUsed,
        token_usage: llm.tokenUsage,
        credits_charged: creditsNeeded,
        model: llm.model,
        status: llm.confidence < 0.75 ? 'low_confidence' : 'completed',
        confidence: llm.confidence
      })
      .select('id')
      .single();

    if (insertError) throw insertError;

    if (creditsNeeded > 0) {
      const { data: consumed, error: consumeError } = await supabase.rpc('consume_ai_credits', {
        p_user_id: user.id,
        p_amount: creditsNeeded,
        p_reason: `toddy_${depth}`,
        p_story_id: storyId,
        p_message_id: assistantMessage.id,
        p_metadata: { model: llm.model, prompt_version: TODDY_PROMPT_VERSION, token_usage: llm.tokenUsage }
      });
      if (consumeError || consumed !== true) throw consumeError || new Error('credit_consume_failed');
    } else {
      await supabase.rpc('consume_ai_credits', {
        p_user_id: user.id,
        p_amount: 0,
        p_reason: 'toddy_free_story_answer',
        p_story_id: storyId,
        p_message_id: assistantMessage.id,
        p_metadata: { model: llm.model, prompt_version: TODDY_PROMPT_VERSION, token_usage: llm.tokenUsage }
      });
    }

    await streamText(res, llm.content);
    writeSse(res, 'done', {
      conversation_id: conversation.id,
      message_id: assistantMessage.id,
      credits_charged: creditsNeeded,
      sources_used: sourcesUsed,
      token_usage: llm.tokenUsage,
      model: llm.model
    });
    res.end();
  } catch (llmError) {
    console.error('Toddy error:', llmError);
    writeSse(res, 'error', { error: 'toddy_generation_failed', message: llmError.message });
    res.end();
  }
}
