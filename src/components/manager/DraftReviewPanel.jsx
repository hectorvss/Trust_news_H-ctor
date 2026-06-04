import React, { useEffect, useState } from 'react';
import { CoverageDetails, SourceLogo, SourceTag, relativeTime } from '../coverage';
import { approveDraftStory, fetchDraftReview, rejectDraftStory } from '../../supabaseService';
import { useBreakpoint } from '../../hooks/useBreakpoint';

const fontHeading = 'var(--font-heading)';
const fontMono = 'var(--font-mono)';

const sectionTitleStyle = {
  fontSize: '11px',
  fontWeight: 900,
  fontFamily: fontMono,
  letterSpacing: '1.5px',
  textTransform: 'uppercase',
  opacity: 0.5,
  margin: '0 0 12px 0'
};

const btnLabel = {
  fontFamily: fontMono,
  fontSize: '11px',
  fontWeight: 900,
  letterSpacing: '1px',
  textTransform: 'uppercase'
};

const normalizeBias = (raw) => {
  if (!raw) return 'CENTER';
  const value = String(raw).trim().toLowerCase().replace(/[\s_]+/g, '-');
  if (value === 'left' || value === 'far-left' || value === 'izquierda') return 'LEFT';
  if (value === 'lean-left' || value === 'center-left' || value === 'centre-left' || value === 'centro-izquierda') return 'LEAN_LEFT';
  if (value === 'right' || value === 'far-right' || value === 'derecha') return 'RIGHT';
  if (value === 'lean-right' || value === 'center-right' || value === 'centre-right' || value === 'centro-derecha') return 'LEAN_RIGHT';
  return 'CENTER';
};

export default function DraftReviewPanel({ storyId, onClose, onApproved, onRejected, onEdit }) {
  const { isMobile } = useBreakpoint();
  const topOffset = 72;
  const [loaded, setLoaded] = useState(null);
  const [busy, setBusy] = useState(null);

  useEffect(() => {
    let alive = true;
    fetchDraftReview(storyId)
      .then((review) => {
        if (alive) setLoaded({ id: storyId, review });
      })
      .catch(() => {
        if (alive) setLoaded({ id: storyId, review: null });
      });

    return () => {
      alive = false;
    };
  }, [storyId]);

  const loading = !loaded || loaded.id !== storyId;
  const review = loading ? null : loaded.review;
  const story = review?.story || null;
  const articles = Array.isArray(review?.articles) ? review.articles : [];

  const sources = articles.map((article) => ({
    id: article.id,
    name: article.source?.name || '-',
    logoUrl: article.source?.logoUrl || null,
    domain: null,
    biasRating: normalizeBias(article.source?.biasLabel || article.bias)
  }));

  const handleApprove = async () => {
    setBusy('approve');
    const ok = await approveDraftStory(storyId);
    setBusy(null);
    if (ok) onApproved && onApproved(storyId);
  };

  const handleReject = async () => {
    const reason = window.prompt('Motivo del rechazo (opcional):', '');
    if (reason === null) return;

    setBusy('reject');
    const ok = await rejectDraftStory(storyId, reason || '');
    setBusy(null);
    if (ok) onRejected && onRejected(storyId);
  };

  const disabled = busy !== null;
  const storyImage = story?.image_url || story?.image || null;
  const trace = review?.trace || {};
  const generationMetadata = trace.generationMetadata || {};
  const editorialValidation = trace.editorialValidation || {};
  const llmTrace = trace.llm || generationMetadata.llm || {};
  const evidence = trace.evidence || generationMetadata.evidence || {};
  const evidenceQuality = trace.evidenceQuality || generationMetadata.evidence_quality || evidence.quality || {};
  const claimsMatrix = Array.isArray(trace.claimsMatrix) ? trace.claimsMatrix : [];
  const sourceTrace = Array.isArray(trace.sourceTrace) ? trace.sourceTrace : [];
  const missingEvidence = Array.isArray(trace.missingEvidence) ? trace.missingEvidence : [];
  const segmentTrace = Array.isArray(trace.segmentTrace) ? trace.segmentTrace : [];
  const segmentSummary = trace.segmentSummary || generationMetadata.segment_summary || editorialValidation.segment_summary || null;
  const usedArticles = Array.isArray(evidence.used_articles) ? evidence.used_articles : [];
  const omittedArticles = Array.isArray(evidence.omitted_articles) ? evidence.omitted_articles : [];
  const validationErrors = Array.isArray(editorialValidation.errors) ? editorialValidation.errors : [];
  const validationWarnings = Array.isArray(editorialValidation.warnings) ? editorialValidation.warnings : [];
  const llmUsage = llmTrace.token_usage || {};
  const evidenceScore = evidenceQuality.overall_score == null ? null : Math.round(Number(evidenceQuality.overall_score) * 100);

  const pill = (label, value, tone = '#000') => (
    <span
      key={`${label}-${value}`}
      style={{
        display: 'inline-flex',
        gap: '5px',
        alignItems: 'center',
        border: '1px solid #ddd',
        borderRadius: 'var(--radius-sm)',
        padding: '6px 8px',
        fontFamily: fontMono,
        fontSize: '10px',
        fontWeight: 900,
        color: tone,
        background: '#fff'
      }}
    >
      <span style={{ opacity: 0.45 }}>{label}</span>
      <span>{value ?? '-'}</span>
    </span>
  );

  const backdrop = {
    position: 'fixed',
    top: topOffset,
    right: 0,
    bottom: 0,
    left: 0,
    background: 'rgba(0,0,0,0.45)',
    zIndex: 2999
  };

  const panel = {
    position: 'fixed',
    top: topOffset,
    right: 0,
    bottom: 0,
    width: isMobile ? '100vw' : 'min(560px, 92vw)',
    maxWidth: '100vw',
    background: '#fff',
    borderLeft: isMobile ? 'none' : 'var(--border-thin)',
    overflowY: 'auto',
    zIndex: 3000,
    padding: isMobile ? '20px 16px 16px' : '28px',
    boxShadow: isMobile ? 'none' : '-24px 0 64px rgba(0,0,0,0.25)',
    fontFamily: fontHeading,
    boxSizing: 'border-box'
  };

  const closeBtn = (
    <button
      onClick={onClose}
      style={{
        ...btnLabel,
        background: 'white',
        border: '1px solid #ddd',
        borderRadius: 'var(--radius-sm)',
        padding: isMobile ? '8px 12px' : '8px 14px',
        cursor: 'pointer',
        color: '#000'
      }}
    >
      X CERRAR
    </button>
  );

  return (
    <>
      <div style={backdrop} onClick={onClose} aria-hidden="true" />
      <aside style={panel} role="dialog" aria-modal="true" aria-label="Revision de noticia autogenerada">
        {loading && (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>{closeBtn}</div>
            <div
              style={{
                padding: '80px 0',
                textAlign: 'center',
                fontFamily: fontMono,
                fontWeight: 900,
                fontSize: '13px',
                letterSpacing: '2px',
                opacity: 0.4
              }}
            >
              CARGANDO REVISION...
            </div>
          </>
        )}

        {!loading && !story && (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>{closeBtn}</div>
            <div
              style={{
                padding: '60px 0',
                textAlign: 'center',
                fontFamily: fontMono,
                fontWeight: 900,
                fontSize: '12px',
                letterSpacing: '1.5px',
                opacity: 0.5,
                lineHeight: 1.8
              }}
            >
              NO SE PUDO CARGAR LA REVISION
              <div style={{ marginTop: '8px', fontWeight: 700, opacity: 0.7 }}>
                La noticia no existe o no hay permisos de lectura.
              </div>
            </div>
          </>
        )}

        {!loading && story && (
          <>
            <div
              style={{
                display: 'flex',
                alignItems: isMobile ? 'flex-start' : 'center',
                justifyContent: 'space-between',
                gap: '12px',
                flexDirection: isMobile ? 'column' : 'row',
                marginBottom: '18px'
              }}
            >
              <span style={{ ...btnLabel, fontSize: '10px', opacity: 0.45 }}>REVISION DE NOTICIA AUTOGENERADA</span>
              {closeBtn}
            </div>

            <h2
              style={{
                fontSize: isMobile ? '20px' : '24px',
                fontWeight: 800,
                letterSpacing: '-0.8px',
                lineHeight: 1.15,
                margin: '0 0 12px 0',
                fontFamily: fontHeading
              }}
            >
              {story.title || '(sin titulo)'}
            </h2>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                alignItems: 'center',
                fontSize: '11px',
                fontFamily: fontMono,
                letterSpacing: '0.3px',
                opacity: 0.7,
                marginBottom: '22px'
              }}
            >
              <span style={{ fontWeight: 900, textTransform: 'uppercase' }}>{story.category || '-'}</span>
              <span style={{ opacity: 0.4 }}>.</span>
              <span>{story.totalSources || 0} fuentes</span>
              <span style={{ opacity: 0.4 }}>.</span>
              <span>{relativeTime(story.coverageUpdatedAt)}</span>
              <span style={{ opacity: 0.4 }}>.</span>
              {(story.consensoNarrativo || story.consensus_narrative) ? (
                <span style={{ fontWeight: 900, color: '#16a34a' }}>sintetizada</span>
              ) : (
                <span style={{ fontWeight: 900, opacity: 0.6 }}>en analisis</span>
              )}
            </div>

            {storyImage && (
              <img
                src={storyImage}
                alt={story.title || ''}
                style={{
                  width: '100%',
                  height: isMobile ? '150px' : '180px',
                  objectFit: 'cover',
                  display: 'block',
                  borderRadius: 'var(--radius-sm)',
                  border: 'var(--border-thin)',
                  marginBottom: '24px'
                }}
              />
            )}

            <section style={{ marginBottom: '28px' }}>
              <h3 style={sectionTitleStyle}>Resumen</h3>
              <p style={{ fontSize: '14px', lineHeight: 1.6, margin: 0, color: '#1a1a1a' }}>
                {story.summary || 'Sin resumen.'}
              </p>
            </section>

            <section style={{ marginBottom: '28px' }}>
              <h3 style={sectionTitleStyle}>Trazabilidad editorial</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                {pill('evidencia', evidenceScore == null ? '-' : `${evidenceScore}%`, evidenceScore != null && evidenceScore < 35 ? '#dc2626' : '#000')}
                {pill('modelo', llmTrace.model || '-')}
                {pill('tokens', Number(llmUsage.input_tokens || 0) + Number(llmUsage.output_tokens || 0))}
                {pill('salida', llmUsage.output_tokens || 0)}
                {pill('intentos', Array.isArray(llmTrace.attempts) ? llmTrace.attempts.length : (llmTrace.llm_attempts || '-'))}
                {pill('repair', llmTrace.repair_used ? 'si' : 'no', llmTrace.repair_used ? '#b45309' : '#000')}
                {pill('prompt', llmTrace.prompt_version || generationMetadata.llm?.prompt_version || '-')}
              </div>

              {(validationErrors.length > 0 || validationWarnings.length > 0 || missingEvidence.length > 0) && (
                <div
                  style={{
                    border: '1px dashed #bbb',
                    borderRadius: 'var(--radius-sm)',
                    background: '#fafafa',
                    padding: '12px 14px',
                    fontSize: '11px',
                    fontFamily: fontMono,
                    lineHeight: 1.6,
                    color: '#444'
                  }}
                >
                  {validationErrors.length > 0 && <div><strong>Errores:</strong> {validationErrors.slice(0, 5).join(' | ')}</div>}
                  {validationWarnings.length > 0 && <div><strong>Avisos:</strong> {validationWarnings.slice(0, 5).join(' | ')}</div>}
                {missingEvidence.length > 0 && <div><strong>Evidencia faltante:</strong> {missingEvidence.slice(0, 5).join(' | ')}</div>}
              </div>
            )}
          </section>

            <section style={{ marginBottom: '28px' }}>
              <h3 style={sectionTitleStyle}>Cobertura por segmentos</h3>
              {segmentSummary && (
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  marginBottom: '12px'
                }}>
                  {pill('core completos', segmentSummary.core_complete_count ?? segmentSummary.complete_count ?? 0, '#16a34a')}
                  {pill('core parciales', segmentSummary.core_partial_count ?? segmentSummary.partial_count ?? 0, '#b45309')}
                  {pill('core faltan', segmentSummary.core_missing_count ?? segmentSummary.missing_count ?? 0, '#dc2626')}
                  {pill('cobertura core', segmentSummary.core_completion_rate == null ? '-' : `${Math.round(Number(segmentSummary.core_completion_rate || 0) * 100)}%`, '#000')}
                </div>
              )}
              {segmentTrace.length === 0 ? (
                <div style={{ fontSize: '12px', fontFamily: fontMono, opacity: 0.55 }}>Sin trazabilidad segmentada disponible.</div>
              ) : (
                <div style={{ display: 'grid', gap: '8px' }}>
                  {segmentTrace.map((segment) => {
                    const tone = segment.status === 'complete'
                      ? '#16a34a'
                      : segment.status === 'partial'
                        ? '#b45309'
                        : segment.status === 'explained_missing'
                          ? '#6b7280'
                          : '#dc2626';
                    return (
                      <div key={segment.key} style={{ border: '1px solid #eee', borderRadius: 'var(--radius-sm)', padding: '10px 12px', background: '#fff' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '6px' }}>
                          <div style={{ fontSize: '12px', fontWeight: 800, lineHeight: 1.4 }}>{segment.label || segment.key}</div>
                          <div style={{ ...btnLabel, fontSize: '9px', color: tone }}>{segment.status || 'missing'}</div>
                        </div>
                        <div style={{ fontSize: '11px', fontFamily: fontMono, opacity: 0.7, lineHeight: 1.5 }}>
                          {segment.note || 'Sin observaciones.'}
                        </div>
                        {Array.isArray(segment.evidence_article_ids) && segment.evidence_article_ids.length > 0 && (
                          <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {segment.evidence_article_ids.slice(0, 4).map((articleId) => (
                              <span key={`${segment.key}-${articleId}`} style={{ padding: '4px 8px', border: '1px solid #ddd', borderRadius: 'var(--radius-sm)', fontSize: '10px', fontFamily: fontMono, background: '#fafafa', opacity: 0.8 }}>
                                {articleId}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section style={{ marginBottom: '28px' }}>
              <h3 style={sectionTitleStyle}>Cifras y claims</h3>
              {(!Array.isArray(story.cifrasClave) || story.cifrasClave.length === 0) && claimsMatrix.length === 0 ? (
                <div style={{ fontSize: '12px', fontFamily: fontMono, opacity: 0.55 }}>Sin cifras o claims referenciados.</div>
              ) : (
                <div style={{ display: 'grid', gap: '8px' }}>
                  {(Array.isArray(story.cifrasClave) ? story.cifrasClave : []).slice(0, 6).map((figure, index) => (
                    <div key={`figure-${index}`} style={{ border: '1px solid #eee', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 800, lineHeight: 1.4 }}>{figure.label || figure.value || figure.claim || '-'}</div>
                      <div style={{ marginTop: '6px', fontSize: '10px', fontFamily: fontMono, opacity: 0.65 }}>
                        article_id {figure.source_article_id || figure.article_id || '-'} · {figure.source || '-'} · confianza {figure.confidence || '-'}
                      </div>
                    </div>
                  ))}
                  {claimsMatrix.slice(0, 6).map((claim, index) => (
                    <div key={`claim-${index}`} style={{ border: '1px solid #eee', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 800, lineHeight: 1.4 }}>{claim.claim || claim.text || '-'}</div>
                      <div style={{ marginTop: '6px', fontSize: '10px', fontFamily: fontMono, opacity: 0.65 }}>
                        article_id {claim.source_article_id || claim.article_id || '-'} · {claim.source || '-'} · confianza {claim.confidence || '-'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section style={{ marginBottom: '28px' }}>
              <h3 style={sectionTitleStyle}>Analisis de cobertura</h3>
              <CoverageDetails story={review.story} sources={sources} />
            </section>

            <section style={{ marginBottom: '28px' }}>
              <h3 style={sectionTitleStyle}>Sintesis IA</h3>
              {(story.consensoNarrativo || story.consensus_narrative) ? (
                <>
                  {(() => {
                    const raw = story.consensoNarrativo || story.consensus_narrative || '';
                    const parts = raw.split('|').map((part) => part.trim());
                    const has3 = parts.length >= 3 && parts.some((part) => part);

                    if (has3) {
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {[['Izquierda', parts[0]], ['Centro', parts[1]], ['Derecha', parts[2]]].map(([label, text]) => (
                            <div key={label} style={{ borderLeft: '3px solid #000', paddingLeft: '14px' }}>
                              <div style={{ ...btnLabel, fontSize: '9px', opacity: 0.5, marginBottom: '4px' }}>{label}</div>
                              <div style={{ fontSize: '13px', lineHeight: 1.6, color: '#1a1a1a' }}>{text || '-'}</div>
                            </div>
                          ))}
                        </div>
                      );
                    }

                    return (
                      <div
                        style={{
                          border: 'var(--border-thin)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '16px 18px',
                          background: '#fafafa',
                          fontSize: '13px',
                          lineHeight: 1.6,
                          color: '#1a1a1a'
                        }}
                      >
                        {raw}
                      </div>
                    );
                  })()}

                  {story.blindSpot && (
                    <div style={{ marginTop: '14px' }}>
                      <div style={{ ...btnLabel, fontSize: '10px', opacity: 0.5, marginBottom: '8px' }}>ANGULO IGNORADO</div>
                      <div
                        style={{
                          borderLeft: '3px solid #000',
                          paddingLeft: '14px',
                          fontSize: '13px',
                          lineHeight: 1.6,
                          color: '#1a1a1a'
                        }}
                      >
                        {story.blindSpot}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div
                  style={{
                    padding: '16px 18px',
                    background: '#fafafa',
                    border: '1px dashed #bbb',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12px',
                    fontFamily: fontMono,
                    letterSpacing: '0.3px',
                    color: '#555',
                    lineHeight: 1.6
                  }}
                >
                  Sintesis IA pendiente (requiere ANTHROPIC_API_KEY).
                </div>
              )}
            </section>

            {(sourceTrace.length > 0 || usedArticles.length > 0 || omittedArticles.length > 0) && (
              <section style={{ marginBottom: '28px' }}>
                <h3 style={sectionTitleStyle}>Articulos usados vs omitidos</h3>
                <div style={{ display: 'grid', gap: '10px' }}>
                  {sourceTrace.length > 0 && (
                    <div style={{ border: 'var(--border-thin)', borderRadius: 'var(--radius-sm)', padding: '12px 14px' }}>
                      <div style={{ ...btnLabel, fontSize: '9px', opacity: 0.5, marginBottom: '8px' }}>comparacion editorial</div>
                      {sourceTrace.slice(0, 6).map((entry, index) => (
                        <div key={`trace-${index}`} style={{ fontSize: '11px', lineHeight: 1.55, marginBottom: index < sourceTrace.length - 1 ? '6px' : 0 }}>
                          <strong>{entry.source || entry.article_id || '-'}</strong>: {entry.angle || entry.reason || entry.diff || '-'}
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px' }}>
                    <div style={{ border: '1px solid #eee', borderRadius: 'var(--radius-sm)', padding: '12px 14px' }}>
                      <div style={{ ...btnLabel, fontSize: '9px', opacity: 0.5, marginBottom: '8px' }}>usados en prompt</div>
                      {usedArticles.length === 0 ? (
                        <div style={{ fontSize: '11px', fontFamily: fontMono, opacity: 0.5 }}>Sin detalle.</div>
                      ) : usedArticles.slice(0, 8).map((item, index) => (
                        <div key={`used-${index}`} style={{ fontSize: '11px', lineHeight: 1.5, marginBottom: '5px' }}>
                          {item.source || item.source_name || item.article_id || '-'} <span style={{ opacity: 0.5 }}>({item.reason || item.tier || 'evidence'})</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ border: '1px solid #eee', borderRadius: 'var(--radius-sm)', padding: '12px 14px' }}>
                      <div style={{ ...btnLabel, fontSize: '9px', opacity: 0.5, marginBottom: '8px' }}>omitidos</div>
                      {omittedArticles.length === 0 ? (
                        <div style={{ fontSize: '11px', fontFamily: fontMono, opacity: 0.5 }}>Sin omisiones relevantes.</div>
                      ) : omittedArticles.slice(0, 8).map((item, index) => (
                        <div key={`omitted-${index}`} style={{ fontSize: '11px', lineHeight: 1.5, marginBottom: '5px' }}>
                          {item.source || item.source_name || item.article_id || '-'} <span style={{ opacity: 0.5 }}>({item.reason || 'fuera del limite'})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}

            <section style={{ marginBottom: '28px' }}>
              <h3 style={sectionTitleStyle}>Articulos agrupados ({articles.length})</h3>
              {articles.length === 0 ? (
                <div
                  style={{
                    padding: '14px 16px',
                    background: '#fafafa',
                    border: '1px dashed #bbb',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '11px',
                    fontFamily: fontMono,
                    letterSpacing: '0.3px',
                    color: '#666'
                  }}
                >
                  Sin articulos asociados al cluster.
                </div>
              ) : (
                <div style={{ border: 'var(--border-thin)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                  {articles.map((article, index) => (
                    <div
                      key={article.id || index}
                      style={{
                        display: 'flex',
                        gap: '12px',
                        padding: isMobile ? '12px' : '14px 16px',
                        borderTop: index > 0 ? '1px solid #eee' : 'none',
                        alignItems: 'flex-start'
                      }}
                    >
                      <SourceLogo source={sources[index]} size={22} />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '6px'
                          }}
                        >
                          <span style={{ fontSize: '12px', fontWeight: 800, fontFamily: fontMono }}>
                            {article.source?.name || '-'}
                          </span>
                          <SourceTag kind="bias" value={sources[index].biasRating} />
                          <span style={{ fontSize: '10px', fontFamily: fontMono, opacity: 0.45 }}>
                            {relativeTime(article.publishedAt)}
                          </span>
                        </div>
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            fontSize: '13px',
                            fontWeight: 600,
                            lineHeight: 1.4,
                            color: '#000',
                            textDecoration: 'none',
                            display: 'inline-block'
                          }}
                        >
                          {article.title} {'->'}
                        </a>
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '6px',
                            marginTop: '8px',
                            fontSize: '9px',
                            fontFamily: fontMono,
                            letterSpacing: '0.6px',
                            textTransform: 'uppercase',
                            color: '#555'
                          }}
                        >
                          <span>calidad {article.extractionQualityScore == null ? '-' : Math.round(article.extractionQualityScore * 100)}</span>
                          {article.parserUsed && <span>{article.parserUsed}</span>}
                          {article.contentSource && <span>{article.contentSource}</span>}
                          {article.paywallDetected && <span style={{ color: '#b45309', fontWeight: 900 }}>paywall</span>}
                          {article.blockedReason && <span style={{ color: '#dc2626', fontWeight: 900 }}>{article.blockedReason}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <div
              style={{
                position: 'sticky',
                bottom: isMobile ? '-16px' : '-28px',
                background: '#fff',
                paddingTop: '16px',
                paddingBottom: '4px',
                borderTop: 'var(--border-thin)',
                marginTop: '8px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px'
              }}
            >
              <button
                onClick={handleApprove}
                disabled={disabled}
                style={{
                  ...btnLabel,
                  flex: '1 1 140px',
                  padding: '14px 16px',
                  background: '#16a34a',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  cursor: disabled ? 'wait' : 'pointer',
                  opacity: disabled ? 0.6 : 1
                }}
              >
                {busy === 'approve' ? 'PUBLICANDO...' : 'PUBLICAR'}
              </button>
              <button
                onClick={handleReject}
                disabled={disabled}
                style={{
                  ...btnLabel,
                  flex: '1 1 130px',
                  padding: '14px 16px',
                  background: 'white',
                  color: '#dc2626',
                  border: '2px solid #dc2626',
                  borderRadius: 'var(--radius-sm)',
                  cursor: disabled ? 'wait' : 'pointer',
                  opacity: disabled ? 0.6 : 1
                }}
              >
                {busy === 'reject' ? 'RECHAZANDO...' : 'RECHAZAR'}
              </button>
              <button
                onClick={() => onEdit && onEdit(storyId)}
                disabled={disabled}
                style={{
                  ...btnLabel,
                  flex: '1 1 130px',
                  padding: '14px 16px',
                  background: 'white',
                  color: '#000',
                  border: '1px solid #ddd',
                  borderRadius: 'var(--radius-sm)',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: disabled ? 0.6 : 1
                }}
              >
                EDITAR EN VISTA {'->'}
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
