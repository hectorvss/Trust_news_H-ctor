import React, { useState, useEffect } from 'react';
import { MiniBiasBar } from '../coverage';
import {
  fetchPipelineDrafts, approveDraftStory, rejectDraftStory
} from '../../supabaseService';
import DraftReviewPanel from './DraftReviewPanel';

// ── Monochrome design tokens (shared manager language) ──
const fontHeading = 'var(--font-heading)';
const fontMono = 'var(--font-mono)';
const BORDER = '1px solid black';

const cardLabelStyle = {
  fontSize: '10px', fontWeight: 900, fontFamily: fontMono, opacity: 0.4,
  letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '10px'
};
const cardValueStyle = {
  fontSize: '36px', fontWeight: 900, letterSpacing: '-1.5px', lineHeight: 1, fontFamily: fontHeading
};
const btnLabel = {
  fontFamily: fontMono, fontSize: '11px', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase'
};

const StatCard = ({ label, value }) => (
  <div style={{ background: 'white', padding: '24px' }}>
    <div style={cardLabelStyle}>{label}</div>
    <div style={cardValueStyle}>{value}</div>
  </div>
);

// {left,center,right} raw figures → percentages for MiniBiasBar (null if empty).
const toPctDistribution = (d) => {
  const l = Number(d.coverage_left) || 0;
  const c = Number(d.coverage_center) || 0;
  const r = Number(d.coverage_right) || 0;
  const sum = l + c + r;
  if (sum <= 0) return null;
  return {
    left: Math.round((l / sum) * 100),
    center: Math.round((c / sum) * 100),
    right: Math.round((r / sum) * 100)
  };
};

export default function ReviewQueue({ onEditStory }) {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('TODAS');
  const [readyFilter, setReadyFilter] = useState('TODAS'); // TODAS | READY | PENDING
  const [rowBusy, setRowBusy] = useState(null); // id currently being approved/rejected inline

  // Data load — setState lives inside the promise continuation (deferred), so
  // it never triggers a synchronous cascading render from the mount effect.
  const fetchAll = () => fetchPipelineDrafts()
    .catch(() => [])
    .then((rows) => {
      setDrafts(Array.isArray(rows) ? rows : []);
      setLoading(false);
    });

  // Button handler: flip to the loading state, then re-fetch.
  const refresh = () => {
    setLoading(true);
    fetchAll();
  };

  useEffect(() => { fetchAll(); }, []);

  // Sintetizada = lista para revisar. Contrato: lista ⇢ consensus_narrative (o consenso_narrativo) !== null.
  const isSynth = (d) => !!(d.consensus_narrative || d.consenso_narrativo);
  const withSynthesis = drafts.filter(isSynth);
  const withoutSynthesis = drafts.length - withSynthesis.length;

  const categories = ['TODAS', ...Array.from(new Set(drafts.map((d) => d.category).filter(Boolean)))];
  const visible = drafts
    .filter((d) => categoryFilter === 'TODAS' || d.category === categoryFilter)
    .filter((d) => readyFilter === 'TODAS' || (readyFilter === 'READY' ? isSynth(d) : !isSynth(d)));

  const removeDraft = (id) => setDrafts((prev) => prev.filter((d) => d.id !== id));

  const quickApprove = async (id) => {
    setRowBusy(id);
    const ok = await approveDraftStory(id);
    setRowBusy(null);
    if (ok) removeDraft(id);
  };

  const quickReject = async (id) => {
    const reason = window.prompt('Motivo del rechazo (opcional):', '');
    if (reason === null) return;
    setRowBusy(id);
    const ok = await rejectDraftStory(id, reason || '');
    setRowBusy(null);
    if (ok) removeDraft(id);
  };

  return (
    <div style={{ fontFamily: fontHeading }}>
      {/* ── Header + stats ── */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '16px', marginBottom: '24px'
      }}>
        <div>
          <h2 style={{
            fontSize: '36px', fontWeight: 800, letterSpacing: '-1.5px', margin: 0,
            lineHeight: 1, fontFamily: fontHeading
          }}>
            COLA DE REVISIÓN
          </h2>
          <div style={{ marginTop: '10px', fontSize: '11px', fontFamily: fontMono, opacity: 0.45, letterSpacing: '0.5px' }}>
            Drafts autogenerados por el pipeline · verifica antes de publicar
          </div>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          style={{
            ...btnLabel, padding: '14px 22px', background: 'black', color: 'white', border: 'none',
            cursor: loading ? 'wait' : 'pointer', borderRadius: 'var(--radius-sm)',
            opacity: loading ? 0.5 : 1, whiteSpace: 'nowrap'
          }}
        >
          ↻ {loading ? 'ACTUALIZANDO…' : 'ACTUALIZAR'}
        </button>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px',
        background: 'black', border: BORDER, marginBottom: '24px'
      }}>
        <StatCard label="En cola" value={drafts.length} />
        <StatCard label="Con síntesis" value={withSynthesis.length} />
        <StatCard label="Sin síntesis" value={withoutSynthesis} />
      </div>

      {/* ── Aviso síntesis sin configurar ── */}
      {drafts.length > 0 && withSynthesis.length === 0 && (
        <div style={{
          marginBottom: '24px', padding: '16px 20px', background: '#fafafa', border: '1px dashed #bbb',
          fontSize: '11px', fontFamily: fontMono, letterSpacing: '0.5px', color: '#555', lineHeight: 1.6
        }}>
          Síntesis IA pendiente de configurar (ANTHROPIC_API_KEY en Supabase).
        </div>
      )}

      {/* ── Filtro por estado de síntesis (contrato: filtra por consenso_narrativo) ── */}
      {drafts.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
          {[['TODAS', 'TODAS'], ['READY', '✓ Sintetizadas'], ['PENDING', '🟡 En análisis']].map(([val, lbl]) => {
            const active = readyFilter === val;
            return (
              <button
                key={val}
                onClick={() => setReadyFilter(val)}
                style={{
                  ...btnLabel, fontSize: '10px', padding: '8px 14px',
                  background: active ? '#000' : 'white', color: active ? 'white' : '#000',
                  border: BORDER, borderRadius: 'var(--radius-sm)', cursor: 'pointer'
                }}
              >
                {lbl}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Filtro por categoría ── */}
      {categories.length > 1 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
          {categories.map((cat) => {
            const active = cat === categoryFilter;
            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                style={{
                  ...btnLabel, fontSize: '10px', padding: '8px 14px',
                  background: active ? '#000' : 'white', color: active ? 'white' : '#000',
                  border: BORDER, borderRadius: 'var(--radius-sm)', cursor: 'pointer'
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Lista / estados ── */}
      {loading && drafts.length === 0 ? (
        <div style={{
          padding: '80px 20px', textAlign: 'center', fontFamily: fontMono, fontWeight: 900,
          fontSize: '13px', letterSpacing: '2px', opacity: 0.4
        }}>
          CARGANDO COLA…
        </div>
      ) : drafts.length === 0 ? (
        <div style={{
          padding: '80px 20px', textAlign: 'center', fontFamily: fontMono, fontWeight: 900,
          fontSize: '12px', letterSpacing: '1.5px', opacity: 0.45, lineHeight: 1.8
        }}>
          COLA VACÍA — EL PIPELINE NO HA GENERADO DRAFTS AÚN
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '14px' }}>
          {visible.map((d) => {
            const dist = toPctDistribution(d);
            const count = d.source_count || d.sources_count || 0;
            const hasSyn = isSynth(d);
            const busy = rowBusy === d.id;
            return (
              <div
                key={d.id}
                style={{
                  border: BORDER, borderRadius: 'var(--radius-sm)', padding: '20px', background: 'white'
                }}
              >
                {/* meta row */}
                <div style={{
                  display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px', marginBottom: '12px'
                }}>
                  <span style={{
                    ...btnLabel, fontSize: '9px', padding: '4px 9px', background: '#000', color: 'white',
                    borderRadius: 'var(--radius-sm)'
                  }}>
                    {d.category || 'SOCIAL'}
                  </span>
                  <span style={{ fontSize: '11px', fontFamily: fontMono, opacity: 0.6 }}>
                    {count} fuentes
                  </span>
                  <span style={{ opacity: 0.3 }}>·</span>
                  {hasSyn
                    ? <span style={{ fontSize: '11px', fontFamily: fontMono, fontWeight: 900, color: '#16a34a' }}>✓ sintetizada</span>
                    : <span style={{ fontSize: '11px', fontFamily: fontMono, fontWeight: 900, opacity: 0.55 }}>🟡 en análisis</span>}
                </div>

                {/* title */}
                <h3 style={{
                  fontSize: '17px', fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1.25,
                  margin: '0 0 8px 0', fontFamily: fontHeading
                }}>
                  {d.title || '(sin título)'}
                </h3>

                {/* summary (2 lines) */}
                {d.summary && (
                  <p style={{
                    fontSize: '13px', lineHeight: 1.5, margin: '0 0 14px 0', color: '#444',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                  }}>
                    {d.summary}
                  </p>
                )}

                {/* mini bias bar */}
                {dist && (
                  <div style={{ marginBottom: '16px' }}>
                    <MiniBiasBar distribution={dist} width={140} height={8} />
                  </div>
                )}

                {/* actions */}
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => setSelectedId(d.id)}
                    style={{
                      ...btnLabel, padding: '10px 16px', background: '#000', color: 'white', border: 'none',
                      borderRadius: 'var(--radius-sm)', cursor: 'pointer'
                    }}
                  >
                    REVISAR ▸
                  </button>
                  <button
                    onClick={() => quickApprove(d.id)}
                    disabled={busy}
                    style={{
                      ...btnLabel, fontSize: '10px', padding: '10px 14px', background: '#16a34a',
                      color: 'white', border: 'none', borderRadius: 'var(--radius-sm)',
                      cursor: busy ? 'wait' : 'pointer', opacity: busy ? 0.6 : 1
                    }}
                  >
                    {busy ? '…' : '✓ Publicar'}
                  </button>
                  <button
                    onClick={() => quickReject(d.id)}
                    disabled={busy}
                    style={{
                      ...btnLabel, fontSize: '10px', padding: '10px 14px', background: 'white',
                      color: '#dc2626', border: '2px solid #dc2626', borderRadius: 'var(--radius-sm)',
                      cursor: busy ? 'wait' : 'pointer', opacity: busy ? 0.6 : 1
                    }}
                  >
                    {busy ? '…' : '✕ Rechazar'}
                  </button>
                  <span style={{
                    marginLeft: 'auto', fontSize: '9px', fontFamily: fontMono, opacity: 0.3, letterSpacing: '0.5px'
                  }}>
                    {d.id}
                  </span>
                </div>
              </div>
            );
          })}

          {visible.length === 0 && (
            <div style={{
              padding: '40px 20px', textAlign: 'center', fontFamily: fontMono, fontWeight: 900,
              fontSize: '11px', letterSpacing: '1.5px', opacity: 0.4
            }}>
              SIN DRAFTS EN ESTA CATEGORÍA
            </div>
          )}
        </div>
      )}

      {/* ── Panel de revisión ── */}
      {selectedId && (
        <DraftReviewPanel
          storyId={selectedId}
          onClose={() => setSelectedId(null)}
          onApproved={(id) => { removeDraft(id); setSelectedId(null); }}
          onRejected={(id) => { removeDraft(id); setSelectedId(null); }}
          onEdit={(id) => { if (onEditStory) onEditStory(id); setSelectedId(null); }}
        />
      )}
    </div>
  );
}
