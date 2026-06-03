import React, { useState, useEffect } from 'react';
import { relativeTime } from '../coverage';
import { fetchPipelineStats, fetchIngestionJobs, fetchSourcesHealth } from '../../supabaseService';
import { useBreakpoint } from '../../hooks/useBreakpoint';

// ── Monochrome design tokens reused across the manager ──
const fontHeading = "var(--font-heading)";
const fontMono = "var(--font-mono)";
const BORDER = '1px solid black';

const cardLabelStyle = { fontSize: '10px', fontWeight: 900, fontFamily: fontMono, opacity: 0.4, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '10px' };
const cardValueStyle = { fontSize: '36px', fontWeight: 900, letterSpacing: '-1.5px', lineHeight: 1, fontFamily: fontHeading };
const cardSubStyle = { fontSize: '11px', fontFamily: fontMono, opacity: 0.45, marginTop: '8px', letterSpacing: '0.5px' };

const sectionTitleStyle = { fontSize: '12px', fontWeight: 900, fontFamily: fontMono, letterSpacing: '1.5px', textTransform: 'uppercase', margin: '0 0 16px 0', opacity: 0.7 };

const StatCard = ({ label, value, sub }) => (
  <div style={{ background: 'white', padding: '24px' }}>
    <div style={cardLabelStyle}>{label}</div>
    <div style={cardValueStyle}>{value}</div>
    {sub != null && <div style={cardSubStyle}>{sub}</div>}
  </div>
);

// Discreet notice shown when a fetcher returns [] / all-zero (likely RLS).
const EmptyNotice = ({ children }) => (
  <div style={{
    padding: '16px 20px', background: '#fafafa', border: '1px dashed #bbb',
    fontSize: '11px', fontFamily: fontMono, letterSpacing: '0.5px', color: '#555',
    lineHeight: 1.5
  }}>
    {children || 'Sin datos — puede requerir permisos RLS de lectura sobre las tablas del motor.'}
  </div>
);

// Monochrome status glyph for ingestion_jobs.status.
const StatusGlyph = ({ status }) => {
  const s = (status || '').toLowerCase();
  if (s === 'success' || s === 'ok' || s === 'completed') {
    return <span style={{ fontFamily: fontMono, fontWeight: 700, color: '#888' }} title={status}>✓</span>;
  }
  if (s === 'error' || s === 'failed' || s === 'failure') {
    return <span style={{ fontFamily: fontMono, fontWeight: 900, color: '#000' }} title={status}>✕</span>;
  }
  if (s === 'running' || s === 'pending' || s === 'queued') {
    return <span style={{ fontFamily: fontMono, fontWeight: 700, opacity: 0.6 }} title={status}>⏳</span>;
  }
  return <span style={{ fontFamily: fontMono, fontWeight: 700, opacity: 0.4 }} title={status}>{status || '—'}</span>;
};

const HEADER_BG = '#f5f5f5';

export default function PipelineDashboard() {
  const { isMobile } = useBreakpoint();
  const [stats, setStats] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [health, setHealth] = useState([]);
  const [loading, setLoading] = useState(true);

  // Data load — setState lives inside the promise continuation (deferred), so
  // it never triggers a synchronous cascading render from the mount effect.
  const fetchAll = () => Promise.all([
    fetchPipelineStats().catch(() => null),
    fetchIngestionJobs(40).catch(() => []),
    fetchSourcesHealth().catch(() => []),
  ]).then(([s, j, h]) => {
    setStats(s);
    setJobs(Array.isArray(j) ? j : []);
    setHealth(Array.isArray(h) ? h : []);
    setLoading(false);
  });

  // Button handler: flip to the loading state, then re-fetch.
  const refresh = () => {
    setLoading(true);
    fetchAll();
  };

  useEffect(() => { fetchAll(); }, []);

  if (loading && !stats) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center', fontFamily: fontMono, fontWeight: 900, fontSize: '13px', letterSpacing: '2px', opacity: 0.4 }}>
        CARGANDO MOTOR…
      </div>
    );
  }

  const s = stats || {};
  const rawTotal = s.rawTotal || 0;
  const rawEmbedded = s.rawEmbedded || 0;
  const rawBacklog = s.rawBacklog != null ? s.rawBacklog : Math.max(0, rawTotal - rawEmbedded);
  const embedPct = rawTotal > 0 ? Math.round((rawEmbedded / rawTotal) * 100) : 0;

  // A fetcher that returned all zeros / nulls almost certainly means RLS is
  // blocking the manager's reads on the engine tables (or they're empty).
  const statsEmpty = !stats || (
    !s.sourcesTotal && !s.rawTotal && !s.clusters && !s.published && !s.draftsPending && !s.jobs24h
  );

  // Stat cards — mirrors the existing manager visual language.
  const cards = [
    { label: 'Fuentes activas', value: s.sourcesActive ?? 0, sub: `de ${s.sourcesTotal ?? 0} totales` },
    { label: 'Artículos crudos', value: rawTotal, sub: 'raw_articles' },
    { label: 'Embebidos', value: rawEmbedded, sub: `${embedPct}% del total` },
    { label: 'Backlog sin embeber', value: rawBacklog, sub: 'pendientes' },
    { label: 'Extracción pendiente', value: s.rawExtractionPending ?? 0, sub: 'texto controlado' },
    { label: 'Contenido extraido', value: s.contentExtracted ?? 0, sub: 'lectura completa' },
    { label: 'Bloqueos HTML', value: s.contentBlocked ?? 0, sub: `${s.contentPaywalled ?? 0} paywall` },
    { label: 'Baja calidad', value: s.lowQualityExtractions ?? 0, sub: 'requiere reglas' },
    { label: 'Clusters', value: s.clusters ?? 0, sub: 'story_clusters' },
    { label: 'Refresh pendiente', value: s.refreshPending ?? 0, sub: 'noticias vivas' },
    { label: 'Drafts en cola', value: s.draftsPending ?? 0, sub: 'auto-generados' },
    { label: 'Listas revisión', value: s.draftsReady ?? 0, sub: `${s.draftsFailed ?? 0} fallidas` },
    { label: 'Publicadas', value: s.published ?? 0, sub: 'stories live' },
    { label: 'Jobs 24h', value: `${s.jobOk24h ?? 0} ok`, sub: `${s.jobErr24h ?? 0} err · ${s.jobs24h ?? 0} total` },
    { label: 'Última ingesta', value: relativeTime(s.lastIngestAt), sub: 'ingestion_jobs' },
  ];

  const cardCols = isMobile ? 1 : 3;

  // Table column templates (kept identical for header + rows).
  const jobsCols = isMobile ? '1.4fr 0.5fr 0.7fr 0.7fr' : '2fr 0.7fr 0.9fr 0.9fr 2fr 1fr';
  const healthCols = isMobile ? '1.6fr 0.6fr 0.7fr 0.8fr' : '2fr 0.8fr 0.9fr 1fr 1.2fr 0.9fr';

  const thStyle = {
    background: HEADER_BG, fontSize: '10px', fontWeight: 900, fontFamily: fontMono,
    letterSpacing: '1px', textTransform: 'uppercase', padding: '14px 16px', gap: '12px',
    display: 'grid', alignItems: 'center',
  };
  const cellStyle = {
    background: 'white', padding: '14px 16px', gap: '12px', display: 'grid',
    alignItems: 'center', fontSize: '12px', fontFamily: fontMono, letterSpacing: '0.3px',
  };
  const numCell = { textAlign: 'right', fontVariantNumeric: 'tabular-nums' };
  const ellipsis = { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };

  return (
    <div style={{ fontFamily: fontHeading }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <div>
          <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: 800, letterSpacing: '-1.5px', margin: 0, lineHeight: 1, fontFamily: fontHeading }}>
            MOTOR DE INGESTA
          </h2>
          <div style={{ marginTop: '10px', fontSize: '11px', fontFamily: fontMono, opacity: 0.45, letterSpacing: '0.5px' }}>
            Pipeline read-only · RSS → embeddings → clusters → drafts
          </div>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          style={{
            padding: '14px 22px', background: 'black', color: 'white', border: 'none',
            fontWeight: 900, fontSize: '11px', fontFamily: fontMono, letterSpacing: '1.5px',
            cursor: loading ? 'wait' : 'pointer', borderRadius: 'var(--radius-sm)',
            opacity: loading ? 0.5 : 1, whiteSpace: 'nowrap',
          }}
        >
          ↻ {loading ? 'ACTUALIZANDO…' : 'ACTUALIZAR'}
        </button>
      </div>

      {statsEmpty && (
        <div style={{ marginBottom: '24px' }}>
          <EmptyNotice />
        </div>
      )}

      {/* ── Stat cards grid (separadores negros) ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: `repeat(${cardCols}, 1fr)`, gap: '1px',
        background: 'black', border: BORDER, marginBottom: '32px',
      }}>
        {cards.map((c) => (
          <StatCard key={c.label} label={c.label} value={c.value} sub={c.sub} />
        ))}
      </div>

      {/* ── Embeddings progress bar ── */}
      <div style={{ marginBottom: '40px' }}>
        <div style={sectionTitleStyle}>Progreso de embeddings</div>
        <div style={{ position: 'relative', height: '28px', background: '#ececec', border: BORDER, overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, bottom: 0, width: `${embedPct}%`,
            background: '#000', transition: 'width 0.4s ease',
          }} />
        </div>
        <div style={{ marginTop: '10px', fontSize: '11px', fontFamily: fontMono, letterSpacing: '0.5px', opacity: 0.6 }}>
          {embedPct}% embebido · backlog {rawBacklog}
        </div>
      </div>

      {/* ── Ingestion jobs table ── */}
      <div style={{ marginBottom: '40px' }}>
        <div style={sectionTitleStyle}>Ejecuciones recientes (ingestion_jobs)</div>
        {jobs.length === 0 ? (
          <EmptyNotice>Sin ejecuciones registradas — puede requerir permisos RLS de lectura sobre ingestion_jobs.</EmptyNotice>
        ) : (
          <div style={{ border: BORDER, maxHeight: '480px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'black' }}>
              <div style={{ ...thStyle, gridTemplateColumns: jobsCols, position: 'sticky', top: 0, zIndex: 1 }}>
                <span>Fuente</span>
                <span style={{ textAlign: 'center' }}>Estado</span>
                <span style={numCell}>Encontr.</span>
                <span style={numCell}>Nuevos</span>
                {!isMobile && <span>Error</span>}
                {!isMobile && <span>Cuándo</span>}
              </div>
              {jobs.map((j) => (
                <div key={j.id} style={{ ...cellStyle, gridTemplateColumns: jobsCols }}>
                  <span style={ellipsis} title={j.sourceName}>{j.sourceName || '—'}</span>
                  <span style={{ textAlign: 'center' }}><StatusGlyph status={j.status} /></span>
                  <span style={numCell}>{j.articlesFound ?? 0}</span>
                  <span style={numCell}>{j.articlesNew ?? 0}</span>
                  {!isMobile && (
                    <span style={{ ...ellipsis, opacity: j.error_message ? 0.8 : 0.25 }} title={j.error_message || ''}>
                      {j.error_message || '—'}
                    </span>
                  )}
                  {!isMobile && <span style={{ opacity: 0.6 }}>{relativeTime(j.when)}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Per-source health table ── */}
      <div>
        <div style={sectionTitleStyle}>Salud por fuente (peor primero)</div>
        {health.length === 0 ? (
          <EmptyNotice>Sin datos de fuentes — puede requerir permisos RLS de lectura sobre sources.</EmptyNotice>
        ) : (
          <div style={{ border: BORDER, maxHeight: '480px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'black' }}>
              <div style={{ ...thStyle, gridTemplateColumns: healthCols, position: 'sticky', top: 0, zIndex: 1 }}>
                <span>Fuente</span>
                <span style={{ textAlign: 'center' }}>Activa</span>
                <span style={numCell}>Errores</span>
                <span style={numCell}>Ingeridos</span>
                {!isMobile && <span>Última</span>}
                {!isMobile && <span>País</span>}
              </div>
              {health.map((h) => (
                <div key={h.id} style={{ ...cellStyle, gridTemplateColumns: healthCols }}>
                  <span style={ellipsis} title={h.name}>{h.name || '—'}</span>
                  <span style={{ textAlign: 'center', fontFamily: fontMono, opacity: h.active ? 1 : 0.3 }}>
                    {h.active ? '✓' : '—'}
                  </span>
                  <span style={{ ...numCell, fontWeight: h.errorCount > 0 ? 900 : 400, color: h.errorCount > 0 ? '#000' : '#999' }}>
                    {h.errorCount ?? 0}
                  </span>
                  <span style={numCell}>{h.ingested ?? 0}</span>
                  {!isMobile && <span style={{ opacity: 0.6 }}>{relativeTime(h.lastIngestedAt)}</span>}
                  {!isMobile && <span style={{ ...ellipsis, opacity: 0.6 }}>{h.country || '—'}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
