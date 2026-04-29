import React from 'react';

const BiasCard = ({ navigate }) => {
  return (
    <div style={{ padding: '30px', border: 'var(--border-thin)', borderRadius: '24px', marginBottom: '32px', background: '#fff' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 8px 0', letterSpacing: '-1px' }}>Mi Sesgo de Lectura</h2>
      <div style={{ fontSize: '11px', opacity: 0.3, fontWeight: 800, fontFamily: 'var(--font-mono)', marginBottom: '24px', letterSpacing: '1px' }}>
        ANÁLISIS BASADO EN TUS ÚLTIMOS 30 ARTÍCULOS
      </div>
      
      <div style={{ height: '8px', background: '#f5f5f5', borderRadius: '10px', overflow: 'hidden', position: 'relative', marginBottom: '32px' }}>
        <div style={{ position: 'absolute', left: '42%', width: '25%', height: '100%', background: 'black' }} />
      </div>

      <button 
        onClick={() => navigate('/bias')}
        style={{ 
          width: '100%', 
          padding: '16px', 
          background: 'none', 
          border: '1.5px solid black', 
          borderRadius: '100px', 
          fontSize: '11px', 
          fontWeight: 900, 
          cursor: 'pointer',
          letterSpacing: '1.5px'
        }}
      >
        VER ANALÍTICA DETALLADA
      </button>
    </div>
  );
};

export default BiasCard;
