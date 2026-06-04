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

export async function buildToddyStoryContext(supabase, storyId, depth = 'basic') {
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
      origen: compactText(story.origen_info, 700),
      impacto_social: compactText(story.impacto_social, 700),
      impacto_sistemico: compactText(story.impacto_sistemico, 700),
      protagonistas: compactText(story.protagonistas_info, 700),
      preguntas_abiertas: compactText(story.preguntas_info, 700)
    },
    bias_distribution: biasDistribution,
    cifras_clave: extractArrayField(story.cifras_clave, 10),
    documentos: extractArrayField(story.documentos_info, 8),
    articles,
    source_count: story.source_count || story.sources_count || articles.length,
    editorial_validation: story.editorial_validation || {},
    generation_trace: trace
  };

  return { story, context, sourcesUsed: articles.map((a) => ({ article_id: a.article_id, source: a.source, url: a.url, bias: a.bias })) };
}

function buildToddyPrompt(context, message, depth) {
  const depthPolicy = TODDY_DEPTHS[depth] || TODDY_DEPTHS.basic;
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
        '- Distingue hechos, interpretaciones y dudas abiertas.',
        '- No modifiques la noticia ni publiques nada: sólo explica la story ya publicada.',
        '',
        'Contexto JSON:',
        JSON.stringify(context),
        '',
        `Pregunta del usuario: ${message}`
      ].join('\n')
    }
  ];
}

async function callAnthropic({ context, message, depth }) {
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
      max_tokens: depth === 'basic' ? 650 : depth === 'deep' ? 1100 : 1500,
      temperature: 0.2,
      system: 'Eres Toddy, el agente de Trust News. Ayudas al lector a entender una noticia publicada usando sólo evidencia editorial y fuentes proporcionadas.',
      messages: buildToddyPrompt(context, message, depth)
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

  const { story, context, sourcesUsed, error } = await buildToddyStoryContext(supabase, storyId, depth);
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

  setSseHeaders(res);
  for (const state of STATUS_STEPS) {
    writeSse(res, 'status', { state });
    await new Promise((resolve) => setTimeout(resolve, 90));
  }

  try {
    const llm = await callAnthropic({ context, message, depth });
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
