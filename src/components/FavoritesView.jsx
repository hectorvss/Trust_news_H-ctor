import React from 'react';
import StoryCard from './StoryCard';
import Plus from './ui/Plus';

const FavoritesView = ({ favorites, onBack, onSelectStory }) => {
  return (
    <div className="favorites-view" style={{ animation: 'fadeIn 0.5s ease-out' }}>
      {/* 1. PREMIUM HEADER / HERO */}
      <section style={{ 
        padding: '80px 0 60px 0', 
        borderBottom: 'var(--border-thin)', 
        marginBottom: '60px',
        position: 'relative',
        overflow: 'hidden'
      }}>

        <div className="container" style={{ position: 'relative', zIndex: 1, padding: '0 60px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
            <div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '24px' }}>
                <span onClick={onBack} style={{ cursor: 'pointer', fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '1px' }}>← VOLVER AL FEED</span>
                <span style={{ opacity: 0.2 }}>/</span>
                <span style={{ fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.4 }}>ARCHIVO EDITORIAL PERSONAL</span>
              </div>
              <h1 style={{ fontSize: '100px', fontWeight: 800, letterSpacing: '-6px', lineHeight: '0.85', margin: 0 }}>
                Archivo <br /> de Lectura.
              </h1>
            </div>
            
            {/* Quick Metrics Badge */}
            <div style={{ textAlign: 'right', minWidth: '240px' }}>
              <div style={{ fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.3, letterSpacing: '2px', marginBottom: '12px' }}>METRÍCAS DE COLECCIÓN</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px', background: '#eee', border: '1px solid #eee' }}>
                 <div style={{ background: 'white', padding: '16px' }}>
                    <div style={{ fontSize: '24px', fontWeight: 800 }}>{String(favorites.length).padStart(2, '0')}</div>
                    <div style={{ fontSize: '9px', fontWeight: 900, opacity: 0.4 }}>TOTAL</div>
                 </div>
                 <div style={{ background: 'white', padding: '16px' }}>
                    <div style={{ fontSize: '24px', fontWeight: 800 }}>{Math.round(favorites.length * 4.2)}</div>
                    <div style={{ fontSize: '9px', fontWeight: 900, opacity: 0.4 }}>MIN. LECTURA</div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="layout-split">
        {/* 2. ANALYTICAL SIDEBAR */}
        <div className="sidebar" style={{ paddingRight: '40px', borderRight: 'var(--border-thin)' }}>
          
          {/* Intelligence Block: Interest Map */}
          <div style={{ marginBottom: '60px' }}>
            <h3 style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '2px', opacity: 0.4, marginBottom: '24px' }}>SEMÁNTICA DE INTERÉS</h3>
            <div style={{ padding: '30px', background: '#000', color: '#fff', borderRadius: '4px' }}>
              <div style={{ fontSize: '15px', fontWeight: 600, lineHeight: '1.4', marginBottom: '24px' }}>
                "Tu interés actual se concentra en el **impacto legislativo** y la **economía de vivienda**, con un enfoque crítico en el consenso político."
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                 {['VIVIENDA', 'LEY', 'SÁNCHEZ', 'MERCADO'].map(t => (
                   <span key={t} style={{ fontSize: '9px', fontWeight: 900, padding: '4px 8px', border: '1px solid rgba(255,255,255,0.2)', fontFamily: 'var(--font-mono)' }}>{t}</span>
                 ))}
              </div>
            </div>
          </div>

          {/* Diversity Score */}
          <div style={{ marginBottom: '60px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
               <h3 style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '2px', opacity: 0.4 }}>DIVERSIDAD DE PERSPECTIVA</h3>
               <span style={{ fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>72%</span>
            </div>
            <div style={{ height: '4px', background: '#eee', borderRadius: '2px', overflow: 'hidden' }}>
               <div style={{ width: '72%', height: '100%', background: 'black' }} />
            </div>
            <p style={{ fontSize: '12px', opacity: 0.5, marginTop: '12px', lineHeight: '1.4' }}>
              Tu archivo muestra una buena pluralidad de fuentes, evitando burbujas de filtro ideológico.
            </p>
          </div>

          {/* Export Actions */}
          <div style={{ padding: '24px', border: '1px solid black', borderRadius: '4px', textAlign: 'center' }}>
             <div style={{ fontSize: '11px', fontWeight: 900, marginBottom: '16px' }}>EXPORTAR INTELIGENCIA</div>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button style={{ padding: '12px', background: 'black', color: 'white', border: 'none', fontSize: '9px', fontWeight: 900, cursor: 'pointer' }}>PDF REPORT</button>
                <button style={{ padding: '12px', background: 'white', color: 'black', border: '1px solid #000', fontSize: '9px', fontWeight: 900, cursor: 'pointer' }}>JSON DATA</button>
             </div>
          </div>
        </div>

        {/* 3. SAVED CONTENT LIST */}
        <div className="main-content" style={{ paddingLeft: '60px' }}>
          {favorites.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid black', paddingBottom: '16px' }}>
                 <div style={{ fontSize: '12px', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>HISTORIAL DE GUARDADO — RECUPERACIÓN PRIORITARIA</div>
                 <div style={{ fontSize: '11px', fontWeight: 700, opacity: 0.4 }}>ORDENAR POR: RECIENTE ▼</div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
                {favorites.map((story) => (
                  <div key={story.id}>
                    <div onClick={() => onSelectStory(story)} style={{ cursor: 'pointer' }}>
                      <StoryCard story={story} isFavorite={true} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ padding: '120px 0', textAlign: 'center' }}>
              <div style={{ fontSize: '80px', fontWeight: 800, letterSpacing: '-4px', opacity: 0.05, marginBottom: '24px' }}>CERO.</div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '12px' }}>Tu archivo está vacío actualmente</h2>
              <p style={{ opacity: 0.4, maxWidth: '400px', margin: '0 auto 40px auto', lineHeight: '1.6' }}>
                Utiliza el icono de marcador en cualquier análisis editorial para añadirlo a tu repositorio personal de inteligencia.
              </p>
              <button 
                onClick={onBack}
                style={{ 
                  padding: '20px 48px', 
                  background: 'black', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '100px', 
                  fontWeight: 900, 
                  fontSize: '11px', 
                  letterSpacing: '2px',
                  cursor: 'pointer',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                }}
              >
                REGRESAR A LA PORTADA
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 4. FOOTER NOTE */}
      <footer style={{ marginTop: '120px', padding: '40px 0', borderTop: 'var(--border-thin)', textAlign: 'center' }}>
         <div style={{ fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.3, letterSpacing: '1px' }}>
           TNE PERSONAL INTELLIGENCE MODULE v1.0.4 — © 2026
         </div>
      </footer>
    </div>
  );
};

export default FavoritesView;
