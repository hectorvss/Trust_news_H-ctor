import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

const fontMono = 'var(--font-mono)';
const fontHeading = 'var(--font-heading)';
const BORDER = '1px solid black';

const API_BASE = 'https://trustnews.es';
const MCP_URL = 'https://trustnews.es/mcp';

const btn = {
  fontFamily: fontMono, fontSize: '11px', fontWeight: 900, letterSpacing: '1px',
  textTransform: 'uppercase', cursor: 'pointer', borderRadius: 'var(--radius-sm)'
};

export default function ApiKeys() {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [tier, setTier] = useState('pro');
  const [creating, setCreating] = useState(false);
  const [justCreated, setJustCreated] = useState(null); // { api_key, key_prefix, tier }
  const [copied, setCopied] = useState(false);

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
    if (row?.api_key) { setJustCreated(row); setName(''); setCopied(false); load(); }
  };

  const revoke = async (id) => {
    if (!window.confirm('¿Revocar esta clave? Dejará de funcionar de inmediato.')) return;
    await supabase.from('api_keys').update({ revoked_at: new Date().toISOString() }).eq('id', id);
    load();
  };

  const copy = (text) => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2500); };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div style={{ fontFamily: fontHeading }}>
      <h2 style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-1.5px', margin: 0, lineHeight: 1 }}>API</h2>
      <div style={{ marginTop: '10px', fontSize: '11px', fontFamily: fontMono, opacity: 0.5, letterSpacing: '0.5px', marginBottom: '28px' }}>
        Claves personales para conectar cualquier agente LLM a tus noticias y análisis.
      </div>

      {/* ── Newly created key (shown ONCE) ── */}
      {justCreated && (
        <div style={{ border: '2px solid #16a34a', background: '#f0fdf4', padding: '20px', marginBottom: '28px', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ fontSize: '11px', fontWeight: 900, fontFamily: fontMono, letterSpacing: '1px', marginBottom: '10px', color: '#15803d' }}>
            ✓ CLAVE CREADA — CÓPIALA AHORA (no se volverá a mostrar)
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <code style={{ flex: 1, minWidth: '260px', fontSize: '13px', fontFamily: fontMono, background: 'white', border: BORDER, padding: '12px 14px', borderRadius: '8px', wordBreak: 'break-all' }}>
              {justCreated.api_key}
            </code>
            <button onClick={() => copy(justCreated.api_key)} style={{ ...btn, background: 'black', color: 'white', border: 'none', padding: '12px 18px' }}>
              {copied ? '✓ COPIADA' : 'COPIAR'}
            </button>
          </div>
          <button onClick={() => setJustCreated(null)} style={{ ...btn, background: 'none', border: 'none', opacity: 0.5, marginTop: '10px', padding: 0 }}>
            Ya la he guardado ✕
          </button>
        </div>
      )}

      {/* ── Create form ── */}
      <div style={{ border: BORDER, padding: '20px', marginBottom: '28px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end', borderRadius: 'var(--radius-sm)' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ fontSize: '9px', fontWeight: 900, fontFamily: fontMono, opacity: 0.5, letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>NOMBRE</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="p.ej. Mi agente / Producción"
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ fontSize: '9px', fontWeight: 900, fontFamily: fontMono, opacity: 0.5, letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>TIER</label>
          <select value={tier} onChange={(e) => setTier(e.target.value)} style={{ padding: '10px 12px', border: '1px solid #ddd', fontSize: '13px' }}>
            <option value="free">free — 1.000/día</option>
            <option value="pro">pro — 10.000/día</option>
            <option value="business">business — 100.000/día + drafts</option>
          </select>
        </div>
        <button onClick={create} disabled={creating} style={{ ...btn, background: 'black', color: 'white', border: 'none', padding: '13px 22px', opacity: creating ? 0.5 : 1 }}>
          {creating ? 'CREANDO…' : '+ CREAR CLAVE'}
        </button>
      </div>

      {/* ── Keys list ── */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', fontFamily: fontMono, opacity: 0.4, fontWeight: 900 }}>CARGANDO…</div>
      ) : keys.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', fontFamily: fontMono, opacity: 0.45, fontWeight: 900, fontSize: '12px', letterSpacing: '1px', border: '1px dashed #ccc' }}>
          SIN CLAVES TODAVÍA — CREA LA PRIMERA ARRIBA
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'black', border: BORDER }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.2fr 1fr 100px', gap: '12px', padding: '12px 18px', background: '#f5f5f5', fontSize: '9px', fontWeight: 900, fontFamily: fontMono, letterSpacing: '1px' }}>
            <div>NOMBRE / PREFIJO</div><div>TIER</div><div>USO HOY</div><div>ÚLTIMO USO</div><div style={{ textAlign: 'right' }}>ACCIÓN</div>
          </div>
          {keys.map((k) => {
            const revoked = !!k.revoked_at;
            const usageToday = k.usage_date === today ? (k.usage_count || 0) : 0;
            return (
              <div key={k.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.2fr 1fr 100px', gap: '12px', padding: '14px 18px', background: 'white', alignItems: 'center', opacity: revoked ? 0.45 : 1 }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800 }}>{k.name}{revoked && <span style={{ color: '#dc2626', fontFamily: fontMono, fontSize: '9px', marginLeft: '8px' }}>REVOCADA</span>}</div>
                  <div style={{ fontSize: '11px', fontFamily: fontMono, opacity: 0.5 }}>{k.key_prefix}…</div>
                </div>
                <div style={{ fontSize: '10px', fontWeight: 800, fontFamily: fontMono, textTransform: 'uppercase' }}>{k.tier}</div>
                <div style={{ fontSize: '11px', fontFamily: fontMono }}>{usageToday}/{k.daily_limit} <span style={{ opacity: 0.4 }}>· {k.total_requests || 0} total</span></div>
                <div style={{ fontSize: '10px', fontFamily: fontMono, opacity: 0.6 }}>{k.last_used_at ? new Date(k.last_used_at).toLocaleDateString('es-ES') : '—'}</div>
                <div style={{ textAlign: 'right' }}>
                  {!revoked && <button onClick={() => revoke(k.id)} style={{ ...btn, background: 'white', color: '#dc2626', border: '1px solid #dc2626', padding: '6px 12px', fontSize: '9px' }}>REVOCAR</button>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Quick docs ── */}
      <div style={{ marginTop: '32px', border: '1px dashed #ccc', padding: '20px', borderRadius: 'var(--radius-sm)' }}>
        <div style={{ fontSize: '11px', fontWeight: 900, fontFamily: fontMono, letterSpacing: '1px', marginBottom: '12px', opacity: 0.6 }}>CÓMO USARLA</div>
        <pre style={{ margin: 0, fontSize: '12px', fontFamily: fontMono, background: '#0a0a0a', color: '#e5e5e5', padding: '16px', borderRadius: '8px', overflowX: 'auto', lineHeight: 1.6 }}>{`# REST base URL
${API_BASE}
# MCP (conector para agentes): ${MCP_URL}

# Ejemplo (curl)
curl "${API_BASE}/v1/search?q=vivienda" \\
  -H "Authorization: Bearer tnf_live_..."

# Contexto LLM-ready de una noticia
GET ${API_BASE}/v1/stories/{id}/context

# Endpoints: /v1/stories · /v1/stories/:id · /:id/context
#            /v1/blindspots · /v1/sources · /v1/search?q=`}</pre>
      </div>
    </div>
  );
}
