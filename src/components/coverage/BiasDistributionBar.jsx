import React from 'react';
import SourceLogo from './SourceLogo';
import { BUCKET_COLOR, BUCKET_LABEL, toBucket } from './helpers';

/**
 * The hero coverage widget: a segmented bar showing % of sources that
 * lean Left / Center / Right, the logos of those sources grouped under
 * each segment, and a legend with counts. TNE monochrome style.
 *
 * Props:
 *  - distribution: { left, center, right } (percentages)
 *  - counts: { left, center, right } (source counts)
 *  - sources: [{ name, logoUrl, biasRating }] enriched source list (optional)
 *  - dominantLean, dominantLeanPct (optional headline)
 *  - showLogos (default true)
 */
const BiasDistributionBar = ({
  distribution = { left: 0, center: 0, right: 0 },
  counts = null,
  sources = [],
  dominantLean = null,
  dominantLeanPct = 0,
  showLogos = true
}) => {
  const segs = [
    { key: 'LEFT', pct: distribution.left || 0 },
    { key: 'CENTER', pct: distribution.center || 0 },
    { key: 'RIGHT', pct: distribution.right || 0 }
  ];

  // Group sources by bucket for the logo rows
  const grouped = { LEFT: [], CENTER: [], RIGHT: [] };
  (sources || []).forEach(s => {
    const bucket = toBucket(s.biasRating || s.bias || 'CENTER');
    if (grouped[bucket]) grouped[bucket].push(s);
  });

  return (
    <div>
      {/* Headline */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
        <div style={{ fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '1px' }}>
          DISTRIBUCIÓN DE SESGO
        </div>
        {dominantLean && (
          <div style={{ fontSize: '13px', fontWeight: 800 }}>
            {dominantLeanPct}% <span style={{ opacity: 0.55 }}>{BUCKET_LABEL[dominantLean] || dominantLean}</span>
          </div>
        )}
      </div>

      {/* Segmented bar */}
      <div style={{ display: 'flex', height: '28px', border: '1px solid #000', overflow: 'hidden' }}>
        {segs.map((s, i) => (
          <div
            key={s.key}
            title={`${BUCKET_LABEL[s.key]}: ${s.pct}%`}
            style={{
              width: `${s.pct}%`,
              background: BUCKET_COLOR[s.key],
              borderRight: i < 2 && s.pct > 0 ? '1px solid #fff' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'width 0.4s ease',
              minWidth: s.pct > 0 ? '2px' : 0
            }}
          >
            {s.pct >= 12 && (
              <span style={{ fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: s.key === 'RIGHT' ? '#000' : '#fff' }}>
                {s.pct}%
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Legend with counts */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
        {['LEFT', 'CENTER', 'RIGHT'].map(k => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: 9, height: 9, background: BUCKET_COLOR[k], border: '1px solid #000', flexShrink: 0 }} />
            <span>{BUCKET_LABEL[k].toUpperCase()}</span>
            {counts && <span style={{ opacity: 0.45 }}>{counts[k.toLowerCase()] ?? 0}</span>}
          </div>
        ))}
      </div>

      {/* Logos grouped by lean */}
      {showLogos && (sources || []).length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '20px' }}>
          {['LEFT', 'CENTER', 'RIGHT'].map(k => (
            <div key={k} style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', alignContent: 'flex-start', minHeight: '34px', borderTop: `2px solid ${BUCKET_COLOR[k]}`, paddingTop: '10px' }}>
              {grouped[k].slice(0, 9).map((s, idx) => (
                <SourceLogo key={s.id || s.name || idx} source={s} size={28} />
              ))}
              {grouped[k].length > 9 && (
                <div style={{ width: 28, height: 28, borderRadius: '50%', border: '1px dashed #aaa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#666' }}>
                  +{grouped[k].length - 9}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BiasDistributionBar;
