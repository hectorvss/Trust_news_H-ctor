// Trust News MCP (authenticated) — stable connector URL that forwards the whole
// JSON-RPC/MCP exchange to the `api` function's /mcp endpoint. This way it always
// exposes the full tool set + tier gating defined in `api` with no duplication.
// Auth: the caller's `Authorization: Bearer tnf_live_...` is passed through.
const API_MCP = 'https://xwkqtugupzpdnnvxrkyu.supabase.co/functions/v1/api/mcp';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, content-type, apikey, mcp-protocol-version, mcp-session-id, x-client-info',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method === 'GET') {
    return new Response(JSON.stringify({ server: { name: 'trust-news', version: '2.0.0' }, transport: 'streamable-http', note: 'POST JSON-RPC 2.0 (MCP). Auth: Bearer tnf_live_...' }), { headers: { ...cors, 'Content-Type': 'application/json' } });
  }
  const body = await req.text();
  const upstream = await fetch(API_MCP, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': req.headers.get('authorization') || '',
    },
    body,
  });
  const text = await upstream.text();
  return new Response(text || null, {
    status: upstream.status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
});
