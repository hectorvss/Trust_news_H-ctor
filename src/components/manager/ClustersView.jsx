import React, { useState, useEffect } from 'react';
import { MiniBiasBar, BUCKET_LABEL, relativeTime } from '../coverage';
import { fetchClusters, fetchClusterArticles } from '../../supabaseService';
import { useBreakpoint } from '../../hooks/useBreakpoint';

const MONO = 'var(--font-mono)';

const colHeaderStyle = {
  background: '#f5f5f5',
  fontFamily: MONO,
  fontSize: '10px',
  fontWeight: 900,
  letterSpacing: '1px',
  textTransform: 'uppercase',
};

const chipStyle = {
  display: 'inline-block',
  background: '#f0f0f0',
  padding: '3px 7px',
  fontSize: '9px',
  fontFamily: MONO,
  fontWeight: 700,
  whiteSpace: 'nowrap',
};

const badgeStyle = (active) => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '3px 8px',
  fontSize: '9px',
  fontFamily: MONO,
  fontWeight: 800,
  letterSpacing: '0.5px',
  textTransform: 'uppercase',
  border: '1px solid #000',
  background: active ? '#000' : '#fff',
  color: active ? '#fff' : '#000',
  whiteSpace: 'nowrap',
});

// Dominant lean label, e.g. "62% Centro", from a {left,center,right} distribution.
const dominantLean = (d) => {
  if (!d) return null;
  const entries = [
    { key: 'LEFT', pct: d.left || 0 },
    { key: 'CENTER', pct: d.center || 0 },
    { key: 'RIGHT', pct: d.right || 0 },
  ];
  const top = entries.reduce((a, b) => (b.pct > a.pct ? b : a), entries[0]);
  if (top.pct <= 0) return null;
  return `${top.pct}% ${BUCKET_LABEL[top.key]}`;
};

const clusterTitle = (c) => {
  if (c.topic_summary && c.topic_summary.trim()) return c.topic_summary.trim();
  if (Array.isArray(c.keywords) && c.keywords.length) return c.keywords.slice(0, 6).join(' · ');
  return '(sin resumen)';
};

export default function ClustersView() {
  const { isMobile } = useBreakpoint();
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCluster, setSelectedCluster] = useState(null);
  const [articles, setArticles] = useState([]);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [articlesError, setArticlesError] = useState(null);

  const loadClusters = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchClusters(80);
      setClusters(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || 'Error al cargar los clústers');
      setClusters([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClusters();
  }, []);

  const openCluster = async (cluster) => {
    setSelectedCluster(cluster);
    setArticles([]);
    setArticlesError(null);
    setArticlesLoading(true);
    try {
      const data = await fetchClusterArticles(cluster);
      setArticles(Array.isArray(data) ? data : []);
    } catch (e) {
      setArticlesError(e?.message || 'Error al cargar los artículos');
      setArticles([]);
    } finally {
      setArticlesLoading(false);
    }
  };

  const closeDetail = () => {
    setSelectedCluster(null);
    setArticles([]);
    setArticlesError(null);
  };

  return (
    <div style={{ fontFamily: 'var(--font-heading)' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '20px',
          flexWrap: 'wrap',
          borderBottom: 'var(--border-thin)',
          paddingBottom: '20px',
          marginBottom: '24px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-1px', margin: 0, lineHeight: 1.1 }}>
            CLÚSTERS DEL MOTOR
          </h2>
          <p style={{ marginTop: '10px', fontSize: '13px', color: '#666', fontFamily: MONO, letterSpacing: '0.3px', maxWidth: '620px', lineHeight: 1.5 }}>
            Cada cluster agrupa artículos de varias fuentes que cubren la misma noticia.
            Selecciona uno para inspeccionar exactamente qué artículos se agruparon juntos.
          </p>
        </div>
        <button
          onClick={loadClusters}
          disabled={loading}
          style={{
            padding: '12px 20px',
            background: '#000',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            fontFamily: MONO,
            fontSize: '11px',
            fontWeight: 900,
            letterSpacing: '1px',
            cursor: loading ? 'wait' : 'pointer',
            opacity: loading ? 0.5 : 1,
            whiteSpace: 'nowrap',
          }}
        >
          ↻ ACTUALIZAR
        </button>
      </div>

      {/* States */}
      {loading && (
        <div style={{ fontFamily: MONO, fontSize: '12px', fontWeight: 900, letterSpacing: '1px', color: '#666', padding: '40px 0' }}>
          CARGANDO CLÚSTERS…
        </div>
      )}

      {!loading && error && (
        <div style={{ fontFamily: MONO, fontSize: '12px', fontWeight: 700, color: '#000', border: 'var(--border-thin)', borderRadius: 'var(--radius-sm)', padding: '20px', background: '#f5f5f5' }}>
          Error: {error}
        </div>
      )}

      {!loading && !error && clusters.length === 0 && (
        <div style={{ fontFamily: MONO, fontSize: '12px', fontWeight: 700, color: '#666', border: 'var(--border-thin)', borderRadius: 'var(--radius-sm)', padding: '24px', textAlign: 'center' }}>
          Sin clusters — puede requerir permisos RLS
        </div>
      )}

      {/* Layout: list + optional side detail */}
      {!loading && !error && clusters.length > 0 && (
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexDirection: isMobile ? 'column' : 'row' }}>
          {/* Cluster list */}
          <div style={{ flex: selectedCluster && !isMobile ? '1 1 0' : '1 1 100%', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {clusters.map((c) => {
              const isSelected = selectedCluster && selectedCluster.id === c.id;
              const lean = dominantLean(c.biasDistribution);
              const keywords = Array.isArray(c.keywords) ? c.keywords.slice(0, 8) : [];
              return (
                <div
                  key={c.id}
                  onClick={() => openCluster(c)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openCluster(c); } }}
                  style={{
                    border: 'var(--border-thin)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '20px',
                    cursor: 'pointer',
                    background: isSelected ? '#f5f5f5' : '#fff',
                    transition: 'background 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '-0.3px', margin: 0, lineHeight: 1.3 }}>
                      {clusterTitle(c)}
                    </h3>
                    {c.story_id && (
                      <span style={{ ...badgeStyle(false), borderColor: '#000' }} title="Este cluster ya se convirtió en una noticia">
                        → materializado
                      </span>
                    )}
                  </div>

                  {keywords.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '12px' }}>
                      {keywords.map((k, i) => (
                        <span key={`${c.id}-kw-${i}`} style={chipStyle}>{k}</span>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px', marginTop: '14px', fontFamily: MONO, fontSize: '11px', color: '#444' }}>
                    <span><strong>{c.articleCount}</strong> artículos</span>
                    <span style={{ opacity: 0.4 }}>·</span>
                    <span><strong>{c.sourceCount}</strong> fuentes</span>
                    <span style={{ opacity: 0.4 }}>·</span>
                    {c.status && <span style={badgeStyle(false)}>{c.status}</span>}
                    <span style={{ opacity: 0.4 }}>·</span>
                    <span>{relativeTime(c.last_seen_at)}</span>
                  </div>

                  {c.biasDistribution && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '14px' }}>
                      <MiniBiasBar distribution={c.biasDistribution} width={120} height={8} />
                      {lean && (
                        <span style={{ fontFamily: MONO, fontSize: '10px', fontWeight: 700, color: '#444' }}>{lean}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Detail panel */}
          {selectedCluster && (
            <div
              style={{
                flex: isMobile ? '1 1 100%' : '1 1 0',
                minWidth: 0,
                width: isMobile ? '100%' : 'auto',
                border: 'var(--border-thin)',
                borderRadius: 'var(--radius-sm)',
                padding: '20px',
                position: isMobile ? 'static' : 'sticky',
                top: '20px',
                alignSelf: 'flex-start',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', borderBottom: 'var(--border-thin)', paddingBottom: '14px', marginBottom: '16px' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: MONO, fontSize: '9px', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase', color: '#888', marginBottom: '6px' }}>
                    ARTÍCULOS AGRUPADOS
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '-0.3px', margin: 0, lineHeight: 1.3 }}>
                    {clusterTitle(selectedCluster)}
                  </h3>
                </div>
                <button
                  onClick={closeDetail}
                  style={{
                    padding: '6px 12px',
                    background: '#fff',
                    color: '#000',
                    border: 'var(--border-thin)',
                    borderRadius: 'var(--radius-sm)',
                    fontFamily: MONO,
                    fontSize: '10px',
                    fontWeight: 900,
                    letterSpacing: '0.5px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  ✕ cerrar detalle
                </button>
              </div>

              {articlesLoading && (
                <div style={{ fontFamily: MONO, fontSize: '11px', fontWeight: 900, letterSpacing: '1px', color: '#666', padding: '24px 0' }}>
                  CARGANDO ARTÍCULOS…
                </div>
              )}

              {!articlesLoading && articlesError && (
                <div style={{ fontFamily: MONO, fontSize: '11px', fontWeight: 700, padding: '16px', background: '#f5f5f5', borderRadius: 'var(--radius-sm)' }}>
                  Error: {articlesError}
                </div>
              )}

              {!articlesLoading && !articlesError && articles.length === 0 && (
                <div style={{ fontFamily: MONO, fontSize: '11px', fontWeight: 700, color: '#666', padding: '16px 0' }}>
                  Sin artículos para este cluster.
                </div>
              )}

              {!articlesLoading && !articlesError && articles.length > 0 && (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                    <thead>
                      <tr>
                        <th style={{ ...colHeaderStyle, textAlign: 'left', padding: '8px 10px', width: '20%' }}>FUENTE</th>
                        <th style={{ ...colHeaderStyle, textAlign: 'left', padding: '8px 10px', width: '16%' }}>SESGO</th>
                        <th style={{ ...colHeaderStyle, textAlign: 'left', padding: '8px 10px', width: '40%' }}>TITULAR</th>
                        <th style={{ ...colHeaderStyle, textAlign: 'left', padding: '8px 10px', width: '16%' }}>PUBLICADO</th>
                        <th style={{ ...colHeaderStyle, textAlign: 'left', padding: '8px 10px', width: '8%' }}>IDIOMA</th>
                      </tr>
                    </thead>
                    <tbody>
                      {articles.map((a) => {
                        const biasValue = (a.source && a.source.biasLabel) || a.bias;
                        return (
                          <tr key={a.id} style={{ borderBottom: '1px solid #eee', verticalAlign: 'top' }}>
                            <td style={{ padding: '10px', fontSize: '12px', fontWeight: 700, wordBreak: 'break-word' }}>
                              {a.source ? a.source.name : '—'}
                            </td>
                            <td style={{ padding: '10px' }}>
                              {biasValue ? <span style={chipStyle}>{biasValue}</span> : <span style={{ color: '#bbb', fontFamily: MONO, fontSize: '10px' }}>—</span>}
                            </td>
                            <td style={{ padding: '10px', fontSize: '12px', lineHeight: 1.4, wordBreak: 'break-word' }}>
                              {a.url ? (
                                <a href={a.url} target="_blank" rel="noreferrer" style={{ color: '#000', textDecoration: 'underline' }}>
                                  {a.title} ↗
                                </a>
                              ) : (
                                a.title
                              )}
                            </td>
                            <td style={{ padding: '10px', fontFamily: MONO, fontSize: '10px', color: '#666', whiteSpace: 'nowrap' }}>
                              {relativeTime(a.publishedAt)}
                            </td>
                            <td style={{ padding: '10px' }}>
                              {a.language ? <span style={chipStyle}>{a.language}</span> : <span style={{ color: '#bbb' }}>—</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
