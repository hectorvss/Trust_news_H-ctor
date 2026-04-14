import React from 'react';

const BiasBar = ({ bias }) => {
  const { left, center, right } = bias;
  
  return (
    <div className="bias-bar-container">
      <span className="bias-label">{left + center + right > 0 ? 'Media Bias Spectrum' : 'Analyzing Coverage...'}</span>
      <div style={{
        width: '100%',
        height: '12px',
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        borderRadius: '12px',
        display: 'flex',
        overflow: 'hidden'
      }}>
        <div style={{ width: `${left}%`, backgroundColor: 'var(--bias-left)', transition: 'var(--transition)' }} />
        <div style={{ width: `${center}%`, backgroundColor: 'var(--bias-center)', transition: 'var(--transition)' }} />
        <div style={{ width: `${right}%`, backgroundColor: 'var(--bias-right)', transition: 'var(--transition)' }} />
      </div>
    </div>
  );
};

export default BiasBar;
