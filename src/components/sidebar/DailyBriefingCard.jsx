import React from 'react';

const DailyBriefingCard = ({ navigate, globalHeadlines }) => {
  return (
    <div 
      onClick={() => navigate('/daily-summary')}
      style={{ padding: '30px', border: 'var(--border-thin)', borderRadius: '24px', marginBottom: '32px', background: '#fff', cursor: 'pointer' }}
    >
      <div style={{ fontSize: '10px', fontWeight: 800, fontFamily: 'var(--font-mono)', opacity: 0.3, marginBottom: '20px', letterSpacing: '2px' }}>
        {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase()}
      </div>
      <h2 style={{ fontSize: '32px', fontWeight: 800, margin: '0 0 16px 0', letterSpacing: '-1px' }}>Resumen Diario</h2>
      <div style={{ fontSize: '11px', opacity: 0.4, fontFamily: 'var(--font-mono)', marginBottom: '32px', fontWeight: 800 }}>
        12 HISTORIAS • 342 ARTÍCULOS • 8M LECTURA
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '30px' }}>
        {globalHeadlines.map((h, i) => (
          <p key={i} style={{ fontSize: '14px', fontWeight: 700, lineHeight: '1.4', margin: 0 }}>{h.t}</p>
        ))}
      </div>
      <div style={{ fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.4 }}>
         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
         92% DE INFORMES ORIGINALES
      </div>
    </div>
  );
};

export default DailyBriefingCard;
