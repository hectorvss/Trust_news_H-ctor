// Trust News MCP server — Streamable-HTTP JSON-RPC that exposes the REST API as
// MCP tools for LLM agents. Thin proxy: forwards the caller's API key to the
// verified `api` function. Deployed separately so the REST API is untouched.
const API = 'https://xwkqtugupzpdnnvxrkyu.supabase.co/functions/v1/api';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, apikey',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...cors, 'Content-Type': 'application/json' } });

const TOOLS = [
  { name: 'search_news', description: 'Search Spanish/world news by topic. Returns stories with bias/coverage analysis (semantic when available, keyword fallback).', inputSchema: { type: 'object', properties: { query: { type: 'string' }, limit: { type: 'integer' } }, required: ['query'] } },
  { name: 'list_stories', description: 'List recent stories, optionally filtered by category or dominant political lean (left/center/right).', inputSchema: { type: 'object', properties: { category: { type: 'string' }, lean: { type: 'string' }, limit: { type: 'integer' } } } },
  { name: 'get_story', description: 'Get one story in full: coverage, perspectives, articles, key figures.', inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] } },
  { name: 'get_story_context', description: 'LLM-ready context bundle: consensus, per-side perspectives, bias distribution, blind spot, sources and their lean.', inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] } },
  { name: 'list_blindspots', description: 'Stories under-reported by one side (blindspots for the left / for the right).', inputSchema: { type: 'object', properties: { threshold: { type: 'integer' } } } },
  { name: 'list_sources', description: 'Source catalog with media-bias, factuality and ownership ratings.', inputSchema: { type: 'object', properties: {} } },
];

async function callApi(pathAndQuery: string, auth: string) {
  const r = await fetch(`${API}${pathAndQuery}`, { headers: { Authorization: auth } });
  return await r.json();
}

async function runTool(name: string, args: any, auth: string) {
  const enc = encodeURIComponent;
  switch (name) {
    case 'search_news': return callApi(`/v1/search?q=${enc(args.query || '')}&limit=${args.limit || 10}`, auth);
    case 'list_stories': {
      const p = new URLSearchParams();
      if (args.category) p.set('category', args.category);
      if (args.lean) p.set('lean', args.lean);
      p.set('limit', String(args.limit || 20));
      return callApi(`/v1/stories?${p.toString()}`, auth);
    }
    case 'get_story': return callApi(`/v1/stories/${enc(args.id)}`, auth);
    case 'get_story_context': return callApi(`/v1/stories/${enc(args.id)}/context`, auth);
    case 'list_blindspots': return callApi(`/v1/blindspots?threshold=${args.threshold || 15}`, auth);
    case 'list_sources': return callApi(`/v1/sources`, auth);
    default: throw new Error(`Unknown tool: ${name}`);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  const auth = req.headers.get('authorization') || '';
  let msg: any = {};
  try { msg = await req.json(); } catch { /* */ }
  const id = msg.id ?? null;
  const rpc = (result: any) => json({ jsonrpc: '2.0', id, result });
  const rpcErr = (code: number, message: string) => json({ jsonrpc: '2.0', id, error: { code, message } });
  try {
    if (msg.method === 'initialize') {
      return rpc({ protocolVersion: '2024-11-05', capabilities: { tools: {} }, serverInfo: { name: 'trust-news', version: '1.0.0' } });
    }
    if (msg.method === 'notifications/initialized' || msg.method === 'notifications/cancelled') {
      return new Response(null, { status: 202, headers: cors });
    }
    if (msg.method === 'ping') return rpc({});
    if (msg.method === 'tools/list') return rpc({ tools: TOOLS });
    if (msg.method === 'tools/call') {
      if (!/^Bearer\s+tnf_/i.test(auth)) return rpcErr(-32001, 'Missing or invalid API key (Authorization: Bearer tnf_live_...).');
      const data = await runTool(msg.params?.name, msg.params?.arguments || {}, auth);
      return rpc({ content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] });
    }
    return rpcErr(-32601, `Method not found: ${msg.method}`);
  } catch (e) {
    return rpcErr(-32603, String(e));
  }
});
