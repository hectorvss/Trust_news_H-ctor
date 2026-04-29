import React from 'react';

const FavoritesCard = ({ navigate, favoritesCount }) => {
  return (
    <div style={{ padding: '30px', border: 'var(--border-thin)', borderRadius: '24px', marginBottom: '32px', background: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 8px 0', letterSpacing: '-1px' }}>Mis Favoritos</h2>
        <span style={{ fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.2 }}>[ {String(favoritesCount).padStart(2, '0')} ]</span>
      </div>
      <div style={{ fontSize: '13px', opacity: 0.4, marginBottom: '24px', lineHeight: '1.4' }}>Tus historias guardadas para consulta prioritaria en cualquier momento.</div>
      
      <button 
        onClick={() => navigate('/favorites')}
        style={{ 
          width: '100%', 
          padding: '16px', 
          background: 'black', 
          color: 'white',
          border: 'none', 
          borderRadius: '100px', 
          fontSize: '11px', 
          fontWeight: 900, 
          cursor: 'pointer',
          letterSpacing: '1.5px'
        }}
      >
        VER MI ARCHIVO
      </button>
    </div>
  );
};

export default FavoritesCard;
