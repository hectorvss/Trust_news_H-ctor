import React from 'react';
import StoryCard from './StoryCard';

const ForYouView = ({ stories, onBack, onShare, onToggleFavorite, favorites }) => {
  return (
    <div className="for-you-view" style={{ background: '#fff' }}>
      <div style={{ padding: '24px var(--page-padding)', borderBottom: 'var(--border-thin)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '11px', fontWeight: 800, fontFamily: 'var(--font-mono)', letterSpacing: '2px', cursor: 'pointer' }} onClick={onBack}>
          ← VOLVER AL FEED GLOBAL
        </div>
        <div style={{ fontSize: '11px', fontWeight: 800, fontFamily: 'var(--font-mono)', opacity: 0.3 }}>
          TNE / ALGORITMO PERSONALIZADO
        </div>
      </div>

      <section className="layout-split" style={{ minHeight: '300px', borderBottom: 'var(--border-thin)' }}>
        <div className="sidebar" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px var(--page-padding)' }}>
          <div style={{ fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.3, marginBottom: '20px', letterSpacing: '3px' }}>
            ESTADO DEL MOTOR: ACTIVO
          </div>
          <h1 style={{ fontSize: '48px', fontWeight: 800, lineHeight: '0.9', letterSpacing: '-3px', margin: 0 }}>
            Curado para tu perfil.
          </h1>
        </div>
        <div className="main-content" style={{ display: 'flex', alignItems: 'center', padding: '60px' }}>
          <div style={{ border: '2px solid black', padding: '30px', boxShadow: '8px 8px 0px black', background: 'white', maxWidth: '400px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: 900, marginBottom: '16px', letterSpacing: '1px' }}>INTERESES DETECTADOS</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {['FINANZAS', 'TECNOLOGÍA', 'IA', 'POLÍTICA FISCAL', 'GEOPOLÍTICA'].map(tag => (
                <span key={tag} style={{ fontSize: '10px', fontWeight: 800, fontFamily: 'var(--font-mono)', padding: '6px 12px', border: '1px solid black' }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="layout-split">
        <div className="sidebar" style={{ padding: '60px var(--page-padding)' }}>
          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '2px', borderBottom: '2.5px solid black', paddingBottom: '12px', marginBottom: '24px' }}>Métricas de Interés</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {[
                { label: 'Relevancia Económica', val: '94%' },
                { label: 'Enfoque Tecnológico', val: '88%' },
                { label: 'Afinidad Política', val: '62%' }
              ].map(Stat => (
                <div key={Stat.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 800, marginBottom: '8px' }}>
                    <span>{Stat.label.toUpperCase()}</span>
                    <span>{Stat.val}</span>
                  </div>
                  <div style={{ height: '4px', background: '#eee', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: Stat.val, background: 'black' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="main-content" style={{ padding: '60px 0' }}>
          <div style={{ maxWidth: '800px' }}>
            {stories.length > 0 ? (
              stories.map(story => (
                <StoryCard 
                  key={story.id} 
                  story={story} 
                  isFavorite={favorites.some(f => f.id === story.id)}
                  onToggleFavorite={onToggleFavorite}
                  onShare={() => onShare(story)}
                />
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '100px 0', opacity: 0.3 }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 800 }}>RECALIBRANDO ALGORITMO...</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ForYouView;
