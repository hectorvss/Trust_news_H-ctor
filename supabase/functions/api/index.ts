// Trust News API (TNA) — REST + MCP for LLM agents. Self-contained Edge Function.
// Auth: personal API keys (Authorization: Bearer tnf_live_...). Reads Postgres
// with the service role; the gateway enforces access + per-key daily limits.
// Tiers (from create_api_key, derived from the user's subscription):
//   free → discovery only · premium/elite/business → full intelligence suite.
import { createClient } from 'jsr:@supabase/supabase-js@2';

const db = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const SITE = 'https://trustnews.es';
const OPENAI_KEY = Deno.env.get('OPENAI_API_KEY') ?? '';
const OPENAI_MODEL = Deno.env.get('OPENAI_MODEL') ?? 'gpt-4o-mini';
const EMBED_MODEL = Deno.env.get('OPENAI_EMBEDDING_MODEL') ?? 'text-embedding-3-small';
const PREMIUM_TIERS = ['premium', 'pro', 'elite', 'business'];

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, apikey',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

async function sha256hex(s: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
const clampInt = (v: string | null, def: number, lo: number, hi: number) =>
  Math.min(Math.max(parseInt(v || String(def), 10) || def, lo), hi);
const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

// ── mappers ──
function toCoverage(s: any) {
  const cl = Number(s.coverage_left) || 0, cc = Number(s.coverage_center) || 0, cr = Number(s.coverage_right) || 0;
  const sum = cl + cc + cr;
  if (sum > 0) return { left: Math.round(cl / sum * 100), center: Math.round(cc / sum * 100), right: Math.round(cr / sum * 100), _from: 'pipeline' };
  const b = s.bias && typeof s.bias === 'object' ? s.bias : null;
  if (b) {
    const bl = Number(b.left) || 0, bc = Number(b.center) || 0, br = Number(b.right) || 0, bs = bl + bc + br;
    if (bs > 0) return { left: Math.round(bl / bs * 100), center: Math.round(bc / bs * 100), right: Math.round(br / bs * 100), _from: 'editorial' };
  }
  return null;
}
function dominant(cov: any) {
  if (!cov) return { lean: null, pct: 0 };
  const e = [['left', cov.left], ['center', cov.center], ['right', cov.right]].sort((a: any, b: any) => b[1] - a[1])[0];
  return { lean: e[0], pct: e[1] };
}
function perspectives(s: any) {
  const raw = s.consenso_narrativo || s.consensus_narrative || '';
  if (!raw) return null;
  const parts = String(raw).split('|').map((p: string) => p.trim());
  if (parts.length >= 3 && parts.some(Boolean)) return { left: parts[0] || null, center: parts[1] || null, right: parts[2] || null };
  return { consensus: raw };
}
const leanName = (b: string) => { const v = String(b || '').toUpperCase(); return v === 'LEFT' ? 'left' : v === 'RIGHT' ? 'right' : 'center'; };

function toStory(s: any, detail = false) {
  const cov = toCoverage(s);
  const dom = dominant(cov);
  const total = (s.sources_count || s.source_count || (Array.isArray(s.articles) ? s.articles.length : 0)) || 0;
  const base: any = {
    id: s.id, title: s.title, summary: s.summary ?? null, category: s.category ?? null,
    image_url: s.image_url ?? null, location: s.location ?? null, status: s.status, source_count: total,
    coverage: cov ? { left: cov.left, center: cov.center, right: cov.right } : null,
    dominant_lean: dom.lean, dominant_lean_pct: dom.pct,
    factuality: s.factuality ?? null, consensus: s.consensus ?? null, blind_spot: s.blind_spot ?? null,
    published_at: s.published_at ?? s.created_at ?? null, updated_at: s.updated_at ?? null,
    url: `${SITE}/story/${s.id}`,
  };
  if (!detail) return base;
  return {
    ...base, impact: s.impact ?? null,
    perspectives: perspectives(s), analytical_snippet: s.analytical_snippet ?? null,
    full_content: s.full_content ?? null, context: s.contexto ?? null, verification: s.verificacion_info ?? null,
    key_figures: Array.isArray(s.cifras_clave) ? s.cifras_clave : (Array.isArray(s.key_figures) ? s.key_figures : []),
    social_impact: Array.isArray(s.impacto_social) ? s.impacto_social : [],
    systemic_impact: Array.isArray(s.impacto_sistemico) ? s.impacto_sistemico : [],
    disputed_claims: Array.isArray(s.disputed_claims) ? s.disputed_claims : [],
    articles: Array.isArray(s.articles) ? s.articles.map((a: any) => ({
      title: a.title ?? null, source: a.source ?? null, lean: leanName(a.bias),
      url: a.url ?? a.source_url ?? null, type: a.type ?? null, tone: a.tone ?? null, author: a.author ?? null,
      excerpt: a.excerpt ?? a.summary ?? null, published_at: a.published_at ?? a.time ?? null,
    })) : [],
    coverage_source: cov?._from ?? null,
  };
}
function toSource(s: any) {
  return {
    id: s.id, name: s.nombre || s.name || s.id, bias_label: s.bias_label ?? null,
    bias_score: typeof s.bias_score === 'number' ? s.bias_score : (typeof s.bias === 'number' ? s.bias : null),
    factuality: s.factuality ?? null, ownership: s.ownership ?? s.ownership_category ?? null,
    country: s.pais || s.country || null, url: s.url ?? null, logo_url: s.logo_url ?? null,
  };
}
function toContext(s: any) {
  const cov = toCoverage(s);
  const p = perspectives(s);
  return {
    id: s.id, title: s.title, date: s.published_at ?? s.created_at ?? null, category: s.category ?? null,
    summary: s.summary ?? null,
    consensus: (p && 'consensus' in p) ? (p as any).consensus : (s.analytical_snippet ?? null),
    perspectives: (p && !('consensus' in p)) ? p : null,
    bias_distribution: cov ? { left: cov.left, center: cov.center, right: cov.right } : null,
    blind_spot: s.blind_spot ?? null, factuality: s.factuality ?? null,
    key_figures: Array.isArray(s.cifras_clave) ? s.cifras_clave : [],
    sources: Array.isArray(s.articles)
      ? [...new Map((s.articles as any[]).map((a) => [a.source, { name: a.source ?? null, lean: leanName(a.bias) }])).values()]
      : [],
    source_count: (s.sources_count || s.source_count || (Array.isArray(s.articles) ? s.articles.length : 0)) || 0,
    url: `${SITE}/story/${s.id}`,
    confidence: cov?._from === 'pipeline' ? 'high' : (cov ? 'medium' : 'low'),
  };
}

const STORY_COLS = 'id,title,summary,category,image_url,location,status,source_count,sources_count,coverage_left,coverage_center,coverage_right,bias,factuality,consensus,impact,blind_spot,contexto,verificacion_info,full_content,consenso_narrativo,consensus_narrative,analytical_snippet,cifras_clave,key_figures,impacto_social,impacto_sistemico,disputed_claims,articles,published_at,created_at,updated_at';
const wantStatus = (want: string | null | undefined, canDrafts: boolean) =>
  (canDrafts && (want === 'all' || want === 'draft')) ? want! : 'published';

async function embedQuery(text: string): Promise<number[] | null> {
  if (!OPENAI_KEY) return null;
  try {
    const res = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST', headers: { 'Authorization': `Bearer ${OPENAI_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: EMBED_MODEL, input: text.slice(0, 1600) }),
    });
    if (!res.ok) return null;
    const j = await res.json();
    return j.data?.[0]?.embedding ?? null;
  } catch { return null; }
}

const STOP = new Set(['para','como','sobre','entre','desde','hasta','pero','porque','cuando','donde','este','esta','estos','estas','unos','unas','tras','ante','según','contra','muy','más','menos','todo','todos','toda','todas','ser','está','han','han','han','the','and','los','las','del','por','con','sin','una','uno','que','del','sus','sus']);
function keywords(text: string): string[] {
  return String(text || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9áéíóúñ\s]/gi, ' ').split(/\s+/)
    .filter((w) => w.length >= 4 && !STOP.has(w));
}

// ── shared data ops (used by REST + MCP) ──
async function opListStories(p: any, canDrafts: boolean) {
  const limit = Math.min(Math.max(p.limit || 20, 1), 100);
  const offset = Math.max(p.offset || 0, 0);
  const want = wantStatus(p.status, canDrafts);
  let query = db.from('stories').select(STORY_COLS).order('published_at', { ascending: false, nullsFirst: false }).range(offset, offset + limit - 1);
  if (want !== 'all') query = query.eq('status', want);
  if (p.category) query = query.ilike('category', `%${p.category}%`);
  if (p.q) query = query.or(`title.ilike.%${p.q}%,summary.ilike.%${p.q}%`);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  let items = (data || []).map((s) => toStory(s));
  if (p.lean) items = items.filter((s) => s.dominant_lean === p.lean);
  return { object: 'list', count: items.length, limit, offset, data: items };
}
async function opGetStoryRow(id: string, canDrafts: boolean) {
  const { data: s, error } = await db.from('stories').select(STORY_COLS).eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  if (!s) return null;
  if (s.status !== 'published' && !canDrafts) return null;
  return s;
}
async function opBlindspots(p: any, canDrafts: boolean) {
  const threshold = Math.min(Math.max(p.threshold || 15, 0), 40);
  const want = wantStatus(p.status, canDrafts);
  let query = db.from('stories').select(STORY_COLS).order('published_at', { ascending: false, nullsFirst: false }).limit(200);
  if (want !== 'all') query = query.eq('status', want);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  const mapped = (data || []).map((s) => toStory(s)).filter((s) => s.coverage);
  const left: any[] = [], right: any[] = [];
  for (const s of mapped) {
    const c = s.coverage!;
    if (c.left <= threshold && c.left <= c.right) left.push({ ...s, blindspot_side: 'left', side_pct: c.left });
    else if (c.right <= threshold && c.right < c.left) right.push({ ...s, blindspot_side: 'right', side_pct: c.right });
  }
  return { threshold, for_the_left: left.slice(0, 25), for_the_right: right.slice(0, 25) };
}
async function opSources() {
  const { data, error } = await db.from('sources').select('*').eq('activo', true).order('nombre', { ascending: true });
  if (error) throw new Error(error.message);
  const seen = new Set<string>();
  const items = (data || []).filter((s: any) => { const k = (s.nombre || s.name || s.id || '').toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; }).map(toSource);
  return { object: 'list', count: items.length, data: items };
}
async function opSearch(q: string, limit: number, canDrafts: boolean) {
  const embedding = await embedQuery(q);
  if (embedding) {
    const { data: matches, error } = await db.rpc('match_stories', { query_embedding: embedding, match_count: limit, allow_drafts: canDrafts });
    if (!error && matches && matches.length) {
      const ids = matches.map((m: any) => m.story_id);
      const { data: stories } = await db.from('stories').select(STORY_COLS).in('id', ids);
      const byId = new Map((stories || []).map((s: any) => [s.id, s]));
      const items = matches.map((m: any) => { const s = byId.get(m.story_id); if (!s) return null; return { ...toStory(s), similarity: Math.round((m.similarity || 0) * 1000) / 1000 }; }).filter(Boolean);
      return { object: 'list', mode: 'semantic', query: q, count: items.length, data: items };
    }
  }
  const { data, error } = await db.from('stories').select(STORY_COLS).or(`title.ilike.%${q}%,summary.ilike.%${q}%,category.ilike.%${q}%`).order('published_at', { ascending: false, nullsFirst: false }).limit(limit).eq('status', 'published');
  if (error) throw new Error(error.message);
  return { object: 'list', mode: 'keyword', query: q, count: (data || []).length, data: (data || []).map((s) => toStory(s)) };
}

// ── PREMIUM ops ──
async function opCategories() {
  const { data, error } = await db.from('stories').select('category').eq('status', 'published').limit(2000);
  if (error) throw new Error(error.message);
  const counts: Record<string, number> = {};
  for (const r of (data || [])) { const c = r.category || 'GENERAL'; counts[c] = (counts[c] || 0) + 1; }
  return { object: 'list', data: Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([category, count]) => ({ category, count })) };
}
async function opFullAnalysis(id: string, canDrafts: boolean) {
  const s = await opGetStoryRow(id, canDrafts);
  return s ? toStory(s, true) : { error: 'not_found' };
}
async function opCompareCoverage(id: string, canDrafts: boolean) {
  const s = await opGetStoryRow(id, canDrafts);
  if (!s) return { error: 'not_found' };
  const arts = Array.isArray(s.articles) ? s.articles : [];
  const outlets = arts.map((a: any) => ({
    source: a.source ?? null, lean: leanName(a.bias), type: a.type ?? null, tone: a.tone ?? null,
    author: a.author ?? null, angle: a.angle ?? null, emphasis: a.diff ?? null, takeaway: a.whyOpened ?? null,
    summary: a.summary ?? a.excerpt ?? null, url: a.url ?? null,
  }));
  const by = (l: string) => outlets.filter((o) => o.lean === l);
  return {
    id: s.id, title: s.title, coverage: toCoverage(s), consensus: s.consensus ?? null,
    blind_spot: s.blind_spot ?? null,
    by_lean: { left: by('left'), center: by('center'), right: by('right') },
    outlets,
  };
}
async function opSourcePiece(id: string, source: string, canDrafts: boolean) {
  const s = await opGetStoryRow(id, canDrafts);
  if (!s) return { error: 'not_found' };
  const arts = Array.isArray(s.articles) ? s.articles : [];
  const want = String(source || '').toLowerCase().trim();
  const a = arts.find((x: any) => String(x.source || '').toLowerCase() === want)
    || arts.find((x: any) => String(x.source || '').toLowerCase().includes(want));
  if (!a) return { error: 'source_not_found', available: arts.map((x: any) => x.source) };
  const rc = a.readerContent || {};
  return {
    story_id: s.id, story_title: s.title, source: a.source, lean: leanName(a.bias),
    type: a.type ?? null, tone: a.tone ?? null, author: a.author ?? null, url: a.url ?? null,
    body: Array.isArray(rc.body) ? rc.body : [],
    quote: (rc.claims && rc.claims[0]) ? rc.claims[0] : null,
    unique_contribution: rc.blindSpot ?? a.whyOpened ?? null,
    angle: a.angle ?? null, emphasis: a.diff ?? null,
  };
}
async function opBlindspotNarrative(id: string, canDrafts: boolean) {
  const s = await opGetStoryRow(id, canDrafts);
  if (!s) return { error: 'not_found' };
  const cov = toCoverage(s);
  const p = perspectives(s);
  const per: any = (p && !('consensus' in p)) ? p : {};
  const sides = cov ? [['left', cov.left], ['center', cov.center], ['right', cov.right]].sort((a: any, b: any) => a[1] - b[1]) : [];
  const missing = sides[0] ? sides[0][0] : null;
  return {
    id: s.id, title: s.title, coverage: cov,
    least_covered_side: missing, least_covered_pct: sides[0] ? sides[0][1] : null,
    blind_spot: s.blind_spot ?? null,
    what_the_missing_side_would_say: missing ? (per[missing] || 'Sin cobertura registrada de este lado en la historia.') : null,
    present_narratives: per,
  };
}
async function opRelatedStories(id: string, limit: number, canDrafts: boolean) {
  const s = await opGetStoryRow(id, canDrafts);
  if (!s) return { error: 'not_found' };
  const kw = new Set(keywords(`${s.title} ${s.summary || ''}`));
  const { data } = await db.from('stories').select(STORY_COLS).eq('status', 'published').neq('id', id).order('published_at', { ascending: false, nullsFirst: false }).limit(150);
  const scored = (data || []).map((x: any) => {
    const xkw = keywords(`${x.title} ${x.summary || ''}`);
    let overlap = 0; for (const w of xkw) if (kw.has(w)) overlap++;
    const catBonus = x.category && s.category && x.category === s.category ? 2 : 0;
    return { s: x, score: overlap + catBonus };
  }).filter((r) => r.score > 0).sort((a, b) => b.score - a.score).slice(0, limit);
  return { id: s.id, object: 'list', count: scored.length, data: scored.map((r) => ({ ...toStory(r.s), relevance: r.score })) };
}
async function opCoverageTrends(topic: string, days: number) {
  const since = new Date(Date.now() - Math.min(Math.max(days, 1), 120) * 86400000).toISOString();
  let q = db.from('stories').select('id,title,category,coverage_left,coverage_center,coverage_right,source_count,sources_count,published_at').eq('status', 'published').gte('published_at', since).order('published_at', { ascending: true }).limit(1000);
  if (topic) q = q.or(`title.ilike.%${topic}%,summary.ilike.%${topic}%,category.ilike.%${topic}%`);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  const buckets: Record<string, { n: number; l: number; c: number; r: number }> = {};
  let agg = { n: 0, l: 0, c: 0, r: 0 };
  for (const s of (data || [])) {
    const cov = toCoverage(s); if (!cov) continue;
    const day = String(s.published_at).slice(0, 10);
    (buckets[day] ||= { n: 0, l: 0, c: 0, r: 0 });
    buckets[day].n++; buckets[day].l += cov.left; buckets[day].c += cov.center; buckets[day].r += cov.right;
    agg.n++; agg.l += cov.left; agg.c += cov.center; agg.r += cov.right;
  }
  const series = Object.entries(buckets).map(([date, b]) => ({ date, stories: b.n, avg_coverage: { left: Math.round(b.l / b.n), center: Math.round(b.c / b.n), right: Math.round(b.r / b.n) } }));
  return {
    topic: topic || null, window_days: days, total_stories: agg.n,
    avg_coverage: agg.n ? { left: Math.round(agg.l / agg.n), center: Math.round(agg.c / agg.n), right: Math.round(agg.r / agg.n) } : null,
    series,
  };
}
async function opTrendingTopics(days: number) {
  const since = new Date(Date.now() - Math.min(Math.max(days, 1), 30) * 86400000).toISOString();
  const { data, error } = await db.from('stories').select('id,title,category,coverage_left,coverage_center,coverage_right,source_count,sources_count,published_at').eq('status', 'published').gte('published_at', since).order('source_count', { ascending: false, nullsFirst: false }).limit(300);
  if (error) throw new Error(error.message);
  const byCat: Record<string, { n: number; l: number; c: number; r: number }> = {};
  for (const s of (data || [])) {
    const cov = toCoverage(s); const cat = s.category || 'GENERAL';
    (byCat[cat] ||= { n: 0, l: 0, c: 0, r: 0 });
    byCat[cat].n++; if (cov) { byCat[cat].l += cov.left; byCat[cat].c += cov.center; byCat[cat].r += cov.right; }
  }
  const categories = Object.entries(byCat).sort((a, b) => b[1].n - a[1].n).map(([category, b]) => ({ category, stories: b.n, avg_coverage: b.n ? { left: Math.round(b.l / b.n), center: Math.round(b.c / b.n), right: Math.round(b.r / b.n) } : null }));
  const top = (data || []).slice(0, 10).map((s) => { const st: any = toStory(s); return { id: st.id, title: st.title, category: st.category, source_count: st.source_count, coverage: st.coverage, dominant_lean: st.dominant_lean }; });
  return { window_days: days, categories, top_stories: top };
}
async function opDailyBrief() {
  const { data } = await db.from('stories').select(STORY_COLS).eq('status', 'published').order('published_at', { ascending: false, nullsFirst: false }).limit(60);
  const stories = (data || []).map((s) => toStory(s));
  const date = stories[0]?.published_at ? String(stories[0].published_at).slice(0, 10) : new Date().toISOString().slice(0, 10);
  const headlines = stories.slice(0, 8).map((s) => ({ id: s.id, title: s.title, category: s.category, coverage: s.coverage, dominant_lean: s.dominant_lean, blind_spot: s.blind_spot, url: s.url }));
  const bs = await opBlindspots({ threshold: 15 }, false);
  return {
    date, total_published: stories.length, headlines,
    blindspots: { for_the_left: (bs.for_the_left || []).slice(0, 5).map((s: any) => ({ id: s.id, title: s.title })), for_the_right: (bs.for_the_right || []).slice(0, 5).map((s: any) => ({ id: s.id, title: s.title })) },
  };
}
const fold = (x: string) => String(x || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
async function opRateSource(query: string) {
  const q = String(query || '').trim();
  if (!q) return { error: 'bad_request', message: 'Indica el nombre o la URL de un medio.' };
  let needle = q;
  try { if (/^https?:\/\//i.test(q)) needle = new URL(q).hostname.replace(/^www\./, ''); } catch { /* */ }
  const nf = fold(needle);
  // Coincidencia sin acentos y por token, en cliente (catálogo pequeño).
  const { data: all } = await db.from('sources').select('*').eq('activo', true).limit(500);
  const cands = (all || []);
  let s = cands.find((x: any) => { const n = fold(x.nombre || x.name || ''); return n === nf || n.includes(nf) || nf.includes(n) || fold(x.url || '').includes(nf); });
  if (!s) return { found: false, query: q, message: 'Medio no encontrado en el catálogo de Trust News.' };
  const src = toSource(s);
  const factScore = ({ ALTA: 90, HIGH: 90, 'VERY HIGH': 95, MIXTA: 60, MIXED: 60, MEDIA: 60, MEDIUM: 60, BAJA: 30, LOW: 30 } as any)[String(src.factuality || '').toUpperCase()] ?? 55;
  const biasPenalty = typeof src.bias_score === 'number' ? Math.min(Math.abs(src.bias_score) * 2, 25) : 10;
  const trust_score = Math.max(0, Math.min(100, Math.round(factScore - biasPenalty)));
  return { found: true, ...src, trust_score };
}
async function opAnalyzeBias(input: string) {
  if (!OPENAI_KEY) return { error: 'unavailable', message: 'Analizador no configurado.' };
  let text = String(input || '').trim();
  let source_url: string | null = null;
  if (/^https?:\/\//i.test(text)) {
    source_url = text;
    try {
      const r = await fetch(text, { headers: { 'User-Agent': 'Mozilla/5.0 TrustNewsBot' } });
      const html = await r.text();
      text = html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 4000);
    } catch { return { error: 'fetch_failed', message: 'No se pudo leer la URL. Pega el texto del artículo.' }; }
  }
  if (text.length < 80) return { error: 'too_short', message: 'Aporta más texto (mínimo ~80 caracteres) o una URL válida.' };
  const prompt = `Analiza el sesgo político y el encuadre de este texto periodístico en español, de forma OBJETIVA y basándote solo en el texto. Devuelve SOLO JSON:
{"lean":"IZQUIERDA|CENTRO|DERECHA","confidence":0.0-1.0,"factual_tone":"ALTA|MIXTA|BAJA","framing":"1-2 frases sobre el encuadre","loaded_terms":["término cargado 1","..."],"summary":"resumen neutral de 1-2 frases"}

TEXTO:
${text.slice(0, 4000)}`;
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST', headers: { 'Authorization': `Bearer ${OPENAI_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: OPENAI_MODEL, temperature: 0.2, max_completion_tokens: 700, response_format: { type: 'json_object' }, messages: [{ role: 'user', content: prompt }] }),
    });
    if (!res.ok) return { error: 'analyze_failed', message: `Analizador: ${res.status}` };
    const j = await res.json();
    let parsed: any = {};
    try { parsed = JSON.parse(j.choices?.[0]?.message?.content || '{}'); } catch { /* */ }
    return { source_url, lean: parsed.lean ?? null, confidence: parsed.confidence ?? null, factual_tone: parsed.factual_tone ?? null, framing: parsed.framing ?? null, loaded_terms: Array.isArray(parsed.loaded_terms) ? parsed.loaded_terms : [], summary: parsed.summary ?? null };
  } catch (e) { return { error: 'analyze_failed', message: String(e) }; }
}

// ── webhooks (management; delivery runs from the pipeline when active) ──
async function opCreateWebhook(key: any, body: any) {
  const url = String(body?.url || '').trim();
  if (!/^https?:\/\//i.test(url)) return { error: 'bad_request', message: 'url debe ser http(s).' };
  const event = ['new_story', 'blindspot', 'topic_match'].includes(body?.event) ? body.event : 'new_story';
  const topic = body?.topic ? String(body.topic).slice(0, 120) : null;
  const { data, error } = await db.from('api_webhooks').insert({ user_id: key.user_id, api_key_id: key.id, url, event, topic }).select('id, url, event, topic, active, created_at').single();
  if (error) throw new Error(error.message);
  return { object: 'webhook', ...data };
}
async function opListWebhooks(key: any) {
  const { data, error } = await db.from('api_webhooks').select('id, url, event, topic, active, created_at, last_delivery_at').eq('api_key_id', key.id).order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return { object: 'list', count: (data || []).length, data: data || [] };
}
async function opDeleteWebhook(key: any, id: string) {
  const { error } = await db.from('api_webhooks').delete().eq('id', id).eq('api_key_id', key.id);
  if (error) throw new Error(error.message);
  return { deleted: true, id };
}
async function opTestWebhook(key: any, id: string) {
  const { data: w } = await db.from('api_webhooks').select('*').eq('id', id).eq('api_key_id', key.id).maybeSingle();
  if (!w) return { error: 'not_found' };
  try {
    const r = await fetch(w.url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'test', message: 'Webhook de prueba de Trust News API', at: new Date().toISOString() }) });
    await db.from('api_webhooks').update({ last_delivery_at: new Date().toISOString() }).eq('id', id);
    return { delivered: true, status: r.status };
  } catch (e) { return { delivered: false, error: String(e) }; }
}

// ── auth ──
async function authenticate(req: Request) {
  const h = req.headers.get('authorization') || '';
  const m = h.match(/^Bearer\s+(.+)$/i);
  if (!m) return { ok: false as const, status: 401, error: 'unauthorized', message: 'Missing API key. Use: Authorization: Bearer tnf_live_...' };
  const hash = await sha256hex(m[1].trim());
  const { data: key, error } = await db.from('api_keys').select('*').eq('key_hash', hash).is('revoked_at', null).maybeSingle();
  if (error) return { ok: false as const, status: 500, error: 'server_error', message: error.message };
  if (!key) return { ok: false as const, status: 401, error: 'unauthorized', message: 'Invalid or revoked API key.' };
  const today = new Date().toISOString().slice(0, 10);
  const usage = key.usage_date === today ? (key.usage_count || 0) : 0;
  if (usage >= (key.daily_limit || 1000)) return { ok: false as const, status: 429, error: 'rate_limited', message: `Daily limit of ${key.daily_limit} requests reached.` };
  db.from('api_keys').update({ usage_date: today, usage_count: usage + 1, total_requests: (key.total_requests || 0) + 1, last_used_at: new Date().toISOString() }).eq('id', key.id).then(() => {});
  return { ok: true as const, key };
}
const isPremiumKey = (key: any) => PREMIUM_TIERS.includes(String(key.tier || '').toLowerCase());
const UPGRADE = { error: 'upgrade_required', message: 'Función premium. Requiere una API key de un plan Premium/Elite (mejora tu suscripción en trustnews.es).' };

// ── MCP ──
const FREE_TOOLS = [
  { name: 'search_news', description: 'Search Spanish/world news by topic (semantic + keyword). Returns stories with bias/coverage analysis.', inputSchema: { type: 'object', properties: { query: { type: 'string' }, limit: { type: 'integer', default: 10 } }, required: ['query'] } },
  { name: 'list_stories', description: 'List recent published stories, optionally by category or dominant lean (left/center/right).', inputSchema: { type: 'object', properties: { category: { type: 'string' }, lean: { type: 'string', enum: ['left', 'center', 'right'] }, limit: { type: 'integer', default: 20 } } } },
  { name: 'get_story', description: 'Get a story: summary, coverage %, dominant lean, factuality, blind spot and its source list.', inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] } },
  { name: 'list_categories', description: 'List categories with the number of published stories in each.', inputSchema: { type: 'object', properties: {} } },
  { name: 'list_sources', description: 'Source catalog with media-bias, factuality and ownership ratings.', inputSchema: { type: 'object', properties: {} } },
  { name: 'rate_source', description: 'Bias, factuality, ownership and a trust score for a given outlet (name or URL).', inputSchema: { type: 'object', properties: { source: { type: 'string' } }, required: ['source'] } },
];
const PREMIUM_TOOL_DEFS = [
  { name: 'full_analysis', description: 'PREMIUM. Full editorial analysis of a story: body, context, verification, key figures, impacts and every source.', inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] } },
  { name: 'compare_coverage', description: 'PREMIUM. Side-by-side of how each outlet frames the SAME story: angle, tone, what each emphasizes/omits, grouped by lean.', inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] } },
  { name: 'get_source_piece', description: 'PREMIUM. Trust News\' own developed piece for one outlet\'s take on a story (paragraphs, quote, unique contribution).', inputSchema: { type: 'object', properties: { id: { type: 'string' }, source: { type: 'string' } }, required: ['id', 'source'] } },
  { name: 'get_story_context', description: 'PREMIUM. LLM-ready context bundle: consensus, per-side perspectives, bias distribution, blind spot, sources.', inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] } },
  { name: 'list_blindspots', description: 'PREMIUM. Stories under-reported by one side (blindspots for the left / for the right).', inputSchema: { type: 'object', properties: { threshold: { type: 'integer', default: 15 } } } },
  { name: 'blindspot_narrative', description: 'PREMIUM. For a story, the least-covered side and what that missing perspective would say.', inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] } },
  { name: 'related_stories', description: 'PREMIUM. Stories related to a given one by topic and category.', inputSchema: { type: 'object', properties: { id: { type: 'string' }, limit: { type: 'integer', default: 8 } }, required: ['id'] } },
  { name: 'coverage_trends', description: 'PREMIUM. Volume and left/center/right coverage balance for a topic over time.', inputSchema: { type: 'object', properties: { topic: { type: 'string' }, days: { type: 'integer', default: 30 } } } },
  { name: 'trending_topics', description: 'PREMIUM. What is hot now by category, with coverage balance and top stories.', inputSchema: { type: 'object', properties: { days: { type: 'integer', default: 7 } } } },
  { name: 'daily_brief', description: 'PREMIUM. Today\'s synthesized brief: top headlines and the day\'s blindspots.', inputSchema: { type: 'object', properties: {} } },
  { name: 'analyze_bias', description: 'PREMIUM. Analyze the political lean and framing of an EXTERNAL article (paste text or a URL).', inputSchema: { type: 'object', properties: { input: { type: 'string', description: 'Article text or URL.' } }, required: ['input'] } },
];
const PREMIUM_TOOL_NAMES = new Set(PREMIUM_TOOL_DEFS.map((t) => t.name));
const ALL_TOOLS = [...FREE_TOOLS, ...PREMIUM_TOOL_DEFS];

async function mcpCallTool(name: string, args: any, key: any) {
  const canDrafts = (key.scopes || []).includes('drafts');
  if (PREMIUM_TOOL_NAMES.has(name) && !isPremiumKey(key)) return UPGRADE;
  switch (name) {
    // free
    case 'search_news': return await opSearch(String(args.query || ''), Math.min(Math.max(args.limit || 10, 1), 50), canDrafts);
    case 'list_stories': return await opListStories({ category: args.category, lean: args.lean, limit: args.limit || 20 }, canDrafts);
    case 'get_story': { const s = await opGetStoryRow(String(args.id), canDrafts); return s ? toStory(s) : { error: 'not_found' }; }
    case 'list_categories': return await opCategories();
    case 'list_sources': return await opSources();
    case 'rate_source': return await opRateSource(String(args.source || ''));
    // premium
    case 'full_analysis': return await opFullAnalysis(String(args.id), canDrafts);
    case 'compare_coverage': return await opCompareCoverage(String(args.id), canDrafts);
    case 'get_source_piece': return await opSourcePiece(String(args.id), String(args.source || ''), canDrafts);
    case 'get_story_context': { const s = await opGetStoryRow(String(args.id), canDrafts); return s ? toContext(s) : { error: 'not_found' }; }
    case 'list_blindspots': return await opBlindspots({ threshold: args.threshold }, canDrafts);
    case 'blindspot_narrative': return await opBlindspotNarrative(String(args.id), canDrafts);
    case 'related_stories': return await opRelatedStories(String(args.id), Math.min(Math.max(args.limit || 8, 1), 20), canDrafts);
    case 'coverage_trends': return await opCoverageTrends(String(args.topic || ''), args.days || 30);
    case 'trending_topics': return await opTrendingTopics(args.days || 7);
    case 'daily_brief': return await opDailyBrief();
    case 'analyze_bias': return await opAnalyzeBias(String(args.input || ''));
    default: throw new Error(`Unknown tool: ${name}`);
  }
}

async function handleMcp(req: Request, key: any) {
  let msg: any = {};
  try { msg = await req.json(); } catch { /* */ }
  const rpc = (result: any) => json({ jsonrpc: '2.0', id: msg.id ?? null, result });
  const rpcErr = (code: number, message: string) => json({ jsonrpc: '2.0', id: msg.id ?? null, error: { code, message } });
  try {
    if (msg.method === 'initialize') {
      return rpc({ protocolVersion: msg.params?.protocolVersion || '2025-06-18', capabilities: { tools: { listChanged: false } }, serverInfo: { name: 'trust-news', version: '2.0.0' }, instructions: 'Trust News España API: noticias con análisis de sesgo/cobertura, comparación entre medios, puntos ciegos y análisis de artículos externos. Herramientas premium requieren API key de plan Premium/Elite.' });
    }
    if (typeof msg.method === 'string' && msg.method.startsWith('notifications/')) return new Response(null, { status: 202, headers: cors });
    if (msg.method === 'ping') return rpc({});
    if (msg.method === 'tools/list') return rpc({ tools: ALL_TOOLS });
    if (msg.method === 'tools/call') {
      const data = await mcpCallTool(msg.params?.name, msg.params?.arguments || {}, key);
      const isErr = data && typeof data === 'object' && 'error' in data;
      return rpc({ content: [{ type: 'text', text: JSON.stringify(data, null, 2) }], isError: !!isErr });
    }
    if (msg.method === 'resources/list') return rpc({ resources: [] });
    if (msg.method === 'prompts/list') return rpc({ prompts: [] });
    return rpcErr(-32601, `Method not found: ${msg.method}`);
  } catch (e) {
    return rpcErr(-32603, String(e));
  }
}

const OPENAPI = {
  openapi: '3.1.0',
  info: { title: 'Trust News API', version: '2.0.0', description: 'News with media-bias, coverage & blindspot analysis for apps and LLM agents.' },
  servers: [{ url: 'https://xwkqtugupzpdnnvxrkyu.supabase.co/functions/v1/api' }],
  paths: {
    '/v1/stories': { get: { summary: 'List published stories' } },
    '/v1/stories/{id}': { get: { summary: 'Get a story (summary + coverage)' } },
    '/v1/stories/{id}/full': { get: { summary: 'PREMIUM. Full editorial analysis' } },
    '/v1/stories/{id}/compare': { get: { summary: 'PREMIUM. Per-outlet coverage comparison' } },
    '/v1/stories/{id}/source': { get: { summary: 'PREMIUM. One outlet\'s developed piece (?source=)' } },
    '/v1/stories/{id}/context': { get: { summary: 'PREMIUM. LLM-ready context bundle' } },
    '/v1/stories/{id}/blindspot': { get: { summary: 'PREMIUM. Least-covered side + missing narrative' } },
    '/v1/stories/{id}/related': { get: { summary: 'PREMIUM. Related stories' } },
    '/v1/blindspots': { get: { summary: 'PREMIUM. Stories under-reported by one side' } },
    '/v1/trends': { get: { summary: 'PREMIUM. Coverage volume/balance over time (?topic=&days=)' } },
    '/v1/trending': { get: { summary: 'PREMIUM. Trending topics by category' } },
    '/v1/daily-brief': { get: { summary: 'PREMIUM. Today\'s brief + blindspots' } },
    '/v1/analyze': { post: { summary: 'PREMIUM. Analyze bias of external text/URL' } },
    '/v1/sources': { get: { summary: 'Source catalog with bias ratings' } },
    '/v1/sources/rate': { get: { summary: 'Rate a source (?source=)' } },
    '/v1/search': { get: { summary: 'Semantic + keyword search' } },
    '/v1/categories': { get: { summary: 'Categories with counts' } },
    '/v1/webhooks': { get: { summary: 'PREMIUM. List webhooks' }, post: { summary: 'PREMIUM. Create webhook' } },
    '/mcp': { post: { summary: 'MCP JSON-RPC endpoint (initialize, tools/list, tools/call)' } },
  },
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  const url = new URL(req.url);
  const iv = url.pathname.indexOf('/v1');
  const im = url.pathname.indexOf('/mcp');
  const isMcp = im >= 0;
  const path = isMcp ? '/mcp' : (iv >= 0 ? url.pathname.slice(iv) : url.pathname);
  const seg = path.split('/').filter(Boolean);
  const qp = url.searchParams;

  if (path === '/' || path === '/v1' || path === '/v1/health') {
    return json({ ok: true, service: 'Trust News API', version: 'v2', docs: `${SITE}/developers`, mcp: `${SITE.replace('trustnews.es', 'xwkqtugupzpdnnvxrkyu.supabase.co/functions/v1/api')}/mcp` });
  }
  if (path === '/v1/openapi.json') return json(OPENAPI);

  const auth = await authenticate(req);
  if (!auth.ok) return json({ error: auth.error, message: auth.message }, auth.status);
  const key = auth.key;
  const canDrafts = (key.scopes || []).includes('drafts');
  const premium = isPremiumKey(key);
  const gate = () => premium ? null : json(UPGRADE, 402);

  if (isMcp) return await handleMcp(req, key);

  try {
    // stories
    if (seg[1] === 'stories' && !seg[2]) {
      return json(await opListStories({ limit: clampInt(qp.get('limit'), 20, 1, 100), offset: clampInt(qp.get('offset'), 0, 0, 1e9), status: qp.get('status'), category: qp.get('category'), q: qp.get('q'), lean: qp.get('lean') }, canDrafts));
    }
    if (seg[1] === 'stories' && seg[2]) {
      const sub = seg[3];
      if (sub === 'full') { return gate() || json(await opFullAnalysis(seg[2], canDrafts)); }
      if (sub === 'compare') { return gate() || json(await opCompareCoverage(seg[2], canDrafts)); }
      if (sub === 'source') { return gate() || json(await opSourcePiece(seg[2], qp.get('source') || '', canDrafts)); }
      if (sub === 'context') { return gate() || json(await (async () => { const s = await opGetStoryRow(seg[2], canDrafts); return s ? toContext(s) : { error: 'not_found' }; })()); }
      if (sub === 'blindspot') { return gate() || json(await opBlindspotNarrative(seg[2], canDrafts)); }
      if (sub === 'related') { return gate() || json(await opRelatedStories(seg[2], clampInt(qp.get('limit'), 8, 1, 20), canDrafts)); }
      const s = await opGetStoryRow(seg[2], canDrafts);
      if (!s) return json({ error: 'not_found', message: 'Story not found' }, 404);
      if (sub === 'coverage') { const st: any = toStory(s, true); return json({ id: st.id, coverage: st.coverage, dominant_lean: st.dominant_lean, dominant_lean_pct: st.dominant_lean_pct, factuality: st.factuality, source_count: st.source_count, blind_spot: st.blind_spot }); }
      return json(toStory(s)); // basic (free)
    }
    // blindspots / trends / trending / daily-brief (premium)
    if (seg[1] === 'blindspots') return gate() || json(await opBlindspots({ threshold: clampInt(qp.get('threshold'), 15, 0, 40), status: qp.get('status') }, canDrafts));
    if (seg[1] === 'trends') return gate() || json(await opCoverageTrends(qp.get('topic') || '', clampInt(qp.get('days'), 30, 1, 120)));
    if (seg[1] === 'trending') return gate() || json(await opTrendingTopics(clampInt(qp.get('days'), 7, 1, 30)));
    if (seg[1] === 'daily-brief') return gate() || json(await opDailyBrief());
    if (seg[1] === 'analyze') {
      if (!premium) return json(UPGRADE, 402);
      let inp = qp.get('input') || qp.get('url') || '';
      if (!inp && req.method === 'POST') { try { const b = await req.json(); inp = b.input || b.text || b.url || ''; } catch { /* */ } }
      return json(await opAnalyzeBias(inp));
    }
    // sources
    if (seg[1] === 'sources') {
      if (seg[2] === 'rate') return json(await opRateSource(qp.get('source') || ''));
      if (seg[2]) { const { data: s } = await db.from('sources').select('*').eq('id', seg[2]).maybeSingle(); return s ? json(toSource(s)) : json({ error: 'not_found', message: 'Source not found' }, 404); }
      return json(await opSources());
    }
    if (seg[1] === 'search') { const q = qp.get('q'); if (!q) return json({ error: 'bad_request', message: 'Missing ?q=' }, 400); return json(await opSearch(q, clampInt(qp.get('limit'), 10, 1, 50), canDrafts)); }
    if (seg[1] === 'categories') return json(await opCategories());
    // webhooks (premium)
    if (seg[1] === 'webhooks') {
      if (!premium) return json(UPGRADE, 402);
      if (seg[2] === 'test' && seg[3]) return json(await opTestWebhook(key, seg[3]));
      if (req.method === 'POST') { const b = await req.json().catch(() => ({})); return json(await opCreateWebhook(key, b)); }
      if (req.method === 'DELETE' && seg[2]) return json(await opDeleteWebhook(key, seg[2]));
      return json(await opListWebhooks(key));
    }
    return json({ error: 'not_found', message: `Unknown endpoint: ${path}`, path }, 404);
  } catch (e) {
    return json({ error: 'server_error', message: String(e) }, 500);
  }
});
