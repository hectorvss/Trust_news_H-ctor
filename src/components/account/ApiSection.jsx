import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

const mono = 'var(--font-mono)';
const REST_BASE = 'https://xwkqtugupzpdnnvxrkyu.supabase.co/functions/v1/api';
const MCP_URL = 'https://xwkqtugupzpdnnvxrkyu.supabase.co/functions/v1/mcp';

const SectionTitle = ({ children }) => (
  <h3 style={{ fontSize: '12px', fontWeight: 900, fontFamily: mono, borderBottom: 'var(--border-thin)', paddingBottom: '16px', marginBottom: '24px', opacity: 0.5, letterSpacing: '1px' }}>{children}</h3>
);

const CopyBtn = ({ text, label = 'COPIAR' }) => {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 2000); }}
      style={{ padding: '8px 14px', fontSize: '10px', fontWeight: 900, fontFamily: mono, letterSpacing: '1px', background: done ? '#16a34a' : 'black', color: 'white', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
    >
      {done ? '✓ COPIADO' : label}
    </button>
  );
};

// Tools this API plugs into. kind: MCP (native tools) or REST (HTTP/OpenAPI).
const WORKS_WITH = [
  { name: 'Claude', kind: 'MCP', note: 'Conector personalizado' },
  { name: 'ChatGPT', kind: 'REST', note: 'Actions / OpenAPI' },
  { name: 'Cursor', kind: 'MCP', note: 'MCP server' },
  { name: 'GitHub Copilot', kind: 'MCP', note: 'MCP · VS Code' },
  { name: 'Windsurf', kind: 'MCP', note: 'MCP server' },
  { name: 'Zed', kind: 'MCP', note: 'MCP server' },
  { name: 'n8n', kind: 'REST', note: 'HTTP / webhooks' },
  { name: 'Make', kind: 'REST', note: 'REST · OpenAPI' },
  { name: 'Zapier', kind: 'REST', note: 'REST · webhooks' },
  { name: 'LangChain', kind: 'REST', note: 'OpenAPI tools' },
  { name: 'Tu propia app', kind: 'REST', note: 'REST · OpenAPI' },
];

export default function ApiSection({ user }) {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [tier, setTier] = useState('pro');
  const [creating, setCreating] = useState(false);
  const [justCreated, setJustCreated] = useState(null);

  const load = () => supabase
    .from('api_keys')
    .select('id,name,key_prefix,tier,daily_limit,usage_date,usage_count,total_requests,last_used_at,revoked_at,created_at')
    .order('created_at', { ascending: false })
    .then(({ data }) => { setKeys(Array.isArray(data) ? data : []); setLoading(false); });

  useEffect(() => { load(); }, []);

  const create = async () => {
    setCreating(true);
    const { data, error } = await supabase.rpc('create_api_key', { p_name: name || 'API key', p_tier: tier });
    setCreating(false);
    if (error) { alert('Error creando la clave: ' + error.message); return; }
    const row = Array.isArray(data) ? data[0] : data;
    if (row?.api_key) { setJustCreated(row); setName(''); load(); }
  };

  const revoke = async (id) => {
    if (!window.confirm('¿Revocar esta clave? Dejará de funcionar de inmediato.')) return;
    await supabase.from('api_keys').update({ revoked_at: new Date().toISOString() }).eq('id', id);
    load();
  };

  const today = new Date().toISOString().slice(0, 10);
  const active = keys.filter((k) => !k.revoked_at);
  const totalReqs = keys.reduce((a, k) => a + (k.total_requests || 0), 0);

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-1px', margin: 0 }}>API &amp; MCP</h2>
        <span style={{ background: 'black', color: 'white', fontSize: '9px', fontWeight: 900, fontFamily: mono, letterSpacing: '1px', padding: '4px 8px' }}>NUEVO</span>
      </div>
      <p style={{ fontSize: '15px', lineHeight: 1.6, opacity: 0.65, maxWidth: '720px', marginBottom: '48px' }}>
        Conecta cualquier agente LLM a tus noticias y análisis de sesgo. Las claves se muestran <strong>una sola vez</strong> — guárdalas de forma segura.
      </p>

      {/* ── Newly created key ── */}
      {justCreated && (
        <div style={{ border: '2px solid #16a34a', background: '#f0fdf4', padding: '24px', marginBottom: '48px' }}>
          <div style={{ fontSize: '11px', fontWeight: 900, fontFamily: mono, letterSpacing: '1px', marginBottom: '12px', color: '#15803d' }}>
            ✓ CLAVE CREADA — CÓPIALA AHORA (no se volverá a mostrar)
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <code style={{ flex: 1, minWidth: '280px', fontSize: '13px', fontFamily: mono, background: 'white', border: '1px solid black', padding: '14px', wordBreak: 'break-all' }}>{justCreated.api_key}</code>
            <CopyBtn text={justCreated.api_key} />
          </div>
          <button onClick={() => setJustCreated(null)} style={{ background: 'none', border: 'none', opacity: 0.5, marginTop: '12px', padding: 0, cursor: 'pointer', fontSize: '12px', fontFamily: mono, textDecoration: 'underline' }}>Ya la he guardado ✕</button>
        </div>
      )}

      {/* ── Create ── */}
      <div style={{ marginBottom: '60px' }}>
        <SectionTitle>CREAR UNA API KEY</SectionTitle>
        <div style={{ border: 'var(--border-thin)', padding: '32px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: '220px' }}>
            <label style={{ fontSize: '10px', fontWeight: 900, fontFamily: mono, opacity: 0.5, letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>NOMBRE (p.ej. Mi agente)</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Claude · Producción · Mi bot…"
              style={{ width: '100%', padding: '14px', border: '1px solid #ccc', fontSize: '14px', background: '#fcfcfc', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: '10px', fontWeight: 900, fontFamily: mono, opacity: 0.5, letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>PLAN</label>
            <select value={tier} onChange={(e) => setTier(e.target.value)} style={{ padding: '14px', border: '1px solid #ccc', fontSize: '13px', background: '#fcfcfc', cursor: 'pointer' }}>
              <option value="free">Free — 1.000 peticiones/día</option>
              <option value="pro">Pro — 10.000/día</option>
              <option value="business">Business — 100.000/día</option>
            </select>
          </div>
          <button onClick={create} disabled={creating} style={{ padding: '15px 26px', fontSize: '11px', fontWeight: 900, fontFamily: mono, letterSpacing: '1px', background: 'black', color: 'white', border: 'none', cursor: 'pointer', opacity: creating ? 0.5 : 1 }}>
            {creating ? 'CREANDO…' : 'CREAR CLAVE'}
          </button>
        </div>
      </div>

      {/* ── Keys list ── */}
      <div style={{ marginBottom: '60px' }}>
        <SectionTitle>TUS API KEYS</SectionTitle>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', fontFamily: mono, opacity: 0.4, fontWeight: 900 }}>CARGANDO…</div>
        ) : keys.length === 0 ? (
          <div style={{ padding: '32px', border: '1px dashed #ccc', textAlign: 'center', fontSize: '13px', fontFamily: mono, opacity: 0.5 }}>
            Aún no tienes claves — crea una arriba.
          </div>
        ) : (
          <div style={{ border: 'var(--border-thin)' }}>
            {keys.map((k, i) => {
              const revoked = !!k.revoked_at;
              const usageToday = k.usage_date === today ? (k.usage_count || 0) : 0;
              return (
                <div key={k.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.3fr 1fr auto', gap: '16px', padding: '18px 24px', alignItems: 'center', borderTop: i > 0 ? '1px solid #eee' : 'none', opacity: revoked ? 0.45 : 1 }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 800 }}>{k.name}{revoked && <span style={{ color: '#d32f2f', fontFamily: mono, fontSize: '9px', marginLeft: '8px' }}>REVOCADA</span>}</div>
                    <div style={{ fontSize: '11px', fontFamily: mono, opacity: 0.5 }}>{k.key_prefix}…</div>
                  </div>
                  <div style={{ fontSize: '10px', fontWeight: 800, fontFamily: mono, textTransform: 'uppercase' }}>{k.tier}</div>
                  <div style={{ fontSize: '11px', fontFamily: mono }}>{usageToday}/{k.daily_limit} hoy <span style={{ opacity: 0.4 }}>· {k.total_requests || 0} total</span></div>
                  <div style={{ fontSize: '10px', fontFamily: mono, opacity: 0.6 }}>{k.last_used_at ? new Date(k.last_used_at).toLocaleDateString('es-ES') : '—'}</div>
                  <div style={{ textAlign: 'right' }}>
                    {!revoked && <button onClick={() => revoke(k.id)} style={{ padding: '7px 14px', fontSize: '9px', fontWeight: 900, fontFamily: mono, letterSpacing: '1px', background: 'white', color: '#d32f2f', border: '1px solid #d32f2f', cursor: 'pointer' }}>REVOCAR</button>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Activity ── */}
      {keys.length > 0 && (
        <div style={{ marginBottom: '60px' }}>
          <SectionTitle>ACTIVIDAD</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2px', background: '#e0e0e0', border: '1px solid #e0e0e0' }}>
            {[['CLAVES ACTIVAS', active.length], ['PETICIONES TOTALES', totalReqs], ['PLAN MÁS ALTO', (active[0]?.tier || '—').toUpperCase()]].map(([l, v]) => (
              <div key={l} style={{ background: 'white', padding: '28px 24px' }}>
                <div style={{ fontSize: '10px', fontWeight: 900, fontFamily: mono, opacity: 0.4, letterSpacing: '1px', marginBottom: '10px' }}>{l}</div>
                <div style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-1.5px', lineHeight: 1 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Works with ── */}
      <div style={{ marginBottom: '60px' }}>
        <SectionTitle>COMPATIBLE CON</SectionTitle>
        <p style={{ fontSize: '13px', opacity: 0.6, marginBottom: '24px', lineHeight: 1.5, maxWidth: '720px' }}>
          Conecta vía el <strong>servidor MCP</strong> (herramientas nativas) o la <strong>API REST / OpenAPI</strong>. Cualquier cliente compatible con MCP o que haga HTTP funciona — esta lista son los más comunes.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1px', background: '#e0e0e0', border: '1px solid #e0e0e0' }}>
          {WORKS_WITH.map((t) => (
            <div key={t.name} style={{ background: 'white', padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '15px', fontWeight: 800 }}>{t.name}</span>
                <span style={{ fontSize: '8px', fontWeight: 900, fontFamily: mono, letterSpacing: '1px', padding: '3px 6px', background: t.kind === 'MCP' ? 'black' : '#eee', color: t.kind === 'MCP' ? 'white' : 'black' }}>{t.kind}</span>
              </div>
              <span style={{ fontSize: '11px', fontFamily: mono, opacity: 0.5 }}>{t.note}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── How to connect ── */}
      <div>
        <SectionTitle>CÓMO CONECTAR</SectionTitle>

        {/* MCP */}
        <div style={{ border: 'var(--border-thin)', padding: '32px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '16px', fontWeight: 800 }}>Conectar por MCP (Claude, Cursor, Windsurf, Zed…)</span>
            <span style={{ fontSize: '9px', fontWeight: 900, fontFamily: mono, background: 'black', color: 'white', padding: '3px 8px', letterSpacing: '1px' }}>HERRAMIENTAS NATIVAS</span>
          </div>
          <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', lineHeight: 2, color: '#222' }}>
            <li>Crea una <strong>API key</strong> arriba y cópiala.</li>
            <li>En tu cliente (Claude → Ajustes → Conectores → «Añadir conector personalizado»), pega esta URL:</li>
          </ol>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', margin: '12px 0 12px 20px', flexWrap: 'wrap' }}>
            <code style={{ flex: 1, minWidth: '280px', fontSize: '13px', fontFamily: mono, background: '#0a0a0a', color: '#e5e5e5', padding: '12px 14px', wordBreak: 'break-all' }}>{MCP_URL}</code>
            <CopyBtn text={MCP_URL} label="COPIAR URL" />
          </div>
          <ol start={3} style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', lineHeight: 2, color: '#222' }}>
            <li>Añade la cabecera <code style={{ fontFamily: mono, background: '#f0f0f0', padding: '1px 5px' }}>Authorization: Bearer TU_CLAVE</code>.</li>
            <li>Listo: <code style={{ fontFamily: mono }}>search_news</code>, <code style={{ fontFamily: mono }}>get_story_context</code>, <code style={{ fontFamily: mono }}>list_blindspots</code>… aparecen como herramientas.</li>
          </ol>
        </div>

        {/* REST */}
        <div style={{ border: 'var(--border-thin)', padding: '32px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '16px', fontWeight: 800 }}>Conectar por REST / OpenAPI (ChatGPT, n8n, Make, tu app…)</span>
            <span style={{ fontSize: '9px', fontWeight: 900, fontFamily: mono, background: '#eee', color: 'black', padding: '3px 8px', letterSpacing: '1px' }}>HTTP</span>
          </div>
          <pre style={{ margin: 0, fontSize: '12.5px', fontFamily: mono, background: '#0a0a0a', color: '#e5e5e5', padding: '18px', overflowX: 'auto', lineHeight: 1.7 }}>{`# Base URL
${REST_BASE}

# Buscar noticias
curl "${REST_BASE}/v1/search?q=vivienda" \\
  -H "Authorization: Bearer TU_CLAVE"

# Contexto LLM-ready de una noticia
curl "${REST_BASE}/v1/stories/{id}/context" -H "Authorization: Bearer TU_CLAVE"

# Puntos ciegos · Fuentes · OpenAPI
GET ${REST_BASE}/v1/blindspots
GET ${REST_BASE}/v1/sources
GET ${REST_BASE}/v1/openapi.json`}</pre>
          <div style={{ marginTop: '14px' }}><CopyBtn text={`${REST_BASE}/v1/openapi.json`} label="COPIAR URL OPENAPI" /></div>
        </div>
      </div>
    </div>
  );
}
