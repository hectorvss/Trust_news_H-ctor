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

const pctPillStyle = (side) => ({
  minWidth: 72,
  padding: '8px 10px',
  textAlign: 'center',
  background: side === 'left' ? '#8f2d2d' : side === 'right' ? '#244f8f' : '#fff',
  color: side === 'center' ? '#000' : '#fff',
  border: side === 'center' ? '1px solid #ddd' : 'none',
  borderRadius: 'var(--radius-sm)',
  fontSize: '12px',
  fontWeight: 900,
  fontFamily: 'var(--font-mono)',
  letterSpacing: '0'
});

const SourceStack = ({ bucket, sources }) => {
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
          <SourceLogo key={source.id || source.name || index} source={source} size={32} />
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
  showLogos = true
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '1px', textTransform: 'uppercase' }}>
            Distribucion de sesgo
          </div>
          <div style={{ marginTop: 5, fontSize: '12px', lineHeight: 1.45, opacity: 0.7 }}>
            {pct.left}% izquierda, {pct.center}% centro y {pct.right}% derecha sobre {total || 0} fuentes rastreadas.
          </div>
        </div>
        {total > 0 && (
          <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 900, opacity: 0.65 }}>
            DOMINANTE<br />
            <span style={{ color: BUCKET_COLOR[dominant], opacity: 1 }}>{dominantPct}% {BUCKET_LABEL[dominant]}</span>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <div style={pctPillStyle('left')}>Izq. {pct.left}%</div>
        <div style={pctPillStyle('center')}>Centro {pct.center}%</div>
        <div style={{ ...pctPillStyle('right'), justifySelf: 'end' }}>Der. {pct.right}%</div>
      </div>

      {showLogos && (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start', overflowX: 'auto', paddingBottom: 4 }}>
          {GRANULAR_BUCKETS.map((bucket) => (
            <SourceStack key={bucket} bucket={bucket} sources={grouped[bucket] || []} />
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
