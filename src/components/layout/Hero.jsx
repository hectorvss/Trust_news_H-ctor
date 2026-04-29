import React from 'react';

const Plus = () => <span style={{ fontSize: '14px', opacity: 0.3, fontWeight: 700, display: 'inline-flex', alignItems: 'center', marginLeft: '4px', lineHeight: 1 }}>+</span>;

const Hero = ({ activeCategory, activeCity, activeTopic }) => {
  return (
    <section className="layout-split" style={{ minHeight: '300px' }}>
      <div className="sidebar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg viewBox="0 0 285 152" fill="none" style={{ width: '80%' }}>
          <path d="M0 76H260M260 76L200 8M260 76L200 144" stroke="var(--color-primary)" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div className="main-content" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <Plus /> <Plus />
        </div>
        <div style={{ fontSize: '12px', fontWeight: 800, fontFamily: 'var(--font-mono)', opacity: 0.4, marginBottom: '24px', letterSpacing: '3px' }}>
          {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase()}
        </div>
        <h1 style={{ fontSize: '80px', lineHeight: '0.9', letterSpacing: '-4px', margin: 0 }}>
          {activeCategory === 'TODO' && !activeCity && !activeTopic
            ? 'Contrasta las \n noticias en España.' 
            : (activeCategory === 'PARA TI' ? 'Tu Selección \n Personal.' : `Resultados para: \n ${activeCategory !== 'TODO' ? activeCategory : (activeTopic || activeCity)}.`)}
        </h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
          <Plus /> <Plus />
        </div>
      </div>
    </section>
  );
};

export default Hero;
