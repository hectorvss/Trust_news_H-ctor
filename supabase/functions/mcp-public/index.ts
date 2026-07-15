import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ── Servidor MCP PÚBLICO de Trust News España ──────────────────────────────
// Transporte: Streamable HTTP (JSON-RPC 2.0 por POST). SIN autenticación: solo
// expone NOTICIAS PUBLICADAS (contenido público), en modo lectura. Se despliega
// con verify_jwt=false para que cualquier cliente MCP (p.ej. un conector de
// Claude) pueda conectarse SIN OAuth ni API key. URL del conector:
//   https://<proj>.supabase.co/functions/v1/mcp-public
// (La función `mcp` autenticada con API keys tnf_ se mantiene aparte, intacta.)
const SERVER = { name: 'trust-news-espana', version: '1.0.0' };
const DEFAULT_PROTOCOL = '2025-06-18';

const db = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'content-type, authorization, mcp-protocol-version, mcp-session-id, x-client-info, apikey',
  'Access-Control-Expose-Headers': 'mcp-session-id',
};
const JSON_HEADERS = { ...CORS, 'Content-Type': 'application/json' };

const ok = (id: any, result: any) => ({ jsonrpc: '2.0', id, result });
const err = (id: any, code: number, message: string) => ({ jsonrpc: '2.0', id, error: { code, message } });
const textContent = (text: string) => ({ content: [{ type: 'text', text }] });

const TOOLS = [
  {
    name: 'list_news',
    description: 'Lista las noticias publicadas más recientes de Trust News España, con su análisis de cobertura por sesgo (izquierda/centro/derecha). Filtra opcionalmente por categoría.',
    inputSchema: {
      type: 'object',
      properties: {
        category: { type: 'string', description: 'Categoría opcional (POLÍTICA, DEPORTE, INTERNACIONAL, SOCIAL, TECNOLOGÍA, CULTURA, FINANZAS...).' },
        limit: { type: 'number', description: 'Máximo de noticias (por defecto 15, máximo 40).' },
      },
    },
  },
  {
    name: 'search_news',
    description: 'Busca noticias publicadas por palabra clave en el titular y el resumen.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Términos de búsqueda.' },
        limit: { type: 'number', description: 'Máximo de resultados (por defecto 15, máximo 40).' },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_news',
    description: 'Devuelve una noticia completa por su id: cuerpo redactado, contexto, análisis de sesgo, punto ciego, cifras clave y la lista de medios que la cubrieron con su orientación.',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'string', description: 'Id de la noticia (devuelto por list_news/search_news).' } },
      required: ['id'],
    },
  },
  {
    name: 'list_categories',
    description: 'Lista las categorías disponibles con el número de noticias publicadas en cada una.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'list_sources',
    description: 'Catálogo de medios con su sesgo, factualidad y propiedad.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'rate_source',
    description: 'Sesgo, factualidad, propiedad y un "trust score" de un medio concreto (nombre o URL).',
    inputSchema: { type: 'object', properties: { source: { type: 'string' } }, required: ['source'] },
  },
];

const covLine = (s: any) => {
  const l = Math.round(Number(s.coverage_left) || 0);
  const c = Math.round(Number(s.coverage_center) || 0);
  const r = Math.round(Number(s.coverage_right) || 0);
  return `Cobertura: Izq ${l}% · Centro ${c}% · Der ${r}%`;
};
const briefStory = (s: any) =>
  `• [${s.category || 'GENERAL'}] ${s.title}\n  ${s.summary || ''}\n  ${covLine(s)} · Fuentes: ${s.source_count || (Array.isArray(s.articles) ? s.articles.length : 0)} · Consenso: ${s.consensus || 'N/D'} · id: ${s.id}`;

async function toolListNews(args: any) {
  const limit = Math.min(Math.max(Number(args?.limit) || 15, 1), 40);
  let q = db.from('stories')
    .select('id, title, summary, category, coverage_left, coverage_center, coverage_right, consensus, source_count, articles, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(limit);
  if (args?.category) q = q.ilike('category', `%${String(args.category).trim()}%`);
  const { data, error } = await q;
  if (error) return textContent(`Error consultando noticias: ${error.message}`);
  if (!data?.length) return textContent('No hay noticias publicadas que coincidan.');
  return textContent(`${data.length} noticias publicadas:\n\n${data.map(briefStory).join('\n\n')}`);
}

async function toolSearchNews(args: any) {
  const query = String(args?.query || '').trim();
  if (!query) return textContent('Indica un término de búsqueda en "query".');
  const limit = Math.min(Math.max(Number(args?.limit) || 15, 1), 40);
  const pattern = `%${query.replace(/[,%]/g, ' ')}%`;
  const { data, error } = await db.from('stories')
    .select('id, title, summary, category, coverage_left, coverage_center, coverage_right, consensus, source_count, articles')
    .eq('status', 'published')
    .or(`title.ilike.${pattern},summary.ilike.${pattern}`)
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(limit);
  if (error) return textContent(`Error en la búsqueda: ${error.message}`);
  if (!data?.length) return textContent(`Sin resultados para "${query}".`);
  return textContent(`${data.length} resultados para "${query}":\n\n${data.map(briefStory).join('\n\n')}`);
}

async function toolGetNews(args: any) {
  const id = String(args?.id || '').trim();
  if (!id) return textContent('Indica el "id" de la noticia.');
  const { data: s, error } = await db.from('stories')
    .select('id, title, category, summary, full_content, contexto, consensus, factuality, impact, coverage_left, coverage_center, coverage_right, consenso_narrativo, blind_spot, cifras_clave, verificacion_info, articles, published_at')
    .eq('id', id).eq('status', 'published').maybeSingle();
  if (error) return textContent(`Error: ${error.message}`);
  if (!s) return textContent('Noticia no encontrada o no publicada.');

  const arts = Array.isArray(s.articles) ? s.articles : [];
  const biasName = (b: string) => b === 'LEFT' ? 'Izquierda' : b === 'RIGHT' ? 'Derecha' : 'Centro';
  const fuentes = arts.map((a: any) => `  - ${a.source} (${biasName(a.bias)})${a.url ? ` — ${a.url}` : ''}`).join('\n');
  const cifras = Array.isArray(s.cifras_clave) && s.cifras_clave.length
    ? '\n\nCIFRAS CLAVE:\n' + s.cifras_clave.map((c: any) => `  - ${c.label}: ${c.value}`).join('\n') : '';
  const narr = s.consenso_narrativo
    ? `\n\nPERSPECTIVA POR SESGO:\n${String(s.consenso_narrativo).split('|').map((x: string, i: number) => `  [${['Izquierda', 'Centro', 'Derecha'][i] || ''}] ${x.trim()}`).join('\n')}` : '';

  const out = [
    `# ${s.title}`,
    `Categoría: ${s.category || 'GENERAL'} · ${covLine(s)} · Consenso: ${s.consensus || 'N/D'} · Factualidad: ${s.factuality || 'N/D'}`,
    s.summary ? `\n${s.summary}` : '',
    s.full_content ? `\n${s.full_content}` : '',
    s.contexto ? `\nCONTEXTO:\n${s.contexto}` : '',
    s.blind_spot ? `\nPUNTO CIEGO:\n${s.blind_spot}` : '',
    narr,
    cifras,
    s.verificacion_info ? `\n\nVERIFICACIÓN:\n${s.verificacion_info}` : '',
    fuentes ? `\n\nMEDIOS QUE LO CUBRIERON (${arts.length}):\n${fuentes}` : '',
  ].filter(Boolean).join('\n');
  return textContent(out);
}

async function toolListCategories() {
  const { data, error } = await db.from('stories').select('category').eq('status', 'published').limit(2000);
  if (error) return textContent(`Error: ${error.message}`);
  const counts: Record<string, number> = {};
  for (const r of (data || [])) { const c = r.category || 'GENERAL'; counts[c] = (counts[c] || 0) + 1; }
  const rows = Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([c, n]) => `  - ${c}: ${n}`);
  return textContent(rows.length ? `Categorías con noticias publicadas:\n${rows.join('\n')}` : 'No hay noticias publicadas todavía.');
}

async function toolListSources() {
  const { data, error } = await db.from('sources').select('nombre, name, bias_label, factuality, ownership, url').eq('activo', true).order('nombre', { ascending: true }).limit(500);
  if (error) return textContent(`Error: ${error.message}`);
  const seen = new Set<string>();
  const rows = (data || []).filter((s: any) => { const k = (s.nombre || s.name || '').toLowerCase(); if (!k || seen.has(k)) return false; seen.add(k); return true; })
    .map((s: any) => `  - ${s.nombre || s.name} · sesgo: ${s.bias_label || 'N/D'} · factualidad: ${s.factuality || 'N/D'} · propiedad: ${s.ownership || 'N/D'}`);
  return textContent(`${rows.length} medios en el catálogo:\n${rows.join('\n')}`);
}
const fold = (x: string) => String(x || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
async function toolRateSource(args: any) {
  const q = String(args?.source || '').trim();
  if (!q) return textContent('Indica el nombre o la URL de un medio en "source".');
  let needle = q;
  try { if (/^https?:\/\//i.test(q)) needle = new URL(q).hostname.replace(/^www\./, ''); } catch { /* */ }
  const nf = fold(needle);
  const { data } = await db.from('sources').select('nombre, name, bias_label, bias, factuality, ownership, url, pais').eq('activo', true).limit(500);
  const s = (data || []).find((x: any) => { const n = fold(x.nombre || x.name || ''); return n === nf || n.includes(nf) || nf.includes(n) || fold(x.url || '').includes(nf); });
  if (!s) return textContent(`Medio "${q}" no encontrado en el catálogo de Trust News.`);
  const fact = String(s.factuality || '').toUpperCase();
  const factScore = ({ ALTA: 90, HIGH: 90, 'VERY HIGH': 95, MIXTA: 60, MIXED: 60, MEDIA: 60, MEDIUM: 60, BAJA: 30, LOW: 30 } as any)[fact] ?? 55;
  const penalty = typeof s.bias === 'number' ? Math.min(Math.abs(s.bias) * 2, 25) : 10;
  const trust = Math.max(0, Math.min(100, Math.round(factScore - penalty)));
  return textContent(`${s.nombre || s.name}\n  Sesgo: ${s.bias_label || 'N/D'}\n  Factualidad: ${s.factuality || 'N/D'}\n  Propiedad: ${s.ownership || 'N/D'}\n  País: ${s.pais || 'N/D'}\n  Trust score: ${trust}/100`);
}

async function callTool(name: string, args: any) {
  switch (name) {
    case 'list_news': return await toolListNews(args);
    case 'search_news': return await toolSearchNews(args);
    case 'get_news': return await toolGetNews(args);
    case 'list_categories': return await toolListCategories();
    case 'list_sources': return await toolListSources();
    case 'rate_source': return await toolRateSource(args);
    default: return { content: [{ type: 'text', text: `Herramienta desconocida: ${name}` }], isError: true };
  }
}

async function handle(msg: any): Promise<any | null> {
  const { id, method, params } = msg || {};
  switch (method) {
    case 'initialize':
      return ok(id, {
        protocolVersion: params?.protocolVersion || DEFAULT_PROTOCOL,
        capabilities: { tools: { listChanged: false } },
        serverInfo: SERVER,
        instructions: 'Trust News España: agregador que compara la cobertura mediática de una misma noticia y la clasifica por sesgo (izquierda/centro/derecha), factualidad y punto ciego. Usa list_news / search_news para descubrir noticias publicadas y get_news para leer el análisis completo con las fuentes.',
      });
    case 'ping': return ok(id, {});
    case 'tools/list': return ok(id, { tools: TOOLS });
    case 'tools/call':
      try { return ok(id, await callTool(params?.name, params?.arguments || {})); }
      catch (e) { return ok(id, { content: [{ type: 'text', text: `Error: ${String(e)}` }], isError: true }); }
    case 'resources/list': return ok(id, { resources: [] });
    case 'prompts/list': return ok(id, { prompts: [] });
    default:
      if (typeof method === 'string' && method.startsWith('notifications/')) return null;
      if (id === undefined) return null;
      return err(id, -32601, `Method not found: ${method}`);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method === 'GET') {
    return new Response(JSON.stringify({ server: SERVER, transport: 'streamable-http', note: 'POST JSON-RPC 2.0 (MCP)' }), { headers: JSON_HEADERS });
  }
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: CORS });

  let body: any;
  try { body = await req.json(); } catch { return new Response(JSON.stringify(err(null, -32700, 'Parse error')), { headers: JSON_HEADERS }); }

  if (Array.isArray(body)) {
    const out = (await Promise.all(body.map(handle))).filter((x) => x !== null);
    if (out.length === 0) return new Response(null, { status: 202, headers: CORS });
    return new Response(JSON.stringify(out), { headers: JSON_HEADERS });
  }
  const resp = await handle(body);
  if (resp === null) return new Response(null, { status: 202, headers: CORS });
  return new Response(JSON.stringify(resp), { headers: JSON_HEADERS });
});
