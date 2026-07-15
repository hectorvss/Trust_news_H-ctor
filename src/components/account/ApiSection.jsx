import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

const mono = 'var(--font-mono)';
// www evita el redirect 307 apex→www que descartaría la cabecera Authorization.
const REST_BASE = 'https://www.trustnews.es';
const MCP_URL = 'https://www.trustnews.es/mcp';
const OPENAPI_URL = 'https://www.trustnews.es/v1/openapi.json';

// Catálogo de herramientas expuestas por la API + MCP (para la sección "Qué puedes hacer").
const TOOLKIT = {
  free: [
    ['search_news', 'Busca noticias por tema (semántica + palabras clave).'],
    ['list_stories', 'Últimas noticias por categoría o inclinación dominante.'],
    ['get_story', 'Una noticia: resumen, % de cobertura, factualidad, punto ciego.'],
    ['list_categories', 'Categorías con el número de noticias.'],
    ['list_sources', 'Catálogo de medios con sesgo, factualidad y propiedad.'],
    ['rate_source', 'Sesgo, factualidad, propiedad y trust score de un medio.'],
  ],
  premium: [
    ['compare_coverage', 'Cómo encuadra cada medio la MISMA noticia (ángulo, tono, qué enfatiza/omite).'],
    ['full_analysis', 'Análisis completo: cuerpo, contexto, verificación, cifras, impactos y todas las fuentes.'],
    ['get_source_piece', 'Nuestra pieza desarrollada sobre la versión de un medio concreto.'],
    ['get_story_context', 'Paquete de contexto listo para IA (consenso, perspectivas, distribución de sesgo).'],
    ['list_blindspots', 'Noticias infra-cubiertas por un lado del espectro.'],
    ['blindspot_narrative', 'El lado menos cubierto y qué diría esa perspectiva ausente.'],
    ['related_stories', 'Noticias relacionadas por tema y categoría.'],
    ['coverage_trends', 'Volumen y balance izq/centro/der de un tema en el tiempo.'],
    ['trending_topics', 'Qué está caliente ahora por categoría, con balance de cobertura.'],
    ['daily_brief', 'Resumen del día con titulares y puntos ciegos.'],
    ['analyze_bias', 'Analiza el sesgo y el encuadre de un artículo EXTERNO (texto o URL).'],
    ['webhooks', 'Recibe avisos cuando aparece un punto ciego o una noticia de un tema.'],
  ],
};

const MCP_JSON = `{
  "mcpServers": {
    "trust-news": {
      "url": "${MCP_URL}",
      "headers": { "Authorization": "Bearer TU_CLAVE" }
    }
  }
}`;

// Each connector: how the "Cómo conectar" panel reads when selected + its brand
// domain (its own favicon is loaded at runtime for the "Compatible con" grid).
const CONNECTORS = [
  { id: 'claude', name: 'Claude', kind: 'MCP', note: 'Conector personalizado', domain: 'claude.ai',
    steps: ['Crea una API key arriba y cópiala.', 'En Claude → Ajustes → Conectores → «Añadir conector personalizado».', 'Pega la URL del servidor MCP (abajo) y añade la cabecera Authorization: Bearer TU_CLAVE.', 'Listo: compare_coverage, analyze_bias, list_blindspots, daily_brief… aparecen como herramientas (premium según tu plan).'],
    primary: { label: 'URL DEL SERVIDOR MCP', value: MCP_URL } },
  { id: 'cursor', name: 'Cursor', kind: 'MCP', note: 'MCP server', domain: 'cursor.com',
    steps: ['Crea y copia una API key.', 'Settings → MCP → «Add new global MCP server», o edita ~/.cursor/mcp.json:'],
    code: MCP_JSON, primary: { label: 'URL DEL SERVIDOR MCP', value: MCP_URL } },
  { id: 'windsurf', name: 'Windsurf', kind: 'MCP', note: 'MCP server', domain: 'windsurf.com',
    steps: ['Crea y copia una API key.', 'Settings → Cascade → MCP servers, o edita mcp_config.json:'],
    code: MCP_JSON, primary: { label: 'URL', value: MCP_URL } },
  { id: 'zed', name: 'Zed', kind: 'MCP', note: 'MCP server', domain: 'zed.dev',
    steps: ['Crea y copia una API key.', 'Abre settings.json de Zed y añade en context_servers:'],
    code: `"context_servers": {\n  "trust-news": {\n    "source": "custom",\n    "url": "${MCP_URL}",\n    "headers": { "Authorization": "Bearer TU_CLAVE" }\n  }\n}`,
    primary: { label: 'URL', value: MCP_URL } },
  { id: 'copilot', name: 'GitHub Copilot', kind: 'MCP', note: 'MCP · VS Code', domain: 'github.com',
    steps: ['Crea y copia una API key.', 'En VS Code crea .vscode/mcp.json:'],
    code: `{\n  "servers": {\n    "trust-news": {\n      "type": "http",\n      "url": "${MCP_URL}",\n      "headers": { "Authorization": "Bearer TU_CLAVE" }\n    }\n  }\n}`,
    primary: { label: 'URL', value: MCP_URL } },
  { id: 'chatgpt', name: 'ChatGPT', kind: 'REST', note: 'GPT Actions · OpenAPI', domain: 'openai.com',
    steps: ['Crea y copia una API key.', 'Crea un GPT → Configure → Actions → «Import from URL» y pega el OpenAPI (abajo).', 'Authentication → API Key → tipo «Bearer» → pega tu clave.'],
    primary: { label: 'OPENAPI', value: OPENAPI_URL } },
  { id: 'n8n', name: 'n8n', kind: 'REST', note: 'HTTP / webhooks', domain: 'n8n.io',
    steps: ['Crea y copia una API key.', 'Añade un nodo «HTTP Request» con la URL de abajo.', 'Authentication → Generic → Header Auth → Name: Authorization, Value: Bearer TU_CLAVE.'],
    code: `GET ${REST_BASE}/v1/search?q=vivienda`, primary: { label: 'BASE URL', value: `${REST_BASE}/v1` } },
  { id: 'make', name: 'Make', kind: 'REST', note: 'REST · OpenAPI', domain: 'make.com',
    steps: ['Crea y copia una API key.', 'Módulo «HTTP → Make a request»: método GET, URL de abajo.', 'Headers: Authorization = Bearer TU_CLAVE. (O importa el OpenAPI.)'],
    primary: { label: 'BASE URL', value: `${REST_BASE}/v1` } },
  { id: 'zapier', name: 'Zapier', kind: 'REST', note: 'REST · webhooks', domain: 'zapier.com',
    steps: ['Crea y copia una API key.', '«Webhooks by Zapier» → Custom Request → GET a la URL de abajo.', 'Headers: Authorization: Bearer TU_CLAVE.'],
    primary: { label: 'BASE URL', value: `${REST_BASE}/v1` } },
  { id: 'langchain', name: 'LangChain', kind: 'REST', note: 'OpenAPI tools', domain: 'langchain.com',
    steps: ['Crea y copia una API key.', 'Envuelve la REST como tool o consume el OpenAPI:'],
    code: `import requests\nr = requests.get("${REST_BASE}/v1/search",\n  params={"q": "vivienda"},\n  headers={"Authorization": "Bearer TU_CLAVE"})\nprint(r.json())`,
    primary: { label: 'OPENAPI', value: OPENAPI_URL } },
  { id: 'own', name: 'Tu propia app', kind: 'REST', note: 'REST · OpenAPI', domain: null,
    steps: ['Crea y copia una API key.', 'Llama a la REST con tu clave en la cabecera:'],
    code: `curl "${REST_BASE}/v1/search?q=vivienda" \\\n  -H "Authorization: Bearer TU_CLAVE"`,
    primary: { label: 'OPENAPI', value: OPENAPI_URL } },
];

const planFor = (profile) => {
  const role = profile?.role;
  if (role === 'manager' || role === 'admin_editor') return { name: 'BUSINESS', limit: '100.000', free: false };
  const sub = (profile?.subscription_tier || 'free').toLowerCase();
  if (sub === 'elite' || sub === 'business') return { name: 'ELITE', limit: '100.000', free: false };
  if (sub === 'premium' || sub === 'pro') return { name: 'PREMIUM', limit: '10.000', free: false };
  return { name: 'FREE', limit: '1.000', free: true };
};

const SectionTitle = ({ children }) => (
  <h3 style={{ fontSize: '12px', fontWeight: 900, fontFamily: mono, borderBottom: '1px solid #eee', paddingBottom: '16px', marginBottom: '24px', opacity: 0.5, letterSpacing: '1px' }}>{children}</h3>
);

const CopyBtn = ({ text, label = 'COPIAR' }) => {
  const [done, setDone] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 2000); }}
      style={{ padding: '8px 14px', fontSize: '10px', fontWeight: 900, fontFamily: mono, letterSpacing: '1px', background: done ? '#16a34a' : 'black', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
      {done ? '✓ COPIADO' : label}
    </button>
  );
};

// Brand logo via the site's own favicon (nominative use for the integrations
// grid); falls back to a monogram / code glyph if it can't load.
const Logo = ({ name, domain, size = 34, color = '#111' }) => {
  const [failed, setFailed] = useState(false);
  const src = domain && !failed ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : null;
  return (
    <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {src
        ? <img src={src} alt="" width={size} height={size} style={{ display: 'block', objectFit: 'contain' }} onError={() => setFailed(true)} />
        : <span style={{ fontWeight: 900, fontFamily: mono, fontSize: Math.round(size * 0.42), color }}>{name === 'Tu propia app' ? '{ }' : (name || '?').charAt(0)}</span>}
    </div>
  );
};

export default function ApiSection({ user, profile }) {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const [justCreated, setJustCreated] = useState(null);
  const [selected, setSelected] = useState('claude');

  const plan = planFor(profile);
  const conn = CONNECTORS.find((c) => c.id === selected) || CONNECTORS[0];

  const load = () => supabase
    .from('api_keys')
    .select('id,name,key_prefix,tier,daily_limit,usage_date,usage_count,total_requests,last_used_at,revoked_at,created_at')
    .order('created_at', { ascending: false })
    .then(({ data }) => { setKeys(Array.isArray(data) ? data : []); setLoading(false); });

  useEffect(() => { load(); }, []);

  const create = async () => {
    setCreating(true);
    const { data, error } = await supabase.rpc('create_api_key', { p_name: name || 'API key' });
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
        <span style={{ background: 'black', color: 'white', fontSize: '9px', fontWeight: 900, fontFamily: mono, letterSpacing: '1px', padding: '4px 8px', borderRadius: '4px' }}>NUEVO</span>
      </div>
      <p style={{ fontSize: '15px', lineHeight: 1.6, opacity: 0.65, maxWidth: '720px', marginBottom: '40px' }}>
        Conecta cualquier agente LLM o app a nuestras noticias con <strong>análisis de sesgo, comparación entre medios y puntos ciegos</strong>. Vía <strong>MCP</strong> (herramientas nativas) o <strong>REST / OpenAPI</strong>. Las claves se muestran <strong>una sola vez</strong> — guárdalas de forma segura.
      </p>

      {/* ── Capabilities (free vs premium) ── */}
      <div style={{ marginBottom: '56px' }}>
        <SectionTitle>QUÉ PUEDES HACER · {TOOLKIT.free.length + TOOLKIT.premium.length} HERRAMIENTAS</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          {[
            { label: 'INCLUIDO EN TODOS LOS PLANES', badge: 'GRATIS', dark: false, items: TOOLKIT.free },
            { label: 'PLANES PREMIUM · ELITE', badge: 'PREMIUM', dark: true, items: TOOLKIT.premium },
          ].map((col) => (
            <div key={col.label} style={{ border: '1px solid ' + (col.dark ? '#111' : '#e0e0e0'), borderRadius: '14px', overflow: 'hidden', background: col.dark ? '#0b0b0b' : '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', padding: '16px 20px', borderBottom: '1px solid ' + (col.dark ? 'rgba(255,255,255,0.12)' : '#eee') }}>
                <span style={{ fontSize: '10px', fontWeight: 900, fontFamily: mono, letterSpacing: '1px', color: col.dark ? '#fff' : '#111', opacity: col.dark ? 0.7 : 0.5 }}>{col.label}</span>
                <span style={{ fontSize: '9px', fontWeight: 900, fontFamily: mono, letterSpacing: '1px', padding: '3px 8px', borderRadius: '4px', background: col.dark ? '#fff' : '#111', color: col.dark ? '#111' : '#fff' }}>{col.badge}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {col.items.map(([tool, desc], i) => (
                  <div key={tool} style={{ padding: '13px 20px', borderTop: i > 0 ? '1px solid ' + (col.dark ? 'rgba(255,255,255,0.07)' : '#f2f2f2') : 'none' }}>
                    <code style={{ fontSize: '12.5px', fontFamily: mono, fontWeight: 700, color: col.dark ? '#fff' : '#111' }}>{tool}</code>
                    <div style={{ fontSize: '12.5px', lineHeight: 1.5, marginTop: '3px', color: col.dark ? 'rgba(255,255,255,0.6)' : '#555' }}>{desc}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        {plan.free && (
          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', fontSize: '13px', fontFamily: mono }}>
            <span style={{ opacity: 0.6 }}>Tu plan actual es <strong>FREE</strong> — las {TOOLKIT.premium.length} herramientas premium requieren Premium o Elite.</span>
            <a href="/pricing" style={{ fontWeight: 900, textDecoration: 'underline', color: 'black' }}>VER PLANES ↗</a>
          </div>
        )}
      </div>

      {justCreated && (
        <div style={{ border: '2px solid #16a34a', background: '#f0fdf4', padding: '24px', marginBottom: '48px', borderRadius: '12px' }}>
          <div style={{ fontSize: '11px', fontWeight: 900, fontFamily: mono, letterSpacing: '1px', marginBottom: '12px', color: '#15803d' }}>✓ CLAVE CREADA — CÓPIALA AHORA (no se volverá a mostrar)</div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <code style={{ flex: 1, minWidth: '280px', fontSize: '13px', fontFamily: mono, background: 'white', border: '1px solid #cfead6', borderRadius: '8px', padding: '14px', wordBreak: 'break-all' }}>{justCreated.api_key}</code>
            <CopyBtn text={justCreated.api_key} />
          </div>
          <button onClick={() => setJustCreated(null)} style={{ background: 'none', border: 'none', opacity: 0.5, marginTop: '12px', padding: 0, cursor: 'pointer', fontSize: '12px', fontFamily: mono, textDecoration: 'underline' }}>Ya la he guardado ✕</button>
        </div>
      )}

      {/* ── Create ── */}
      <div style={{ marginBottom: '60px' }}>
        <SectionTitle>CREAR UNA API KEY</SectionTitle>
        <div style={{ border: '1px solid #e0e0e0', padding: '32px' }}>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: 1, minWidth: '220px' }}>
              <label style={{ fontSize: '10px', fontWeight: 900, fontFamily: mono, opacity: 0.5, letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>NOMBRE (p.ej. Mi agente)</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Claude · Producción · Mi bot…"
                style={{ width: '100%', padding: '14px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', background: '#fcfcfc', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <button onClick={create} disabled={creating} style={{ padding: '15px 26px', fontSize: '11px', fontWeight: 900, fontFamily: mono, letterSpacing: '1px', background: 'black', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', opacity: creating ? 0.5 : 1 }}>
              {creating ? 'CREANDO…' : 'CREAR CLAVE'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Keys list ── */}
      <div style={{ marginBottom: '60px' }}>
        <SectionTitle>TUS API KEYS</SectionTitle>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', fontFamily: mono, opacity: 0.4, fontWeight: 900 }}>CARGANDO…</div>
        ) : keys.length === 0 ? (
          <div style={{ padding: '32px', border: '1px dashed #ccc', borderRadius: '12px', textAlign: 'center', fontSize: '13px', fontFamily: mono, opacity: 0.5 }}>Aún no tienes claves — crea una arriba.</div>
        ) : (
          <div style={{ border: '1px solid #e0e0e0' }}>
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
                    {!revoked && <button onClick={() => revoke(k.id)} style={{ padding: '7px 14px', fontSize: '9px', fontWeight: 900, fontFamily: mono, letterSpacing: '1px', background: 'white', color: '#d32f2f', border: '1px solid #d32f2f', borderRadius: '6px', cursor: 'pointer' }}>REVOCAR</button>}
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            {[['CLAVES ACTIVAS', active.length], ['PETICIONES TOTALES', totalReqs], ['TU PLAN', plan.name]].map(([l, v]) => (
              <div key={l} style={{ background: 'white', border: '1px solid #e0e0e0', padding: '28px 24px' }}>
                <div style={{ fontSize: '10px', fontWeight: 900, fontFamily: mono, opacity: 0.4, letterSpacing: '1px', marginBottom: '10px' }}>{l}</div>
                <div style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-1.5px', lineHeight: 1 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Works with (selectable, clean cards + brand logos) ── */}
      <div style={{ marginBottom: '40px' }}>
        <SectionTitle>COMPATIBLE CON</SectionTitle>
        <p style={{ fontSize: '13px', opacity: 0.6, marginBottom: '24px', lineHeight: 1.5, maxWidth: '720px' }}>
          Elige tu herramienta para ver las instrucciones. Conecta vía <strong>MCP</strong> (herramientas nativas) o <strong>REST / OpenAPI</strong>.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(122px, 1fr))', gap: '12px' }}>
          {CONNECTORS.map((t) => {
            const on = t.id === selected;
            return (
              <button
                key={t.id}
                onClick={() => setSelected(t.id)}
                style={{
                  background: on ? '#111' : '#fff',
                  border: '1px solid ' + (on ? '#111' : '#ececec'),
                  borderRadius: '16px',
                  padding: '15px 12px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px',
                  textAlign: 'center',
                  boxShadow: on ? '0 8px 20px rgba(0,0,0,0.16)' : '0 1px 2px rgba(0,0,0,0.03)',
                  transition: 'transform .15s ease, box-shadow .15s ease, border-color .15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = on ? '0 12px 26px rgba(0,0,0,0.22)' : '0 8px 20px rgba(0,0,0,0.08)';
                  if (!on) e.currentTarget.style.borderColor = '#d6d6d6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = on ? '0 8px 20px rgba(0,0,0,0.16)' : '0 1px 2px rgba(0,0,0,0.03)';
                  if (!on) e.currentTarget.style.borderColor = '#ececec';
                }}
              >
                <Logo name={t.name} domain={t.domain} size={40} color={on ? '#fff' : '#111'} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '-0.2px', lineHeight: 1.15, color: on ? '#fff' : '#111' }}>{t.name}</div>
                  <div style={{ fontSize: '8px', fontWeight: 700, fontFamily: mono, letterSpacing: '1.5px', color: on ? '#fff' : '#111', opacity: on ? 0.5 : 0.32 }}>{t.kind}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── How to connect (depends on selection) ── */}
      <div>
        <SectionTitle>CÓMO CONECTAR</SectionTitle>
        <div style={{ border: '1px solid #e0e0e0', padding: '32px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
            <Logo name={conn.name} domain={conn.domain} />
            <span style={{ fontSize: '18px', fontWeight: 800 }}>Conectar {conn.name}</span>
            <span style={{ fontSize: '9px', fontWeight: 900, fontFamily: mono, background: conn.kind === 'MCP' ? 'black' : '#f0f0f0', color: conn.kind === 'MCP' ? 'white' : 'black', padding: '3px 8px', letterSpacing: '1px', borderRadius: '4px' }}>{conn.kind === 'MCP' ? 'HERRAMIENTAS NATIVAS' : 'HTTP · OPENAPI'}</span>
          </div>
          <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', lineHeight: 2, color: '#222' }}>
            {conn.steps.map((s, i) => <li key={i}>{s}</li>)}
          </ol>
          {conn.code && (
            <div style={{ marginTop: '16px' }}>
              <pre style={{ margin: 0, fontSize: '12.5px', fontFamily: mono, background: '#0a0a0a', color: '#e5e5e5', padding: '16px', borderRadius: '10px', overflowX: 'auto', lineHeight: 1.6 }}>{conn.code}</pre>
              <div style={{ marginTop: '10px' }}><CopyBtn text={conn.code} label="COPIAR" /></div>
            </div>
          )}
          {conn.primary && (
            <div style={{ marginTop: '18px', paddingTop: '18px', borderTop: '1px solid #eee' }}>
              <div style={{ fontSize: '9px', fontWeight: 900, fontFamily: mono, opacity: 0.5, letterSpacing: '1px', marginBottom: '8px' }}>{conn.primary.label}</div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <code style={{ flex: 1, minWidth: '260px', fontSize: '13px', fontFamily: mono, background: '#f6f6f6', border: '1px solid #e5e5e5', borderRadius: '8px', padding: '12px 14px', wordBreak: 'break-all' }}>{conn.primary.value}</code>
                <CopyBtn text={conn.primary.value} label="COPIAR" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
