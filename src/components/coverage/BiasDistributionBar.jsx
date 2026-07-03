import React from 'react';
import SourceLogo from './SourceLogo';
import { BIAS_COLOR, BIAS_LABEL, BUCKET_COLOR, BUCKET_LABEL, normalizeBiasRating, toBucket } from './helpers';

const GRANULAR_BUCKETS = ['LEFT', 'LEAN_LEFT', 'CENTER', 'LEAN_RIGHT', 'RIGHT'];
const BUCKET_TO_SIDE = {
  LEFT: 'left',
  LEAN_LEFT: 'left',
  CENTER: 'center',
  LEAN_RIGHT: 'right',
  RIGHT: 'right'
};

const deriveFromSources = (sources = []) => {
  const tracked = [];
  const untracked = [];

  (sources || []).forEach((source, index) => {
    const raw = source.biasRating || source.biasLabel || source.bias || null;
    const hasTrackedBias = raw && !/unknown|sin dato|untracked|none|null/i.test(String(raw));
    const normalized = normalizeBiasRating(raw);
    const entry = {
      ...source,
      id: source.id || source.name || `source-${index}`,
      biasRating: normalized
    };
    if (!hasTrackedBias) untracked.push(entry);
    else tracked.push(entry);
  });

  const grouped = GRANULAR_BUCKETS.reduce((acc, key) => ({ ...acc, [key]: [] }), {});
  tracked.forEach((source) => {
    grouped[source.biasRating || 'CENTER'].push(source);
  });

  const sideCounts = tracked.reduce((acc, source) => {
    const side = BUCKET_TO_SIDE[source.biasRating || 'CENTER'] || 'center';
    acc[side] += 1;
    return acc;
  }, { left: 0, center: 0, right: 0 });

  return { tracked, untracked, grouped, sideCounts };
};

const normalizeDistribution = (distribution, fallbackCounts) => {
  const fromCounts = fallbackCounts.left + fallbackCounts.center + fallbackCounts.right;
  if (fromCounts > 0) {
    return {
      left: Math.round((fallbackCounts.left / fromCounts) * 100),
      center: Math.round((fallbackCounts.center / fromCounts) * 100),
      right: Math.round((fallbackCounts.right / fromCounts) * 100)
    };
  }
  const left = Number(distribution?.left || 0);
  const center = Number(distribution?.center || 0);
  const right = Number(distribution?.right || 0);
  const sum = left + center + right;
  if (sum <= 0) return { left: 0, center: 0, right: 0 };
  return {
    left: Math.round((left / sum) * 100),
    center: Math.round((center / sum) * 100),
    right: Math.round((right / sum) * 100)
  };
};

const stackBackground = (key) => {
  if (key === 'LEFT') return '#8f2d2d';
  if (key === 'LEAN_LEFT') return '#d4a8a8';
  if (key === 'CENTER') return '#f7f7f7';
  if (key === 'LEAN_RIGHT') return '#d8e1ef';
  return '#9fb4d4';
};

const SourceStack = ({ bucket, sources, onSourceClick }) => {
  const visible = sources.slice(0, 5);
  const extra = Math.max(0, sources.length - visible.length);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 48 }}>
      <div
        style={{
          width: 48,
          minHeight: 176,
          padding: '10px 0',
          borderRadius: 24,
          background: stackBackground(bucket),
          border: bucket === 'CENTER' ? '1px solid #eee' : 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          boxSizing: 'border-box'
        }}
      >
        {visible.length === 0 ? (
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.55)' }} />
        ) : visible.map((source, index) => (
          <SourceLogo key={source.id || source.name || index} source={source} size={32} onClick={onSourceClick} />
        ))}
      </div>
      <div style={{ height: 22, marginTop: 8, fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>
        {extra > 0 ? `+${extra}` : sources.length > 0 ? sources.length : ''}
      </div>
      <div style={{ marginTop: 4, fontSize: '9px', fontFamily: 'var(--font-mono)', opacity: 0.45, textAlign: 'center', lineHeight: 1.2 }}>
        {BIAS_LABEL[bucket]}
      </div>
    </div>
  );
};

// Barra continua de 3 segmentos (izq/centro/der) con % incrustado, siguiendo
// la estructura del "Bias Distribution" de referencia pero con la paleta
// monocroma de TNE (BUCKET_COLOR) en vez de rojo/azul.
const ContinuousBar = ({ pct }) => {
  const segs = [
    { key: 'left', v: pct.left, bg: BUCKET_COLOR.LEFT, fg: '#fff' },
    { key: 'center', v: pct.center, bg: '#f2f2f2', fg: '#000' },
    { key: 'right', v: pct.right, bg: BUCKET_COLOR.RIGHT, fg: '#000' }
  ].filter(s => s.v > 0);

  if (segs.length === 0) {
    return <div style={{ height: 34, borderRadius: 'var(--radius-sm)', background: '#f5f5f5', border: '1px solid #eee' }} />;
  }

  return (
    <div style={{ display: 'flex', height: 34, borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid #000' }}>
      {segs.map(s => (
        <div
          key={s.key}
          style={{
            width: `${s.v}%`,
            background: s.bg,
            color: s.fg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: 900,
            fontFamily: 'var(--font-mono)',
            whiteSpace: 'nowrap',
            overflow: 'hidden'
          }}
        >
          {s.v}%
        </div>
      ))}
    </div>
  );
};

const TinySource = ({ source, index }) => (
  <div style={{ marginLeft: index > 0 ? -8 : 0, position: 'relative' }}>
    <SourceLogo source={source} size={28} />
  </div>
);

const BiasDistributionBar = ({
  distribution = { left: 0, center: 0, right: 0 },
  counts = null,
  sources = [],
  dominantLean = null,
  dominantLeanPct = 0,
  showLogos = true,
  onSourceClick = null
}) => {
  const { tracked, untracked, grouped, sideCounts } = deriveFromSources(sources);
  const pct = normalizeDistribution(distribution, tracked.length ? sideCounts : {
    left: Number(counts?.left || 0),
    center: Number(counts?.center || 0),
    right: Number(counts?.right || 0)
  });
  const total = tracked.length || Number(counts?.left || 0) + Number(counts?.center || 0) + Number(counts?.right || 0);
  const dominant = dominantLean || (pct.left >= pct.center && pct.left >= pct.right ? 'LEFT' : pct.right >= pct.center ? 'RIGHT' : 'CENTER');
  const dominantPct = dominantLeanPct || Math.max(pct.left, pct.center, pct.right);

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '1px', textTransform: 'uppercase' }}>
          Distribución de sesgo
        </div>
        {total > 0 && (
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8, fontSize: '13px', fontWeight: 600 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#000', flexShrink: 0 }} />
            <span>{dominantPct}% de las fuentes son de {BUCKET_LABEL[dominant].toLowerCase()}</span>
          </div>
        )}
      </div>

      <div style={{ marginBottom: 18 }}>
        <ContinuousBar pct={pct} />
      </div>

      {showLogos && (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start', overflowX: 'auto', paddingBottom: 4 }}>
          {GRANULAR_BUCKETS.map((bucket) => (
            <SourceStack key={bucket} bucket={bucket} sources={grouped[bucket] || []} onSourceClick={onSourceClick} />
          ))}
        </div>
      )}

      {untracked.length > 0 && (
        <div style={{ marginTop: 22 }}>
          <div style={{ fontSize: '11px', fontWeight: 800, marginBottom: 10 }}>Sesgo sin rastrear</div>
          <div style={{ display: 'flex', alignItems: 'center', minHeight: 30, paddingLeft: 2 }}>
            {untracked.slice(0, 10).map((source, index) => (
              <TinySource key={source.id || source.name || index} source={{ ...source, biasRating: 'CENTER' }} index={index} />
            ))}
            {untracked.length > 10 && (
              <div
                style={{
                  marginLeft: -6,
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: '#fff',
                  border: '1px solid #ddd',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: 900,
                  fontFamily: 'var(--font-mono)'
                }}
              >
                +{untracked.length - 10}
              </div>
            )}
          </div>
        </div>
      )}

      {total <= 0 && untracked.length === 0 && (
        <div style={{ padding: '18px 0', fontSize: '12px', fontFamily: 'var(--font-mono)', opacity: 0.45 }}>
          Sin fuentes suficientes para calcular la distribucion.
        </div>
      )}
    </div>
  );
};

export default BiasDistributionBar;
