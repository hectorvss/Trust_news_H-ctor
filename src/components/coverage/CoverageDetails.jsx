import React from 'react';
import BiasDistributionBar from './BiasDistributionBar';
import FactualityBar from './FactualityBar';
import OwnershipBar from './OwnershipBar';
import { relativeTime, toBucket } from './helpers';

const CoverageDetails = ({ story = {}, sources = [] }) => {
  const sourceCounts = (sources || []).reduce((acc, source) => {
    const bucket = toBucket(source.biasRating || source.biasLabel || source.bias);
    acc[bucket] = (acc[bucket] || 0) + 1;
    return acc;
  }, { LEFT: 0, CENTER: 0, RIGHT: 0 });
  const hasSourceCounts = (sources || []).length > 0;
  const total = hasSourceCounts ? sources.length : story.totalSources || 0;
  const leftCount = hasSourceCounts ? sourceCounts.LEFT : story.leaningLeft || 0;
  const centerCount = hasSourceCounts ? sourceCounts.CENTER : story.leaningCenter || 0;
  const rightCount = hasSourceCounts ? sourceCounts.RIGHT : story.leaningRight || 0;
  const rows = [
    { label: 'Fuentes totales', value: total },
    { label: 'Inclinacion izquierda', value: leftCount },
    { label: 'Inclinacion centro', value: centerCount },
    { label: 'Inclinacion derecha', value: rightCount },
    { label: 'Ultima actualizacion', value: relativeTime(story.coverageUpdatedAt) }
  ];

  return (
    <aside style={{ border: 'var(--border-thin)', background: '#fff' }}>
      <div style={{ padding: '18px 20px', borderBottom: 'var(--border-thin)', background: '#000', color: '#fff' }}>
        <div style={{ fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '2px', opacity: 0.6, marginBottom: '2px' }}>
          ANALISIS DE COBERTURA
        </div>
        <div style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.5px' }}>Coverage Details</div>
      </div>

      <div style={{ padding: '8px 20px' }}>
        {rows.map((row, index) => (
          <div
            key={row.label}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '11px 0',
              borderBottom: index < rows.length - 1 ? '1px solid #eee' : 'none'
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 600, opacity: 0.7 }}>{row.label}</span>
            <span style={{ fontSize: '14px', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>{row.value}</span>
          </div>
        ))}
      </div>

      <div style={{ padding: '20px', borderTop: 'var(--border-thin)' }}>
        <BiasDistributionBar
          distribution={story.biasDistribution || { left: 0, center: 0, right: 0 }}
          counts={{ left: leftCount, center: centerCount, right: rightCount }}
          sources={sources}
          dominantLean={story.dominantLean}
          dominantLeanPct={story.dominantLeanPct}
        />
      </div>

      <div style={{ padding: '20px', borderTop: '1px solid #eee' }}>
        <FactualityBar breakdown={story.factualityBreakdown || {}} />
      </div>

      <div style={{ padding: '20px', borderTop: '1px solid #eee' }}>
        <OwnershipBar breakdown={story.ownershipBreakdown || {}} />
      </div>
    </aside>
  );
};

export default CoverageDetails;
