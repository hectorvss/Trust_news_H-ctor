import React from 'react';
import { toSegments } from './helpers';

/**
 * Generic stacked horizontal distribution bar + legend.
 * Used by FactualityBar and OwnershipBar.
 *
 * Props:
 *  - title: section label
 *  - breakdown: { KEY: count }
 *  - order, labelMap, colorMap: from helpers
 */
const StackedBar = ({ title, breakdown = {}, order, labelMap, colorMap }) => {
  const segments = toSegments(breakdown, order, labelMap, colorMap);
  const total = segments.reduce((a, s) => a + s.count, 0);

  return (
    <div>
      <div style={{ fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '1px', marginBottom: '12px' }}>
        {title}
      </div>

      {total === 0 ? (
        <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', opacity: 0.35, padding: '8px 0' }}>SIN DATOS</div>
      ) : (
        <>
          <div style={{ display: 'flex', height: '20px', border: '1px solid #000', overflow: 'hidden' }}>
            {segments.map((s, i) => (
              <div
                key={s.key}
                title={`${s.label}: ${s.count} (${s.pct}%)`}
                style={{
                  width: `${s.pct}%`,
                  background: s.color,
                  borderRight: i < segments.length - 1 ? '1px solid #fff' : 'none',
                  transition: 'width 0.4s ease',
                  minWidth: '2px'
                }}
              />
            ))}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', marginTop: '10px' }}>
            {segments.map(s => (
              <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
                <span style={{ width: 9, height: 9, background: s.color, border: '1px solid #000', flexShrink: 0 }} />
                <span>{s.label}</span>
                <span style={{ opacity: 0.45 }}>{s.count}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default StackedBar;
