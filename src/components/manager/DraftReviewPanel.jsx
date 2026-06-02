import React, { useState, useEffect } from 'react';
import {
  CoverageDetails, SourceTag, SourceLogo, relativeTime
} from '../coverage';
import {
  fetchDraftReview, approveDraftStory, rejectDraftStory
} from '../../supabaseService';

// ── Monochrome design tokens (shared manager language) ──
const fontHeading = 'var(--font-heading)';
const fontMono = 'var(--font-mono)';

const sectionTitleStyle = {
  fontSize: '11px', fontWeight: 900, fontFamily: fontMono, letterSpacing: '1.5px',
  textTransform: 'uppercase', opacity: 0.5, margin: '0 0 12px 0'
};
const btnLabel = {
  fontFamily: fontMono, fontSize: '11px', fontWeight: 900, letterSpacing: '1px',
  textTransform: 'uppercase'
};

// Map any free-text lean to the 5-point scale the coverage components expect.
const normalizeBias = (raw) => {
  if (!raw) return 'CENTER';
  const v = String(raw).trim().toLowerCase().replace(/[\s_]+/g, '-');
  if (v === 'left' || v === 'far-left' || v === 'izquierda') return 'LEFT';
  if (v === 'lean-left' || v === 'center-left' || v === 'centre-left' || v === 'centro-izquierda') return 'LEAN_LEFT';
  if (v === 'right' || v === 'far-right' || v === 'derecha') return 'RIGHT';
  if (v === 'lean-right' || v === 'center-right' || v === 'centre-right' || v === 'centro-derecha') return 'LEAN_RIGHT';
  if (v === 'center' || v === 'centre' || v === 'centro' || v === 'neutral') return 'CENTER';
  return 'CENTER';
};

export default function DraftReviewPanel({ storyId, onClose, onApproved, onRejected, onEdit }) {
  // `loaded` holds { id, review } for whichever storyId resolved last. Deriving
  // loading/review from it (vs. setting state synchronously in the effect) keeps
  // the mount/refetch effect free of synchronous setState cascading renders, and
  // guards against a stale response from a previous storyId rendering.
  const [loaded, setLoaded] = useState(null);
  const [busy, setBusy] = useState(null); // 'approve' | 'reject' | null

  useEffect(() => {
    let alive = true;
    fetchDraftReview(storyId)
      .then((r) => { if (alive) setLoaded({ id: storyId, review: r }); })
      .catch(() => { if (alive) setLoaded({ id: storyId, review: null }); });
    return () => { alive = false; };
  }, [storyId]);

  const loading = !loaded || loaded.id !== storyId;
  const review = loading ? null : loaded.review;
  const story = review?.story || null;
  const articles = Array.isArray(review?.articles) ? review.articles : [];

  // Enriched sources array consumed by the coverage components.
  const sources = articles.map((a) => ({
    id: a.id,
    name: a.source?.name || '—',
    logoUrl: a.source?.logoUrl || null,
    domain: null,
    biasRating: normalizeBias(a.source?.biasLabel || a.bias)
  }));

  const handleApprove = async () => {
    setBusy('approve');
    const ok = await approveDraftStory(storyId);
    setBusy(null);
    if (ok) onApproved && onApproved(storyId);
  };

  const handleReject = async () => {
    const reason = window.prompt('Motivo del rechazo (opcional):', '');
    if (reason === null) return; // cancelled
    setBusy('reject');
    const ok = await rejectDraftStory(storyId, reason || '');
    setBusy(null);
    if (ok) onRejected && onRejected(storyId);
  };

  const disabled = busy !== null;

  // ── Layout shells ──
  const backdrop = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2999
  };
  const panel = {
    position: 'fixed', top: 0, right: 0, bottom: 0, width: '520px', maxWidth: '92vw',
    background: '#fff', borderLeft: 'var(--border-thin)', overflowY: 'auto', zIndex: 3000,
    padding: '28px', boxShadow: '-24px 0 64px rgba(0,0,0,0.25)', fontFamily: fontHeading,
    boxSizing: 'border-box'
  };

  const closeBtn = (
    <button
      onClick={onClose}
      style={{
        ...btnLabel, background: 'white', border: '1px solid #ddd', borderRadius: 'var(--radius-sm)',
        padding: '8px 14px', cursor: 'pointer', color: '#000'
      }}
    >
      ✕ CERRAR
    </button>
  );

  return (
    <>
      <div style={backdrop} onClick={onClose} aria-hidden="true" />
      <aside style={panel} role="dialog" aria-modal="true" aria-label="Revisión de noticia autogenerada">
        {loading && (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>{closeBtn}</div>
            <div style={{
              padding: '80px 0', textAlign: 'center', fontFamily: fontMono, fontWeight: 900,
              fontSize: '13px', letterSpacing: '2px', opacity: 0.4
            }}>
              CARGANDO REVISIÓN…
            </div>
          </>
        )}

        {!loading && !story && (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>{closeBtn}</div>
            <div style={{
              padding: '60px 0', textAlign: 'center', fontFamily: fontMono, fontWeight: 900,
              fontSize: '12px', letterSpacing: '1.5px', opacity: 0.5, lineHeight: 1.8
            }}>
              NO SE PUDO CARGAR LA REVISIÓN
              <div style={{ marginTop: '8px', fontWeight: 700, opacity: 0.7 }}>
                La noticia no existe o no hay permisos de lectura.
              </div>
            </div>
          </>
        )}

        {!loading && story && (
          <>
            {/* 1 ── Cabecera ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <span style={{ ...btnLabel, fontSize: '10px', opacity: 0.45 }}>
                REVISIÓN DE NOTICIA AUTOGENERADA
              </span>
              {closeBtn}
            </div>

            <h2 style={{
              fontSize: '24px', fontWeight: 800, letterSpacing: '-0.8px', lineHeight: 1.15,
              margin: '0 0 12px 0', fontFamily: fontHeading
            }}>
              {story.title || '(sin título)'}
            </h2>

            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center',
              fontSize: '11px', fontFamily: fontMono, letterSpacing: '0.3px', opacity: 0.7,
              marginBottom: '22px'
            }}>
              <span style={{ fontWeight: 900, textTransform: 'uppercase' }}>{story.category || '—'}</span>
              <span style={{ opacity: 0.4 }}>·</span>
              <span>{story.totalSources || 0} fuentes</span>
              <span style={{ opacity: 0.4 }}>·</span>
              <span>{relativeTime(story.coverageUpdatedAt)}</span>
              <span style={{ opacity: 0.4 }}>·</span>
              {(story.consensoNarrativo || story.consensus_narrative)
                ? <span style={{ fontWeight: 900, color: '#16a34a' }}>✓ sintetizada</span>
                : <span style={{ fontWeight: 900, opacity: 0.6 }}>🟡 en análisis</span>}
            </div>

            {/* 2 ── Imagen ── */}
            {story.image_url && (
              <img
                src={story.image}
                alt={story.title || ''}
                style={{
                  width: '100%', height: '180px', objectFit: 'cover', display: 'block',
                  borderRadius: 'var(--radius-sm)', border: 'var(--border-thin)', marginBottom: '24px'
                }}
              />
            )}

            {/* 3 ── Resumen ── */}
            <section style={{ marginBottom: '28px' }}>
              <h3 style={sectionTitleStyle}>Resumen</h3>
              <p style={{ fontSize: '14px', lineHeight: 1.6, margin: 0, color: '#1a1a1a' }}>
                {story.summary || 'Sin resumen.'}
              </p>
            </section>

            {/* 4 ── Análisis de cobertura (corazón) ── */}
            <section style={{ marginBottom: '28px' }}>
              <h3 style={sectionTitleStyle}>Análisis de cobertura</h3>
              <CoverageDetails story={review.story} sources={sources} />
            </section>

            {/* 5 ── Síntesis IA ── */}
            <section style={{ marginBottom: '28px' }}>
              <h3 style={sectionTitleStyle}>Síntesis IA</h3>
              {(story.consensoNarrativo || story.consensus_narrative) ? (
                <>
                  {(() => {
                    const raw = story.consensoNarrativo || story.consensus_narrative || '';
                    const parts = raw.split('|').map((p) => p.trim());
                    const has3 = parts.length >= 3 && parts.some((p) => p);
                    if (has3) {
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {[['Izquierda', parts[0]], ['Centro', parts[1]], ['Derecha', parts[2]]].map(([lbl, txt]) => (
                            <div key={lbl} style={{ borderLeft: '3px solid #000', paddingLeft: '14px' }}>
                              <div style={{ ...btnLabel, fontSize: '9px', opacity: 0.5, marginBottom: '4px' }}>{lbl}</div>
                              <div style={{ fontSize: '13px', lineHeight: 1.6, color: '#1a1a1a' }}>{txt || '—'}</div>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return (
                      <div style={{
                        border: 'var(--border-thin)', borderRadius: 'var(--radius-sm)', padding: '16px 18px',
                        background: '#fafafa', fontSize: '13px', lineHeight: 1.6, color: '#1a1a1a'
                      }}>
                        {raw}
                      </div>
                    );
                  })()}
                  {story.blindSpot && (
                    <div style={{ marginTop: '14px' }}>
                      <div style={{ ...btnLabel, fontSize: '10px', opacity: 0.5, marginBottom: '8px' }}>
                        ÁNGULO IGNORADO
                      </div>
                      <div style={{
                        borderLeft: '3px solid #000', paddingLeft: '14px', fontSize: '13px',
                        lineHeight: 1.6, color: '#1a1a1a'
                      }}>
                        {story.blindSpot}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div style={{
                  padding: '16px 18px', background: '#fafafa', border: '1px dashed #bbb',
                  borderRadius: 'var(--radius-sm)', fontSize: '12px', fontFamily: fontMono,
                  letterSpacing: '0.3px', color: '#555', lineHeight: 1.6
                }}>
                  Síntesis IA pendiente (requiere ANTHROPIC_API_KEY).
                </div>
              )}
            </section>

            {/* 6 ── Artículos del cluster ── */}
            <section style={{ marginBottom: '28px' }}>
              <h3 style={sectionTitleStyle}>Artículos agrupados ({articles.length})</h3>
              {articles.length === 0 ? (
                <div style={{
                  padding: '14px 16px', background: '#fafafa', border: '1px dashed #bbb',
                  borderRadius: 'var(--radius-sm)', fontSize: '11px', fontFamily: fontMono,
                  letterSpacing: '0.3px', color: '#666'
                }}>
                  Sin artículos asociados al cluster.
                </div>
              ) : (
                <div style={{ border: 'var(--border-thin)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                  {articles.map((a, i) => (
                    <div
                      key={a.id || i}
                      style={{
                        display: 'flex', gap: '12px', padding: '14px 16px',
                        borderTop: i > 0 ? '1px solid #eee' : 'none', alignItems: 'flex-start'
                      }}
                    >
                      <SourceLogo source={sources[i]} size={22} />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{
                          display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginBottom: '6px'
                        }}>
                          <span style={{ fontSize: '12px', fontWeight: 800, fontFamily: fontMono }}>
                            {a.source?.name || '—'}
                          </span>
                          <SourceTag kind="bias" value={sources[i].biasRating} />
                          <span style={{ fontSize: '10px', fontFamily: fontMono, opacity: 0.45 }}>
                            {relativeTime(a.publishedAt)}
                          </span>
                        </div>
                        <a
                          href={a.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            fontSize: '13px', fontWeight: 600, lineHeight: 1.4, color: '#000',
                            textDecoration: 'none', display: 'inline-block'
                          }}
                        >
                          {a.title} ↗
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 7 ── Acciones (sticky) ── */}
            <div style={{
              position: 'sticky', bottom: '-28px', background: '#fff', paddingTop: '16px',
              paddingBottom: '4px', borderTop: 'var(--border-thin)', marginTop: '8px',
              display: 'flex', flexWrap: 'wrap', gap: '10px'
            }}>
              <button
                onClick={handleApprove}
                disabled={disabled}
                style={{
                  ...btnLabel, flex: '1 1 140px', padding: '14px 16px', background: '#16a34a',
                  color: 'white', border: 'none', borderRadius: 'var(--radius-sm)',
                  cursor: disabled ? 'wait' : 'pointer', opacity: disabled ? 0.6 : 1
                }}
              >
                {busy === 'approve' ? 'PUBLICANDO…' : '✓ PUBLICAR'}
              </button>
              <button
                onClick={handleReject}
                disabled={disabled}
                style={{
                  ...btnLabel, flex: '1 1 130px', padding: '14px 16px', background: 'white',
                  color: '#dc2626', border: '2px solid #dc2626', borderRadius: 'var(--radius-sm)',
                  cursor: disabled ? 'wait' : 'pointer', opacity: disabled ? 0.6 : 1
                }}
              >
                {busy === 'reject' ? 'RECHAZANDO…' : '✕ RECHAZAR'}
              </button>
              <button
                onClick={() => onEdit && onEdit(storyId)}
                disabled={disabled}
                style={{
                  ...btnLabel, flex: '1 1 130px', padding: '14px 16px', background: 'white',
                  color: '#000', border: '1px solid #ddd', borderRadius: 'var(--radius-sm)',
                  cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1
                }}
              >
                EDITAR EN VISTA →
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
