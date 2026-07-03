import React from 'react';

const BlindSpotsCard = ({ blindSpotsData, onOpenStory }) => {
  return (
    <div style={{ marginBottom: '60px' }}>
      <h2 style={{ fontSize: '32px', fontWeight: 800, margin: '0 0 40px 0', letterSpacing: '-1.5px', lineHeight: '1' }}>Puntos Ciegos —<br/>Destacados</h2>

      {blindSpotsData.map((spot, i) => (
        <div
          key={i}
          onClick={onOpenStory ? () => onOpenStory(spot.text) : undefined}
          style={{
            marginBottom: i === blindSpotsData.length - 1 ? '0' : '40px',
            borderBottom: i === blindSpotsData.length - 1 ? 'none' : '1px solid black',
            paddingBottom: i === blindSpotsData.length - 1 ? '0' : '40px',
            cursor: onOpenStory ? 'pointer' : 'default'
          }}
          onMouseEnter={e => { if (onOpenStory) e.currentTarget.style.opacity = 0.65; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = 1; }}
        >
          <span style={{ background: spot.type === 'LEFT' ? 'black' : '#888', color: 'white', fontSize: '10px', fontWeight: 900, padding: '4px 10px', borderRadius: '100px', fontFamily: 'var(--font-mono)' }}>
             PUNTO CIEGO DE {spot.type === 'LEFT' ? 'IZQUIERDA' : 'DERECHA'}
          </span>
          <p style={{ fontSize: '19px', fontWeight: 600, marginTop: '20px', lineHeight: '1.2' }}>{spot.text}</p>
          {onOpenStory && (
            <div style={{ fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.35, letterSpacing: '1px', marginTop: '14px' }}>
              VER COBERTURA ↗
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default BlindSpotsCard;
