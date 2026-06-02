import React from 'react';
import {
  BIAS_LABEL, BIAS_COLOR, FACTUALITY_LABEL, FACTUALITY_COLOR,
  OWNERSHIP_LABEL
} from './helpers';

/**
 * Small uppercase pill used per-article to show Bias / Factuality / Ownership.
 * kind: 'bias' | 'factuality' | 'ownership'
 */
const SourceTag = ({ kind, value, size = 'sm' }) => {
  if (!value) return null;

  const pad = size === 'sm' ? '3px 8px' : '5px 12px';
  const fontSize = size === 'sm' ? '9px' : '10px';

  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: pad,
    fontSize,
    fontWeight: 800,
    fontFamily: 'var(--font-mono)',
    letterSpacing: '0.5px',
    border: '1px solid #d8d8d8',
    background: '#fff',
    whiteSpace: 'nowrap',
    textTransform: 'uppercase'
  };

  if (kind === 'bias') {
    const color = BIAS_COLOR[value] || '#888';
    return (
      <span style={base} title={`Sesgo: ${BIAS_LABEL[value] || value}`}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
        {BIAS_LABEL[value] || value}
      </span>
    );
  }

  if (kind === 'factuality') {
    const color = FACTUALITY_COLOR[value] || '#888';
    return (
      <span style={base} title={`Factualidad: ${FACTUALITY_LABEL[value] || value}`}>
        <span style={{ width: 8, height: 8, borderRadius: '2px', background: color, border: '1px solid #aaa', flexShrink: 0 }} />
        {FACTUALITY_LABEL[value] || value}
      </span>
    );
  }

  if (kind === 'ownership') {
    return (
      <span style={base} title={`Propiedad: ${OWNERSHIP_LABEL[value] || value}`}>
        {OWNERSHIP_LABEL[value] || value}
      </span>
    );
  }

  return <span style={base}>{value}</span>;
};

export default SourceTag;
