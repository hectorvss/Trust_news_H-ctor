// Trust News API (TNA) — REST + MCP for LLM agents. Self-contained Edge Function.
// Auth: personal API keys (Authorization: Bearer tnf_live_...). Reads Postgres
// with the service role; the gateway enforces access + per-key daily limits.
import { createClient } from 'jsr:@supabase/supabase-js@2';

const db = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const SITE = 'https://trustnews.es';
const OPENAI_KEY = Deno.env.get('OPENAI_API_KEY') ?? '';
const EMBED_MODEL = Deno.env.get('OPENAI_EMBEDDING_MODEL') ?? 'text-embedding-3-small';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, apikey',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

async function sha256hex(s: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
const clampInt = (v: string | null, def: number, lo: number, hi: number) =>
  Math.min(Math.max(parseInt(v || String(def), 10) || def, lo), hi);

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
function toStory(s: any, detail = false) {
  const cov = toCoverage(s);
  const dom = dominant(cov);
  const total = (s.sources_count || s.source_count || (Array.isArray(s.articles) ? s.articles.length : 0)) || 0;
  const base: any = {
    id: s.id, title: s.title, summary: s.summary ?? null, category: s.category ?? null,
    image_url: s.image_url ?? null, location: s.location ?? null, status: s.status, source_count: total,
    coverage: cov ? { left: cov.left, center: cov.center, right: cov.right } : null,
    dominant_lean: dom.lean, dominant_lean_pct: dom.pct,
    factuality: s.factuality ?? null, blind_spot: s.blind_spot ?? null,
    published_at: s.published_at ?? s.created_at ?? null, updated_at: s.updated_at ?? null,
    url: `${SITE}/story/${s.id}`,
  };
  if (!detail) return base;
  return {
    ...base, consensus: s.consensus ?? null, impact: s.impact ?? null,
    perspectives: perspectives(s), analytical_snippet: s.analytical_snippet ?? null,
    key_figures: Array.isArray(s.cifras_clave) ? s.cifras_clave : (Array.isArray(s.key_figures) ? s.key_figures : []),
    disputed_claims: Array.isArray(s.disputed_claims) ? s.disputed_claims : [],
    articles: Array.isArray(s.articles) ? s.articles.map((a: any) => ({
      title: a.title ?? null, source: a.source ?? null, bias: a.bias ?? null,
      url: a.url ?? a.source_url ?? null, excerpt: a.excerpt ?? a.summary ?? null, published_at: a.published_at ?? null,
    })) : [],
    coverage_source: cov?._from ?? null,
  };
}
function toSource(s: any) {
  return {
    id: s.id, name: s.nombre || s.name || s.id, bias_label: s.bias_label ?? null,
    bias_score: typeof s.bias_score === 'number' ? s.bias_score : null,
    factuality: s.factuality ?? null, ownership: s.ownership ?? null,
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
      ? [...new Map((s.articles as any[]).map((a) => [a.source, { name: a.source ?? null, lean: (a.bias || '').toString().toLowerCase() || null }])).values()]
      : [],
    source_count: (s.sources_count || s.source_count || (Array.isArray(s.articles) ? s.articles.length : 0)) || 0,
    url: `${SITE}/story/${s.id}`,
    confidence: cov?._from === 'pipeline' ? 'high' : (cov ? 'medium' : 'low'),
  };
}

const STORY_COLS = 'id,title,summary,category,image_url,location,status,source_count,sources_count,coverage_left,coverage_center,coverage_right,bias,factuality,consensus,impact,blind_spot,consenso_narrativo,consensus_narrative,analytical_snippet,cifras_clave,key_figures,disputed_claims,articles,published_at,created_at,updated_at';
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

// ── shared data ops (used by REST + MCP) ──
async function opListStories(p: any, canDrafts: boolean) {
  const limit = Math.min(Math.max(p.limit || 20, 1), 100);
  const offset = Math.max(p.offset || 0, 0);
  const want = wantStatus(p.status, canDrafts);
  let query = db.from('stories').select(STORY_COLS).order('created_at', { ascending: false }).range(offset, offset + limit - 1);
  if (want !== 'all') query = query.eq('status', want);
  if (p.category) query = query.ilike('category', p.category);
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
  let query = db.from('stories').select(STORY_COLS).order('created_at', { ascending: false }).limit(200);
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
  let kq = db.from('stories').select(STORY_COLS).or(`title.ilike.%${q}%,summary.ilike.%${q}%,category.ilike.%${q}%`).order('created_at', { ascending: false }).limit(limit).eq('status', 'published');
  const { data, error } = await kq;
  if (error) throw new Error(error.message);
  return { object: 'list', mode: 'keyword', query: q, count: (data || []).length, data: (data || []).map((s) => toStory(s)) };
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

// ── MCP ──
const MCP_TOOLS = [
  { name: 'search_news', description: 'Search Spanish/world news by topic (semantic when available, keyword fallback). Returns stories with bias/coverage analysis.', inputSchema: { type: 'object', properties: { query: { type: 'string' }, limit: { type: 'integer', default: 10 } }, required: ['query'] } },
  { name: 'list_stories', description: 'List recent stories, optionally filtered by category or dominant political lean.', inputSchema: { type: 'object', properties: { category: { type: 'string' }, lean: { type: 'string', enum: ['left', 'center', 'right'] }, limit: { type: 'integer', default: 20 } } } },
  { name: 'get_story', description: 'Get one story with full detail: coverage, perspectives, articles, key figures.', inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] } },
  { name: 'get_story_context', description: 'Get an LLM-ready context bundle for a story: consensus, per-side perspectives, bias distribution, blind spot, sources and their lean.', inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] } },
  { name: 'list_blindspots', description: 'List stories under-reported by one side of the political spectrum (blindspots for the left / for the right).', inputSchema: { type: 'object', properties: { threshold: { type: 'integer', default: 15 } } } },
  { name: 'list_sources', description: 'List the source catalog with media-bias, factuality and ownership ratings.', inputSchema: { type: 'object', properties: {} } },
];

async function mcpCallTool(name: string, args: any, canDrafts: boolean) {
  switch (name) {
    case 'search_news': return await opSearch(String(args.query || ''), Math.min(Math.max(args.limit || 10, 1), 50), canDrafts);
    case 'list_stories': return await opListStories({ category: args.category, lean: args.lean, limit: args.limit || 20 }, canDrafts);
    case 'get_story': { const s = await opGetStoryRow(String(args.id), canDrafts); return s ? toStory(s, true) : { error: 'not_found' }; }
    case 'get_story_context': { const s = await opGetStoryRow(String(args.id), canDrafts); return s ? toContext(s) : { error: 'not_found' }; }
    case 'list_blindspots': return await opBlindspots({ threshold: args.threshold }, canDrafts);
    case 'list_sources': return await opSources();
    default: throw new Error(`Unknown tool: ${name}`);
  }
}

async function handleMcp(req: Request, canDrafts: boolean) {
  let msg: any = {};
  try { msg = await req.json(); } catch { /* */ }
  const rpc = (result: any) => json({ jsonrpc: '2.0', id: msg.id ?? null, result });
  const rpcErr = (code: number, message: string) => json({ jsonrpc: '2.0', id: msg.id ?? null, error: { code, message } });
  try {
    if (msg.method === 'initialize') {
      return rpc({ protocolVersion: '2024-11-05', capabilities: { tools: {} }, serverInfo: { name: 'trust-news', version: '1.0.0' } });
    }
    if (msg.method === 'notifications/initialized' || msg.method === 'notifications/cancelled') {
      return new Response(null, { status: 202, headers: cors });
    }
    if (msg.method === 'ping') return rpc({});
    if (msg.method === 'tools/list') return rpc({ tools: MCP_TOOLS });
    if (msg.method === 'tools/call') {
      const data = await mcpCallTool(msg.params?.name, msg.params?.arguments || {}, canDrafts);
      return rpc({ content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] });
    }
    return rpcErr(-32601, `Method not found: ${msg.method}`);
  } catch (e) {
    return rpcErr(-32603, String(e));
  }
}

const OPENAPI = {
  openapi: '3.1.0',
  info: { title: 'Trust News API', version: '1.0.0', description: 'News with media-bias & coverage analysis for LLM agents.' },
  servers: [{ url: 'https://xwkqtugupzpdnnvxrkyu.supabase.co/functions/v1/api' }],
  paths: {
    '/v1/stories': { get: { summary: 'List stories' } },
    '/v1/stories/{id}': { get: { summary: 'Get a story' } },
    '/v1/stories/{id}/context': { get: { summary: 'LLM-ready context bundle' } },
    '/v1/blindspots': { get: { summary: 'Stories under-reported by one side' } },
    '/v1/sources': { get: { summary: 'Source catalog with bias ratings' } },
    '/v1/search': { get: { summary: 'Semantic + keyword search' } },
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

  // Public
  if (path === '/' || path === '/v1' || path === '/v1/health') {
    return json({ ok: true, service: 'Trust News API', version: 'v1', docs: `${SITE}/developers`,
      endpoints: ['/v1/stories', '/v1/stories/:id', '/v1/stories/:id/context', '/v1/blindspots', '/v1/sources', '/v1/search', '/mcp'] });
  }
  if (path === '/v1/openapi.json') return json(OPENAPI);

  // Auth for everything else (REST + MCP)
  const auth = await authenticate(req);
  if (!auth.ok) return json({ error: auth.error, message: auth.message }, auth.status);
  const canDrafts = (auth.key.scopes || []).includes('drafts');

  if (isMcp) return await handleMcp(req, canDrafts);

  try {
    if (seg[1] === 'stories' && !seg[2]) {
      return json(await opListStories({
        limit: clampInt(qp.get('limit'), 20, 1, 100), offset: clampInt(qp.get('offset'), 0, 0, 1e9),
        status: qp.get('status'), category: qp.get('category'), q: qp.get('q'), lean: qp.get('lean'),
      }, canDrafts));
    }
    if (seg[1] === 'stories' && seg[2]) {
      const s = await opGetStoryRow(seg[2], canDrafts);
      if (!s) return json({ error: 'not_found', message: 'Story not found' }, 404);
      if (seg[3] === 'coverage') { const st: any = toStory(s, true); return json({ id: st.id, coverage: st.coverage, dominant_lean: st.dominant_lean, dominant_lean_pct: st.dominant_lean_pct, factuality: st.factuality, source_count: st.source_count, blind_spot: st.blind_spot, coverage_source: st.coverage_source }); }
      if (seg[3] === 'articles') return json({ id: s.id, articles: (toStory(s, true) as any).articles });
      if (seg[3] === 'context') return json(toContext(s));
      return json(toStory(s, true));
    }
    if (seg[1] === 'blindspots') {
      return json(await opBlindspots({ threshold: clampInt(qp.get('threshold'), 15, 0, 40), status: qp.get('status') }, canDrafts));
    }
    if (seg[1] === 'sources') {
      if (seg[2]) { const { data: s } = await db.from('sources').select('*').eq('id', seg[2]).maybeSingle(); return s ? json(toSource(s)) : json({ error: 'not_found', message: 'Source not found' }, 404); }
      return json(await opSources());
    }
    if (seg[1] === 'search') {
      const q = qp.get('q');
      if (!q) return json({ error: 'bad_request', message: 'Missing ?q=' }, 400);
      return json(await opSearch(q, clampInt(qp.get('limit'), 10, 1, 50), canDrafts));
    }
    return json({ error: 'not_found', message: `Unknown endpoint: ${path}`, path }, 404);
  } catch (e) {
    return json({ error: 'server_error', message: String(e) }, 500);
  }
});
