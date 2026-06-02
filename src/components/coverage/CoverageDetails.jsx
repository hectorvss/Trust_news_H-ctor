import React from 'react';
import BiasDistributionBar from './BiasDistributionBar';
import FactualityBar from './FactualityBar';
import OwnershipBar from './OwnershipBar';
import { relativeTime } from './helpers';

/**
 * The "Coverage Details" side panel of the story page (Figma 9-12600).
 * Combines headline counts + the three distribution widgets.
 * Adapted to TNE monochrome / mono-label design language.
 *
 * Props: story (mapped) + enriched `sources` array.
 */
const CoverageDetails = ({ story = {}, sources = [] }) => {
  const total = story.totalSources || 0;
  const rows = [
    { label: 'Fuentes totales', value: total },
    { label: 'Inclinación Izquierda', value: story.leaningLeft || 0 },
    { label: 'Inclinación Centro', value: story.leaningCenter || 0 },
    { label: 'Inclinación Derecha', value: story.leaningRight || 0 },
    { label: 'Última actualización', value: relativeTime(story.coverageUpdatedAt) }
  ];

  return (
    <aside style={{ border: 'var(--border-thin)', background: '#fff' }}>
      {/* Header */}
      <div style={{ padding: '18px 20px', borderBottom: 'var(--border-thin)', background: '#000', color: '#fff' }}>
        <div style={{ fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '2px', opacity: 0.6, marginBottom: '2px' }}>
          ANÁLISIS DE COBERTURA
        </div>
        <div style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.5px' }}>Coverage Details</div>
      </div>

      {/* Count rows */}
      <div style={{ padding: '8px 20px' }}>
        {rows.map((r, i) => (
          <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: i < rows.length - 1 ? '1px solid #eee' : 'none' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, opacity: 0.7 }}>{r.label}</span>
            <span style={{ fontSize: '14px', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>{r.value}</span>
          </div>
        ))}
      </div>

      {/* Bias distribution */}
      <div style={{ padding: '20px', borderTop: 'var(--border-thin)' }}>
        <BiasDistributionBar
          distribution={story.biasDistribution || { left: 0, center: 0, right: 0 }}
          counts={{ left: story.leaningLeft, center: story.leaningCenter, right: story.leaningRight }}
          sources={sources}
          dominantLean={story.dominantLean}
          dominantLeanPct={story.dominantLeanPct}
        />
      </div>

      {/* Factuality */}
      <div style={{ padding: '20px', borderTop: '1px solid #eee' }}>
        <FactualityBar breakdown={story.factualityBreakdown || {}} />
      </div>

      {/* Ownership */}
      <div style={{ padding: '20px', borderTop: '1px solid #eee' }}>
        <OwnershipBar breakdown={story.ownershipBreakdown || {}} />
      </div>
    </aside>
  );
};

export default CoverageDetails;
