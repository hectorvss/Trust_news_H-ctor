import React, { useState } from 'react';
import { BIAS_COLOR, toBucket, BUCKET_COLOR, normalizeBiasRating } from './helpers';

/**
 * Circular source avatar. Tries the favicon/logo; falls back to a
 * monogram on a bias-tinted ring. Monochrome, TNE design language.
 */
const SourceLogo = ({ source = {}, size = 32, ring = true, onClick }) => {
  const [failed, setFailed] = useState(false);
  const name = source.name || source.source || '?';
  const logoUrl = source.logoUrl || (source.domain ? `https://www.google.com/s2/favicons?domain=${source.domain}&sz=64` : null);
  const bias = normalizeBiasRating(source.biasRating || source.bias || 'CENTER');
  const ringColor = BIAS_COLOR[bias] || BUCKET_COLOR[toBucket(bias)] || '#888';
  const monogram = name.trim().charAt(0).toUpperCase();

  const boxStyle = {
    width: size,
    height: size,
    borderRadius: '50%',
    flexShrink: 0,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#fff',
    border: ring ? `2px solid ${ringColor}` : '1px solid #e5e5e5',
    boxSizing: 'border-box',
    cursor: onClick ? 'pointer' : 'default'
  };

  const handleClick = onClick ? (e) => { e.stopPropagation(); onClick(source); } : undefined;
  const title = onClick ? `${name} — ver artículo` : name;

  if (logoUrl && !failed) {
    return (
      <div style={boxStyle} title={title} onClick={handleClick} role={onClick ? 'button' : undefined}>
        <img
          src={logoUrl}
          alt={name}
          width={size - (ring ? 6 : 2)}
          height={size - (ring ? 6 : 2)}
          style={{ objectFit: 'contain', borderRadius: '50%' }}
          onError={() => setFailed(true)}
        />
      </div>
    );
  }

  return (
    <div style={{ ...boxStyle, background: ringColor }} title={title} onClick={handleClick} role={onClick ? 'button' : undefined}>
      <span style={{ color: '#fff', fontWeight: 900, fontFamily: 'var(--font-mono)', fontSize: size * 0.42, lineHeight: 1 }}>
        {monogram}
      </span>
    </div>
  );
};

export default SourceLogo;
