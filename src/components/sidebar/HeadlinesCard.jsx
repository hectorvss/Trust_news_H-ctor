import React from 'react';

const HeadlinesCard = ({ headlines }) => {
  return (
    <div style={{ marginBottom: '60px' }}>
      <h3 style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '2px', borderBottom: '2.5px solid black', paddingBottom: '12px', marginBottom: '24px' }}>TITULARES DESTACADOS</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {headlines.map((item, i) => (
          <div key={i}>
            <p style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 10px 0', lineHeight: '1.2' }}>{item.t}</p>
            <div style={{ width: '100%', height: '4px', background: '#f0f0f0' }}>
              <div style={{ width: item.w, height: '100%', background: '#444' }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeadlinesCard;
