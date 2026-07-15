import React, { useState } from 'react';
import { MiniBiasBar, BUCKET_LABEL } from './coverage';
import { useBreakpoint } from '../hooks/useBreakpoint';

/**
 * Feed story card — faithful adaptation of the Ground News "Top News Stories"
 * / feature card (Home frame 9:8355) to the TNE monochrome system:
 *  headline (Manrope) · real coverage line "X% [Lean] · N fuentes" with the
 *  MiniBiasBar · cover image only when the story has a real one · summary +
 *  time. Favorite / copy / share actions preserved.
 */
const StoryCard = ({ story, onToggleFavorite, isFavorite, onShare }) => {
  const [copied, setCopied] = useState(false);
  const { isMobile } = useBreakpoint();

  // Real derived coverage from the pipeline (coverage_left/center/right via mapStory).
  const hasDerived = (story.totalSources || 0) > 0 && story.biasDistribution;
  const dist = hasDerived ? story.biasDistribution : null;
  const srcCount = story.totalSources || story.sourceCount || 0;
  const leanLabel = story.dominantLean ? (BUCKET_LABEL[story.dominantLean] || story.dominantLean) : null;

  // mapStory falls back to a placeholder image; only show a cover when the
  // story actually carries one (image_url is preserved by the `...s` spread).
  const hasImage = !!story.image_url;

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/story/${story.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article
      className="story-card"
      style={{
        padding: isMobile ? '24px' : '32px',
        borderRadius: 'var(--radius-sm)',
        border: 'var(--border-thin)',
        background: '#fff',
        marginBottom: '0',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        minHeight: 'auto'
      }}
    >
      <div style={{ display: 'flex', gap: isMobile ? '18px' : '28px', alignItems: 'flex-start', flexDirection: isMobile ? 'column-reverse' : 'row' }}>
        {/* Text column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, minWidth: 0 }}>
          {/* Meta row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
            <span className="tag" style={{ borderRadius: '20px', padding: '5px 14px', fontWeight: 800, fontSize: '10px', flexShrink: 0 }}>
              {story.location || story.category || 'ESPAÑA'}
            </span>
            <span style={{ fontSize: '10px', fontWeight: 800, opacity: 0.4, letterSpacing: '1px', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
              {story.time || 'reciente'}
            </span>
          </div>

          {/* Headline */}
          <h3 style={{
            fontSize: isMobile ? '24px' : '30px',
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            lineHeight: '1.08',
            letterSpacing: isMobile ? '-1px' : '-1.4px',
            margin: 0,
            color: '#000'
          }}>{story.title}</h3>

          {/* Summary */}
          {story.summary && (
            <p className="story-card__summary" style={{
              fontSize: '14px',
              lineHeight: '1.5',
              opacity: 0.55,
              margin: 0,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>{story.summary}</p>
          )}

          {/* Coverage line — MiniBiasBar + "X% [Lean] · N fuentes" */}
          {hasDerived ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', flexWrap: 'wrap' }}>
              <MiniBiasBar distribution={dist} width={80} height={8} />
              <span style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-mono)', letterSpacing: '-0.2px' }}>
                {story.dominantLeanPct}% {leanLabel}
                <span style={{ opacity: 0.4 }}> · {srcCount} fuentes</span>
              </span>
            </div>
          ) : (
            srcCount > 0 && (
              <div style={{ fontSize: '11px', fontWeight: 800, opacity: 0.4, fontFamily: 'var(--font-mono)', letterSpacing: '1px', marginTop: '4px' }}>
                {srcCount} FUENTES
              </div>
            )
          )}
        </div>

        {/* Cover image (only when real) */}
        {hasImage && (
          <div style={{
            width: isMobile ? '100%' : '200px',
            height: isMobile ? '170px' : '150px',
            flexShrink: 0,
            borderRadius: '14px',
            overflow: 'hidden',
            border: 'var(--border-thin)'
          }}>
            <img src={story.image} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', alignItems: 'center', borderTop: '1px solid #f0f0f0', paddingTop: '16px' }}>
        {hasDerived && (
          <span style={{ fontSize: '10px', fontWeight: 800, fontFamily: 'var(--font-mono)', opacity: 0.35, letterSpacing: '0.5px', marginRight: 'auto' }}>
            VER COBERTURA ↗
          </span>
        )}
        {copied && (
          <span style={{ fontSize: '10px', fontWeight: 800, fontFamily: 'var(--font-mono)', animation: 'fadeInOut 2s forwards', letterSpacing: '1px' }}>
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
