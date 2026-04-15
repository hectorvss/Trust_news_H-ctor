import React from 'react';

const BiasBar = ({ bias }) => {
  const { left, center, right } = bias;
  
  return (
    <div style={{
      width: '100%',
      height: '6px',
      backgroundColor: '#f5f5f5',
      borderRadius: '10px',
      display: 'flex',
      overflow: 'hidden'
    }}>
      <div style={{ width: `${left}%`, backgroundColor: '#000000', transition: 'var(--transition)' }} />
      <div style={{ width: `${center}%`, backgroundColor: '#777777', transition: 'var(--transition)' }} />
      <div style={{ width: `${right}%`, backgroundColor: '#dddddd', transition: 'var(--transition)' }} />
    </div>
  );
};

const StoryCard = ({ story }) => {
  return (
    <article className="story-card" style={{ 
      padding: '48px', 
      borderRadius: '35px', 
      border: '0.9px solid #000', 
      background: '#fff',
      marginBottom: '32px',
      display: 'flex',
      flexDirection: 'column',
      gap: '32px',
      minHeight: 'auto'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span className="tag" style={{ borderRadius: '24px', padding: '8px 20px', fontWeight: 800, fontSize: '11px' }}>{story.location}</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, opacity: 0.3, fontFamily: 'var(--font-mono)' }}>CONSENSO: {story.consensus || 'MEDIO'}</span>
            <span style={{ fontSize: '10px', fontWeight: 800, opacity: 0.3, fontFamily: 'var(--font-mono)' }}>IMPACTO: {story.impact || 'ALTO'}</span>
          </div>
        </div>
        <span style={{ fontSize: '11px', fontWeight: 800, opacity: 0.3, letterSpacing: '1px', fontFamily: 'var(--font-mono)' }}>{story.sourceCount} SOURCES</span>
      </div>
      
      <div>
        <h3 style={{ 
          fontSize: '48px', 
          fontWeight: 800, 
          lineHeight: '1.05', 
          letterSpacing: '-2.5px', 
          margin: '0 0 16px 0',
          color: 'black'
        }}>{story.title}</h3>
        <p style={{ fontSize: '14px', opacity: 0.5, fontFamily: 'var(--font-mono)', letterSpacing: '-0.2px' }}>
          {story.time} — Covering the latest developments in the region.
        </p>
      </div>

      <div style={{ 
        padding: '20px 24px', 
        background: '#fcfcfc', 
        border: 'var(--border-thin)', 
        borderRadius: '12px',
        fontSize: '13px',
        lineHeight: '1.4',
        fontWeight: 600
      }}>
        <span style={{ opacity: 0.4, marginRight: '8px', fontSize: '10px', fontWeight: 800 }}>ANALÍTICA TNE:</span>
        La cobertura nacional se divide entre el impacto regulatorio ({story.bias.center}%) y el riesgo de mercado ({story.bias.right}%). Se detecta un fuerte interés en el segmento de arrendatarios jóvenes.
      </div>
      
      <div style={{ marginTop: '0px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
           <span style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '-0.3px' }}>Media Bias Spectrum</span>
           <span style={{ fontSize: '10px', fontWeight: 800, opacity: 0.4 }}>VER PERSPECTIVAS ↗</span>
        </div>
        <BiasBar bias={story.bias} />
      </div>
    </article>
  );
};

export default StoryCard;
