import React, { useState } from 'react';
import ShareModal from './ShareModal';

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

const StoryCard = ({ story, onToggleFavorite, isFavorite }) => {
  const [copied, setCopied] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [liked, setLiked] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/story/${story.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLike = (e) => {
    e.stopPropagation();
    setLiked(!liked);
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
          onClick={handleLike}
          style={{ 
            cursor: 'pointer', 
            opacity: liked ? 1 : 0.7, 
            padding: '4px', 
            color: liked ? 'black' : 'inherit',
            animation: liked ? 'heartPulse 0.3s ease-out' : 'none'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
          onMouseLeave={(e) => e.currentTarget.style.opacity = liked ? 1 : 0.7}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
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
          onClick={(e) => { e.stopPropagation(); onToggleFavorite && onToggleFavorite(story); }}
          style={{ cursor: 'pointer', opacity: isFavorite ? 1 : 0.7, padding: '4px', color: isFavorite ? 'black' : 'inherit' }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
          onMouseLeave={(e) => e.currentTarget.style.opacity = isFavorite ? 1 : 0.7}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
        </div>

        <div 
          onClick={(e) => { e.stopPropagation(); setIsShareOpen(true); }}
          style={{ cursor: 'pointer', opacity: 0.7, padding: '4px' }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
          onMouseLeave={(e) => e.currentTarget.style.opacity = 0.7}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
        </div>
      </div>

      <ShareModal 
        isOpen={isShareOpen} 
        onClose={() => setIsShareOpen(false)} 
        storyTitle={story.title}
        storyUrl={`${window.location.origin}/story/${story.id}`}
      />
    </article>
  );
};

export default StoryCard;
