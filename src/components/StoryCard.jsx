import React, { useState } from 'react';
import BiasBar from './BiasBar';

const StoryCard = ({ story, onToggleFavorite, isFavorite, onShare }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/story/${story.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
          {story.time}{story.summary ? ` — ${story.summary.substring(0, 120)}${story.summary.length > 120 ? '…' : ''}` : ''}
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
        {story.analyticalSnippet}
      </div>
      
      <div style={{ marginTop: '0px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
           <span style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '-0.3px' }}>Media Bias Spectrum</span>
           <span style={{ fontSize: '10px', fontWeight: 800, opacity: 0.4 }}>VER PERSPECTIVAS ↗</span>
        </div>
        <BiasBar bias={story.bias} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', alignItems: 'center', paddingTop: '12px' }}>
        {copied && (
          <span style={{ 
            fontSize: '10px', 
            fontWeight: 800, 
            fontFamily: 'var(--font-mono)', 
            animation: 'fadeInOut 2s forwards',
            letterSpacing: '1px'
          }}>
            COPIADO
          </span>
        )}

        <div 
          onClick={(e) => { e.stopPropagation(); onToggleFavorite && onToggleFavorite(story); }}
          style={{ 
            cursor: 'pointer', 
            opacity: isFavorite ? 1 : 0.7, 
            padding: '4px', 
            color: isFavorite ? 'black' : 'inherit',
            animation: isFavorite ? 'heartPulse 0.3s ease-out' : 'none'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
          onMouseLeave={(e) => e.currentTarget.style.opacity = isFavorite ? 1 : 0.7}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </div>

        <div 
          onClick={handleCopy}
          style={{ cursor: 'pointer', opacity: 0.7, padding: '4px' }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
          onMouseLeave={(e) => e.currentTarget.style.opacity = 0.7}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
        </div>

        <div 
          onClick={(e) => { e.stopPropagation(); onShare && onShare(); }}
          style={{ cursor: 'pointer', opacity: 0.7, padding: '4px' }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
          onMouseLeave={(e) => e.currentTarget.style.opacity = 0.7}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
        </div>
      </div>

    </article>
  );
};

export default StoryCard;
