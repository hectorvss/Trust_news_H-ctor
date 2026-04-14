import React, { useState } from 'react';
import './index.css';
import { mockStories } from './mockData';
import StoryCard from './components/StoryCard';
import StoryDetail from './components/StoryDetail';
import Pricing from './components/Pricing';
import Auth from './components/Auth';
import CorporateLanding from './components/CorporateLanding';
import BiasAnalysis from './components/BiasAnalysis';

const Plus = () => <span style={{ fontSize: '18px', opacity: 0.3, fontWeight: 700 }}>+</span>;

const App = () => {
  const [selectedStory, setSelectedStory] = useState(null);
  const [view, setView] = useState('feed'); // 'feed' | 'pricing' | 'auth'
  const [activeCategory, setActiveCategory] = useState('TODO');
  const [showForYou, setShowForYou] = useState(false);

  const categories = ['TODO', 'POLÍTICA', 'FINANZAS', 'SOCIAL', 'TECNOLOGÍA', 'DEPORTE', 'CULTURA', 'INTERNACIONAL'];

  // Simulate categorized stories
  const categorizedStories = mockStories.map((s, i) => ({
    ...s,
    category: ['POLÍTICA', 'FINANZAS', 'SOCIAL'][i % 3]
  }));

  const filteredStories = activeCategory === 'TODO' 
    ? categorizedStories 
    : categorizedStories.filter(s => s.category === activeCategory);

  const Navbar = () => (
    <nav className="navbar">
      <div className="navbar__inner">
        <div className="navbar__logo" onClick={() => { setView('feed'); setSelectedStory(null); setActiveCategory('TODO'); }} style={{ cursor: 'pointer' }}>TNE.</div>
        <div className="navbar__links" style={{ display: 'flex', alignItems: 'center' }}>
          <a href="#" className="navbar__link" onClick={(e) => { e.preventDefault(); setView('feed'); setSelectedStory(null); setActiveCategory('TODO'); }}>INICIO</a>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <a 
              href="#" 
              className="navbar__link" 
              onClick={(e) => { e.preventDefault(); setShowForYou(!showForYou); }}
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              PARA TI {showForYou ? '▲' : '▼'}
            </a>
            {showForYou && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 1px)',
                left: '0',
                background: 'white',
                border: '1px solid black',
                padding: '20px',
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
                width: '300px',
                zIndex: 1000,
                marginTop: '0px'
              }}>
                {categories.map(cat => (
                  <span 
                    key={cat} 
                    onClick={() => { setActiveCategory(cat); setShowForYou(false); setView('feed'); setSelectedStory(null); }}
                    style={{ 
                      fontSize: '11px', 
                      fontFamily: 'var(--font-mono)', 
                      padding: '8px', 
                      cursor: 'pointer',
                      borderBottom: activeCategory === cat ? '2px solid black' : '1px solid #eee',
                      fontWeight: activeCategory === cat ? 800 : 400
                    }}
                  >
                    {cat}
                  </span>
                ))}
              </div>
            )}
          </div>
          <a href="#" className="navbar__link" onClick={(e) => { e.preventDefault(); setView('pricing'); }}>PRECIOS</a>
          <a href="#" className="navbar__link navbar__link--btn" onClick={(e) => { e.preventDefault(); setView('auth'); }}>COMENZAR</a>
        </div>
      </div>
    </nav>
  );

  if (view === 'auth') {
    return (
      <div className="app">
        <Navbar />
        <main style={{ marginTop: '72px' }}>
          <div className="container" style={{ padding: '60px 24px' }}>
            <Auth onBack={() => setView('feed')} />
          </div>
        </main>
      </div>
    );
  }

  if (view === 'pricing') {
    return (
      <div className="app">
        <Navbar />
        <main style={{ marginTop: '72px' }}>
          <div className="container" style={{ padding: '60px 24px' }}>
            <Pricing onBack={() => setView('feed')} />
          </div>
        </main>
      </div>
    );
  }

  if (view === 'COMPANY' || view === 'HELP') {
    return (
      <div className="app">
        <Navbar />
        <main style={{ marginTop: '72px' }}>
          <CorporateLanding type={view} onBack={() => setView('feed')} />
        </main>
      </div>
    );
  }

  if (view === 'BIAS') {
    return (
      <div className="app">
        <Navbar />
        <main style={{ marginTop: '72px' }}>
          <BiasAnalysis onBack={() => setView('feed')} />
        </main>
      </div>
    );
  }

  if (selectedStory) {
    return (
      <div className="app">
        <Navbar />
        <main style={{ marginTop: '72px' }}>
          <div className="container" style={{ padding: '60px 24px' }}>
            <StoryDetail story={selectedStory} onBack={() => setSelectedStory(null)} />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <Navbar />

      <main style={{ marginTop: '72px' }}>
        {/* Launch Offer Banner */}
        <div style={{ 
          background: 'black', 
          color: 'white', 
          padding: '8px var(--page-padding)', 
          textAlign: 'center', 
          fontSize: '11px', 
          fontWeight: 800, 
          letterSpacing: '2px',
          fontFamily: 'var(--font-mono)',
          borderBottom: 'var(--border-thin)'
        }}>
          OFERTA DE LANZAMIENTO: 1€ POR SEMANA • <span onClick={() => { setView('pricing'); setSelectedStory(null); }} style={{ textDecoration: 'underline', cursor: 'pointer' }}>OBTÉN EL DESCUENTO ↗</span>
        </div>

        {/* Active Category Indicator */}
        {activeCategory !== 'TODO' && (
          <div style={{ padding: '20px var(--page-padding)', borderBottom: 'var(--border-thin)', background: 'black', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>PORTAL: {activeCategory}</span>
            <span onClick={() => setActiveCategory('TODO')} style={{ cursor: 'pointer', fontSize: '11px', fontWeight: 700 }}>REINICIAR FILTRO ✕</span>
          </div>
        )}

        {/* Trending Topics Bar */}
        <div style={{ 
          borderBottom: 'var(--border-thin)', 
          padding: '12px var(--page-padding)', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '16px',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          background: 'white'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 6l-9.5 9.5-5-5L1 18"/><path d="M17 6h6v6"/></svg>
            TRENDING
          </span>
          {['Ley de Vivienda', 'FMI España', 'Crisis Alquiler', 'Reforma Mordaza', 'Elecciones Hungría', 'Inteligencia Artificial', 'Energía Solar'].map(topic => (
            <span key={topic} style={{ 
              backgroundColor: 'white', 
              padding: '8px 16px', 
              borderRadius: '100px', 
              fontSize: '11px', 
              fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center', 
              gap: '10px',
              cursor: 'pointer',
              border: '1px solid black',
              transition: '0.2s'
            }}>
              {topic} <span style={{ fontSize: '18px', fontWeight: 700, opacity: 0.4 }}>+</span>
            </span>
          ))}
        </div>

        {/* Hero Section Blueprint Style */}
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
              {activeCategory === 'TODO' ? 'Contrasta las \n noticias en España.' : `Contraste: \n ${activeCategory}.`}
            </h1>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
              <Plus /> <Plus />
            </div>
          </div>
        </section>

        {/* Stories Section */}
        <section className="layout-split">
          <div className="sidebar">
            {/* Daily Briefing Section Updated */}
            <div style={{ padding: '30px', border: 'var(--border-thin)', borderRadius: '24px', marginBottom: '32px', background: '#fcfcfc' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, fontFamily: 'var(--font-mono)', opacity: 0.4, marginBottom: '8px', letterSpacing: '2px' }}>
                {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase()}
              </div>
              <h2 style={{ fontSize: '32px', fontWeight: 800, margin: '0 0 16px 0', letterSpacing: '-1px' }}>Resumen Diario</h2>
              <div style={{ fontSize: '13px', opacity: 0.5, fontFamily: 'var(--font-mono)', marginBottom: '24px' }}>
                12 HISTORIAS • 342 ARTÍCULOS • 8M LECTURA
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, lineHeight: '1.3' }}>España aprueba la nueva ley de paridad en órganos constitucionales.</div>
                </div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, lineHeight: '1.3' }}>La inflación en la eurozona cae al 2.4%, abriendo puerta a bajada de tipos.</div>
                </div>
              </div>

              <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: 700, color: 'var(--color-primary)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                82% DE INFORMES ORIGINALES
              </div>
            </div>

            {/* NEW: My Bias Card (Trigger for dashboard) */}
            <div style={{ padding: '30px', border: 'var(--border-thin)', borderRadius: '24px', marginBottom: '60px', background: '#fff' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 8px 0', letterSpacing: '-1px' }}>Mi Sesgo de Lectura</h2>
              <div style={{ fontSize: '13px', opacity: 0.4, marginBottom: '24px' }}>Análisis basado en tus últimos 30 artículos.</div>
              
              <div style={{ height: '8px', background: '#f5f5f5', borderRadius: '10px', overflow: 'hidden', position: 'relative', marginBottom: '24px' }}>
                <div style={{ position: 'absolute', left: '40%', width: '30%', height: '100%', background: 'black' }} />
              </div>

              <button 
                onClick={() => setView('BIAS')}
                style={{ 
                  width: '100%', 
                  padding: '16px', 
                  background: 'none', 
                  border: '1px solid black', 
                  borderRadius: '100px', 
                  fontSize: '11px', 
                  fontWeight: 800, 
                  cursor: 'pointer',
                  letterSpacing: '1px'
                }}
                className="footer-link"
              >
                VER ANALÍTICA DETALLADA
              </button>
            </div>

            {/* Top Headlines Section */}
            <div style={{ marginBottom: '60px' }}>
              <h3 style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '2px', borderBottom: '2px solid black', paddingBottom: '12px', marginBottom: '24px' }}>TITULARES DESTACADOS</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {[
                  'El BCE mantiene los tipos pero apunta a junio.',
                  'Crisis de vivienda: el precio del alquiler sube un 12%.',
                  'Sánchez propone un pacto nacional por la IA.',
                  'La selección española se prepara para el amistoso.'
                ].map((txt, i) => (
                  <div key={i} style={{ borderBottom: '0.5px solid #eee', paddingBottom: '16px' }}>
                    <p style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 8px 0', lineHeight: '1.2' }}>{txt}</p>
                    <div style={{ width: '100%', height: '4px', background: '#eee', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: i % 2 === 0 ? '70%' : '40%', height: '100%', background: i % 2 === 0 ? '#444' : '#888' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <h2 className="section-title">Puntos Ciegos —<br/>Destacados</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', marginTop: '60px' }}>
              <div style={{ borderTop: 'var(--border-thin)', paddingTop: '20px' }}>
                <span className="tag" style={{ background: 'var(--color-primary)', color: 'white', border: 'none' }}>Punto Ciego de Izquierda</span>
                <p style={{ fontSize: '19px', fontWeight: 600, marginTop: '16px', lineHeight: '1.2' }}>El aumento de los costes sanitarios en las zonas rurales suele ser ignorado por los medios de comunicación progresistas.</p>
              </div>
              
              <div style={{ borderTop: 'var(--border-thin)', paddingTop: '20px', marginBottom: '60px' }}>
                <span className="tag" style={{ background: '#777777', color: 'white', border: 'none' }}>Punto Ciego de Derecha</span>
                <p style={{ fontSize: '19px', fontWeight: 600, marginTop: '16px', lineHeight: '1.2' }}>Los indicadores económicos positivos de las reformas laborales no suelen aparecer en los medios conservadores.</p>
              </div>
            </div>

            {/* My News Bias Section */}
            <div style={{ padding: '30px', border: 'var(--border-thin)', borderRadius: '24px', marginBottom: '60px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '8px' }}>Mi Sesgo de Lectura</h3>
              <p style={{ fontSize: '12px', opacity: 0.5, marginBottom: '24px' }}>Análisis basado en tus últimos 30 artículos.</p>
              <div style={{ display: 'flex', height: '12px', gap: '2px', marginBottom: '20px', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ flex: 1, background: '#eee' }}></div>
                <div style={{ flex: 2, background: 'black' }}></div>
                <div style={{ flex: 1, background: '#eee' }}></div>
              </div>
              <button style={{ width: '100%', padding: '12px', background: 'none', border: '1px solid black', borderRadius: '30px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>VER ANALÍTICA DETALLADA</button>
            </div>

            {/* Similar Topics Widget */}
            <div style={{ marginBottom: '60px' }}>
              <h3 style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '2px', borderBottom: '2px solid black', paddingBottom: '12px', marginBottom: '24px' }}>TEMAS RELACIONADOS</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['POLÍTICA FISCAL', 'IBEX 35', 'ENERGÍA VERDE', 'OTAN', 'STARTUPS', 'MUSEO DEL PRADO'].map(topic => (
                  <span key={topic} className="tag" style={{ background: 'none', border: '1px solid #ddd', fontSize: '10px', cursor: 'pointer' }}>{topic} +</span>
                ))}
              </div>
            </div>

            {/* Local News Widget Updated Spacing */}
            <div style={{ padding: '30px', border: 'var(--border-thin)', borderRadius: '24px', background: 'white', color: 'black' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '12px' }}>Noticias Locales</h3>
              <p style={{ fontSize: '13px', opacity: 0.6, marginBottom: '20px' }}>Descubre qué está pasando en tu ciudad ahora mismo.</p>
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-start', alignItems: 'center' }}>
                <input 
                  type="text" 
                  placeholder="Tu ciudad..." 
                  style={{ 
                    width: '140px', 
                    background: 'none', 
                    border: 'none', 
                    borderBottom: '1px solid #eee', 
                    color: 'black', 
                    fontSize: '14px', 
                    outline: 'none',
                    padding: '4px 0'
                  }} 
                />
                <button style={{ background: 'black', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '20px', fontWeight: 800, fontSize: '11px', cursor: 'pointer' }}>FIJAR</button>
              </div>
            </div>
          </div>
          
          <div className="main-content">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
              {filteredStories.map(story => (
                <div key={story.id} onClick={() => setSelectedStory(story)} style={{ cursor: 'pointer' }}>
                  <StoryCard story={story} />
                </div>
              ))}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '60px', marginBottom: '40px' }}>
              <button 
                style={{ 
                  padding: '18px 40px', 
                  border: '1px solid black', 
                  background: 'none', 
                  borderRadius: '100px', 
                  fontSize: '13px', 
                  fontWeight: 800, 
                  letterSpacing: '1px',
                  cursor: 'pointer',
                  transition: '0.2s'
                }}
                onMouseOver={(e) => { e.target.style.background = 'black'; e.target.style.color = 'white'; }}
                onMouseOut={(e) => { e.target.style.background = 'none'; e.target.style.color = 'black'; }}
              >
                CARGAR MÁS NOTICIAS
              </button>
            </div>

            {filteredStories.length === 0 && (
              <div style={{ padding: '100px', textAlign: 'center', opacity: 0.3 }}>
                No hay historias recientes en este portal aún.
              </div>
            )}
          </div>
        </section>

        {/* Specialized Section 1: Israel-Gaza */}
        <section className="layout-split" style={{ borderTop: 'var(--border-thin)', background: '#fff' }}>
          <div className="sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '32px', padding: '60px var(--page-padding)' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-1px', lineHeight: '1' }}>ESPECIAL:<br/>Israel-Gaza</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button style={{ padding: '14px', background: 'black', color: 'white', border: 'none', borderRadius: '4px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', letterSpacing: '1px' }}>MÁS BLOQUES ASÍ</button>
              <button style={{ padding: '14px', background: 'none', border: '1px solid #eee', borderRadius: '4px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', opacity: 0.6 }}>OCULTAR ESTO</button>
            </div>
            <div style={{ marginTop: 'auto', fontSize: '11px', opacity: 0.3, fontFamily: 'var(--font-mono)' }}>TEMA EN TENDENCIA GLOBAL</div>
          </div>
          <div className="main-content" style={{ padding: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', minHeight: '550px' }}>
              <div style={{ padding: '60px', borderRight: 'var(--border-thin)', display: 'flex', flexDirection: 'column', gap: '24px', cursor: 'pointer' }} className="special-card-hover">
                <div style={{ fontSize: '12px', fontWeight: 800, opacity: 0.4, letterSpacing: '1px' }}>NOTICIA DESTACADA — HACE 4H</div>
                <h3 style={{ fontSize: '42px', fontWeight: 800, lineHeight: '1', letterSpacing: '-1.5px' }}>Nuevas negociaciones en El Cairo buscan una tregua humanitaria en Gaza</h3>
                <p style={{ fontSize: '18px', color: '#333', lineHeight: '1.4', maxWidth: '90%' }}>Delegaciones de Israel y Hamás se reúnen con mediadores egipcios para discutir un posible intercambio de rehenes y una pausa prolongada en las hostilidades antes del inicio del Ramadán.</p>
                <div style={{ marginTop: 'auto' }}>
                  <div style={{ display: 'flex', height: '8px', background: '#f5f5f5', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ width: '60%', background: 'black' }}></div>
                    <div style={{ width: '20%', background: '#666' }}></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800 }}>COBERTURA: 124 FUENTES</span>
                    <span style={{ fontSize: '11px', fontWeight: 800, opacity: 0.3 }}>VER ANÁLISIS ↗</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '40px', borderBottom: 'var(--border-thin)', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', cursor: 'pointer' }} className="special-card-hover">
                  <div style={{ fontSize: '10px', fontWeight: 800, opacity: 0.4, marginBottom: '8px' }}>POLÍTICA EXTERIOR</div>
                  <h4 style={{ fontSize: '18px', fontWeight: 700, lineHeight: '1.3' }}>Ayuda humanitaria llega al puerto flotante construido por EE.UU.</h4>
                  <span style={{ fontSize: '11px', fontWeight: 700, marginTop: '12px', opacity: 0.5 }}>COBERTURA CENTRISTA</span>
                </div>
                <div style={{ padding: '40px', borderBottom: 'var(--border-thin)', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', cursor: 'pointer' }} className="special-card-hover">
                  <div style={{ fontSize: '10px', fontWeight: 800, opacity: 0.4, marginBottom: '8px' }}>CONFLICTO NORTE</div>
                  <h4 style={{ fontSize: '18px', fontWeight: 700, lineHeight: '1.3' }}>Aumenta la tensión en la frontera norte: intercambio de fuego con Hezbolá.</h4>
                  <span style={{ fontSize: '11px', fontWeight: 700, marginTop: '12px', opacity: 0.5 }}>PUNTO CIEGO DE DERECHA</span>
                </div>
                <div style={{ padding: '40px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', cursor: 'pointer' }} className="special-card-hover">
                  <div style={{ fontSize: '10px', fontWeight: 800, opacity: 0.4, marginBottom: '8px' }}>SOCIEDAD CIVIL</div>
                  <h4 style={{ fontSize: '18px', fontWeight: 700, lineHeight: '1.3' }}>Protestas masivas en Tel Aviv exigen la convocatoria de elecciones anticipadas.</h4>
                  <span style={{ fontSize: '11px', fontWeight: 700, marginTop: '12px', opacity: 0.5 }}>PUNTO CIEGO DE IZQUIERDA</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Specialized Section 2: European Politics (Restructured) */}
        <section className="layout-split" style={{ borderTop: 'var(--border-thin)', background: '#fff' }}>
          <div className="sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '32px', padding: '60px var(--page-padding)' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-1px', lineHeight: '1' }}>EUROPEAN<br/>POLITICS</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button style={{ padding: '14px', background: 'black', color: 'white', border: 'none', borderRadius: '4px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', letterSpacing: '1px' }}>MÁS DE EUROPA</button>
              <button style={{ padding: '14px', background: 'none', border: '1px solid #eee', borderRadius: '4px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', opacity: 0.6 }}>MENOS DE EUROPA</button>
            </div>
            <div style={{ marginTop: 'auto', fontSize: '11px', opacity: 0.3, fontFamily: 'var(--font-mono)' }}>ELECCIONES JUNIO 2024</div>
          </div>
          <div className="main-content" style={{ padding: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', minHeight: '550px' }}>
              <div style={{ padding: '60px', borderRight: 'var(--border-thin)', display: 'flex', flexDirection: 'column', gap: '24px' }} className="special-card-hover">
                <div style={{ fontSize: '12px', fontWeight: 800, opacity: 0.4, letterSpacing: '1px' }}>U.E. — NOTICIA CENTRAL</div>
                <h3 style={{ fontSize: '42px', fontWeight: 800, lineHeight: '1', letterSpacing: '-1.5px' }}>Macron advierte que Europa "puede morir" si no se reestructura militarmente</h3>
                <p style={{ fontSize: '18px', color: '#333', lineHeight: '1.4', maxWidth: '90%' }}>El presidente francés hace un llamamiento a la autonomía estratégica europea ante la incertidumbre del apoyo estadounidense y el ascenso de potencias rivales.</p>
                <div style={{ marginTop: 'auto' }}>
                  <div style={{ display: 'flex', height: '8px', background: '#f5f5f5', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ width: '40%', background: 'black' }}></div>
                    <div style={{ width: '50%', background: '#888' }}></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800 }}>COBERTURA: 88 FUENTES</span>
                    <span style={{ fontSize: '11px', fontWeight: 800, opacity: 0.3 }}>VER PERSPECTIVAS ↗</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '40px', borderBottom: 'var(--border-thin)', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }} className="special-card-hover">
                  <div style={{ fontSize: '10px', fontWeight: 800, opacity: 0.4, marginBottom: '8px' }}>ALEMANIA</div>
                  <h4 style={{ fontSize: '18px', fontWeight: 700, lineHeight: '1.3' }}>Berlín aprueba el paquete de defensa más grande desde la Guerra Fría.</h4>
                  <span style={{ fontSize: '11px', fontWeight: 700, marginTop: '12px', opacity: 0.5 }}>COBERTURA CENTRISTA</span>
                </div>
                <div style={{ padding: '40px', borderBottom: 'var(--border-thin)', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }} className="special-card-hover">
                  <div style={{ fontSize: '10px', fontWeight: 800, opacity: 0.4, marginBottom: '8px' }}>POLONIA</div>
                  <h4 style={{ fontSize: '18px', fontWeight: 700, lineHeight: '1.3' }}>Tusk lidera el desbloqueo de fondos europeos tras reformas judiciales.</h4>
                  <span style={{ fontSize: '11px', fontWeight: 700, marginTop: '12px', opacity: 0.5 }}>NOTICIA DESTACADA</span>
                </div>
                <div style={{ padding: '40px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }} className="special-card-hover">
                  <div style={{ fontSize: '10px', fontWeight: 800, opacity: 0.4, marginBottom: '8px' }}>HUNGRÍA</div>
                  <h4 style={{ fontSize: '18px', fontWeight: 700, lineHeight: '1.3' }}>Orbán critica la centralización de Bruselas en vísperas de las elecciones.</h4>
                  <span style={{ fontSize: '11px', fontWeight: 700, marginTop: '12px', opacity: 0.5 }}>SESGO DE DERECHA</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Specialized Section 3: U.S. Elections 2024 */}
        <section className="layout-split" style={{ borderTop: 'var(--border-thin)', background: '#fff' }}>
          <div className="sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '32px', padding: '60px var(--page-padding)' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-1px', lineHeight: '1' }}>U.S.<br/>ELECTIONS</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button style={{ padding: '14px', background: 'black', color: 'white', border: 'none', borderRadius: '4px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', letterSpacing: '1px' }}>MÁS DE EE.UU.</button>
              <button style={{ padding: '14px', background: 'none', border: '1px solid #eee', borderRadius: '4px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', opacity: 0.6 }}>MENOS DE EE.UU.</button>
            </div>
            <div style={{ marginTop: 'auto', fontSize: '11px', opacity: 0.3, fontFamily: 'var(--font-mono)' }}>RUMBO A NOVIEMBRE 2024</div>
          </div>
          <div className="main-content" style={{ padding: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', minHeight: '550px' }}>
              <div style={{ padding: '60px', borderRight: 'var(--border-thin)', display: 'flex', flexDirection: 'column', gap: '24px' }} className="special-card-hover">
                <div style={{ fontSize: '12px', fontWeight: 800, opacity: 0.4, letterSpacing: '1px' }}>DEBATE PRESIDENCIAL — ANÁLISIS</div>
                <h3 style={{ fontSize: '42px', fontWeight: 800, lineHeight: '1', letterSpacing: '-1.5px' }}>Trump y Biden empatados en los estados clave según los últimos sondeos</h3>
                <p style={{ fontSize: '18px', color: '#333', lineHeight: '1.4', maxWidth: '90%' }}>La economía y la política migratoria se consolidan como los dos ejes principales que decidirán el voto en Pensilvania, Michigan y Wisconsin.</p>
                <div style={{ marginTop: 'auto' }}>
                  <div style={{ display: 'flex', height: '8px', background: '#f5f5f5', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ width: '48%', background: '#ff3b30' }}></div>
                    <div style={{ width: '52%', background: '#007aff' }}></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800 }}>SESGO: BIPARTIDISTA ESTATAL</span>
                    <span style={{ fontSize: '11px', fontWeight: 800, opacity: 0.3 }}>245 FUENTES ANALIZADAS</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '40px', borderBottom: 'var(--border-thin)', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }} className="special-card-hover">
                  <div style={{ fontSize: '10px', fontWeight: 800, opacity: 0.4, marginBottom: '8px' }}>CORTE SUPREMA</div>
                  <h4 style={{ fontSize: '18px', fontWeight: 700, lineHeight: '1.3' }}>Fallo histórico sobre la inmunidad presidencial genera debate jurídico.</h4>
                  <span style={{ fontSize: '11px', fontWeight: 700, marginTop: '12px', opacity: 0.5 }}>COBERTURA LEGAL</span>
                </div>
                <div style={{ padding: '40px', borderBottom: 'var(--border-thin)', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }} className="special-card-hover">
                  <div style={{ fontSize: '10px', fontWeight: 800, opacity: 0.4, marginBottom: '8px' }}>ECONOMÍA</div>
                  <h4 style={{ fontSize: '18px', fontWeight: 700, lineHeight: '1.3' }}>La inflación en EE.UU. cae más de lo esperado: ¿respiro para Biden?</h4>
                  <span style={{ fontSize: '11px', fontWeight: 700, marginTop: '12px', opacity: 0.5 }}>ANÁLISIS FINANCIERO</span>
                </div>
                <div style={{ padding: '40px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }} className="special-card-hover">
                  <div style={{ fontSize: '10px', fontWeight: 800, opacity: 0.4, marginBottom: '8px' }}>CAMPAÑA RNC</div>
                  <h4 style={{ fontSize: '18px', fontWeight: 700, lineHeight: '1.3' }}>Trump consolida su apoyo entre los votantes latinos en Florida.</h4>
                  <span style={{ fontSize: '11px', fontWeight: 700, marginTop: '12px', opacity: 0.5 }}>PUNTO CIEGO DE IZQUIERDA</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Specialized Section 4: Climate Crisis */}
        <section className="layout-split" style={{ borderTop: 'var(--border-thin)', background: '#fff' }}>
          <div className="sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '32px', padding: '60px var(--page-padding)' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-1px', lineHeight: '1' }}>CLIMATE<br/>CRISIS</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button style={{ padding: '14px', background: 'black', color: 'white', border: 'none', borderRadius: '4px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', letterSpacing: '1px' }}>MÁS CLIMA</button>
              <button style={{ padding: '14px', background: 'none', border: '1px solid #eee', borderRadius: '4px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', opacity: 0.6 }}>MENOS CLIMA</button>
            </div>
            <div style={{ marginTop: 'auto', fontSize: '11px', opacity: 0.3, fontFamily: 'var(--font-mono)' }}>EMERGENCIA GLOBAL</div>
          </div>
          <div className="main-content" style={{ padding: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', minHeight: '550px' }}>
              <div style={{ padding: '60px', borderRight: 'var(--border-thin)', display: 'flex', flexDirection: 'column', gap: '24px' }} className="special-card-hover">
                <div style={{ fontSize: '12px', fontWeight: 800, opacity: 0.4, letterSpacing: '1px' }}>INFORME IPCC — CIENCIA</div>
                <h3 style={{ fontSize: '42px', fontWeight: 800, lineHeight: '1', letterSpacing: '-1.5px' }}>Abril rompe récords como el mes más caluroso de la historia mundial</h3>
                <p style={{ fontSize: '18px', color: '#333', lineHeight: '1.4', maxWidth: '90%' }}>Los niveles de CO2 en la atmósfera alcanzan un nuevo máximo, acelerando el deshielo en los polos y la frecuencia de eventos climáticos extremos.</p>
                <div style={{ marginTop: 'auto' }}>
                  <div style={{ display: 'flex', height: '8px', background: '#f5f5f5', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ width: '85%', background: 'black' }}></div>
                    <div style={{ width: '15%', background: '#ccc' }}></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800 }}>ALTO CONSENSO CIENTÍFICO</span>
                    <span style={{ fontSize: '11px', fontWeight: 800, opacity: 0.3 }}>512 ESTUDIOS REVISADOS</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '40px', borderBottom: 'var(--border-thin)', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }} className="special-card-hover">
                  <div style={{ fontSize: '10px', fontWeight: 800, opacity: 0.4, marginBottom: '8px' }}>OCEANOGRAFÍA</div>
                  <h4 style={{ fontSize: '18px', fontWeight: 700, lineHeight: '1.3' }}>Blanqueamiento masivo del coral en la Gran Barrera: alerta roja.</h4>
                  <span style={{ fontSize: '11px', fontWeight: 700, marginTop: '12px', opacity: 0.5 }}>COBERTURA AMBIENTAL</span>
                </div>
                <div style={{ padding: '40px', borderBottom: 'var(--border-thin)', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }} className="special-card-hover">
                  <div style={{ fontSize: '10px', fontWeight: 800, opacity: 0.4, marginBottom: '8px' }}>RENOVABLES</div>
                  <h4 style={{ fontSize: '18px', fontWeight: 700, lineHeight: '1.3' }}>La energía solar supera al carbón en la red eléctrica de EE.UU.</h4>
                  <span style={{ fontSize: '11px', fontWeight: 700, marginTop: '12px', opacity: 0.5 }}>PUNTO CIEGO DE DERECHA</span>
                </div>
                <div style={{ padding: '40px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }} className="special-card-hover">
                  <div style={{ fontSize: '10px', fontWeight: 800, opacity: 0.4, marginBottom: '8px' }}>LEGISLACIÓN</div>
                  <h4 style={{ fontSize: '18px', fontWeight: 700, lineHeight: '1.3' }}>Nuevas tasas al carbono: el debate sobre el impacto en los precios.</h4>
                  <span style={{ fontSize: '11px', fontWeight: 700, marginTop: '12px', opacity: 0.5 }}>PERSPECTIVA ECONÓMICA</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer style={{ background: 'var(--color-primary)', color: 'white', padding: '80px 0 40px 0', borderTop: 'var(--border-thin)' }}>
        <div className="container" style={{ padding: '0 var(--page-padding)' }}>
          {/* Top Footer: News & Trending */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '40px', paddingBottom: '80px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div>
              <h5 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '24px' }}>Noticias</h5>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', opacity: 0.7 }}>
                <li className="footer-link">Página de inicio</li>
                <li className="footer-link">Noticias locales</li>
                <li className="footer-link">Feed Blindspot</li>
                <li className="footer-link">Internacional</li>
              </ul>
            </div>
            <div>
              <h5 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '24px' }}>Internacional</h5>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', opacity: 0.7 }}>
                <li className="footer-link">América del Norte</li>
                <li className="footer-link">América del Sur</li>
                <li className="footer-link">Europa</li>
                <li className="footer-link">Asia</li>
                <li className="footer-link">África</li>
              </ul>
            </div>
            <div>
              <h5 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '24px' }}>Tendencia Int.</h5>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', opacity: 0.7 }}>
                <li className="footer-link">Coachella</li>
                <li className="footer-link">WNBA</li>
                <li className="footer-link">Papa Francisco</li>
                <li className="footer-link">IA Generativa</li>
                <li className="footer-link">Guerra en Gaza</li>
              </ul>
            </div>
            <div>
              <h5 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '24px' }}>Tendencia EE.UU.</h5>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', opacity: 0.7 }}>
                <li className="footer-link">WNBA</li>
                <li className="footer-link">Baseball</li>
                <li className="footer-link">Donald Trump</li>
                <li className="footer-link">Joe Biden</li>
                <li className="footer-link">NASA</li>
              </ul>
            </div>
            <div>
              <h5 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '24px' }}>Tendencia U.K.</h5>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', opacity: 0.7 }}>
                <li className="footer-link">Premier League</li>
                <li className="footer-link">Arsenal FC</li>
                <li className="footer-link">Manchester United</li>
                <li className="footer-link">Brexit Update</li>
                <li className="footer-link">Royal Family</li>
              </ul>
            </div>
          </div>

          {/* Bottom Footer: Brand & Corporate */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '40px', paddingTop: '80px' }}>
            <div>
              <div style={{ fontSize: '48px', fontWeight: 800, letterSpacing: '-2px', lineHeight: '0.8', marginBottom: '8px', cursor: 'pointer' }}>TNE.</div>
              <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', opacity: 0.4 }}>TRUST NEWS ESPAÑA</div>
            </div>
            <div>
              <h5 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '24px', letterSpacing: '1px', cursor: 'pointer' }} className="footer-link" onClick={() => setView('COMPANY')}>COMPAÑÍA</h5>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', opacity: 0.7 }}>
                <li className="footer-link" onClick={() => setView('COMPANY')}>Sobre nosotros</li>
                <li className="footer-link" onClick={() => setView('COMPANY')}>Misión</li>
                <li className="footer-link" onClick={() => setView('COMPANY')}>Blog</li>
                <li className="footer-link" onClick={() => setView('COMPANY')}>Suscripciones</li>
                <li className="footer-link" onClick={() => setView('COMPANY')}>Carreras</li>
              </ul>
            </div>
            <div>
              <h5 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '24px', letterSpacing: '1px', cursor: 'pointer' }} className="footer-link" onClick={() => setView('HELP')}>AYUDA</h5>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', opacity: 0.7 }}>
                <li className="footer-link" onClick={() => setView('HELP')}>Centro de ayuda</li>
                <li className="footer-link" onClick={() => setView('HELP')}>FAQ</li>
                <li className="footer-link" onClick={() => setView('HELP')}>Contacto</li>
                <li className="footer-link" onClick={() => setView('HELP')}>Ratings de Sesgo</li>
                <li className="footer-link" onClick={() => setView('HELP')}>Fuentes de noticias</li>
              </ul>
            </div>
            <div>
              <h5 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '24px', letterSpacing: '1px' }}>HERRAMIENTAS</h5>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', opacity: 0.7 }}>
                <li className="footer-link">App móvil</li>
                <li className="footer-link">Extensión de navegador</li>
                <li className="footer-link">Newsletter diaria</li>
                <li className="footer-link">Timelines</li>
                <li className="footer-link">API de datos</li>
              </ul>
            </div>
          </div>

          <div style={{ marginTop: '80px', paddingTop: '40px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', opacity: 0.3, fontFamily: 'var(--font-mono)' }}>
            <div>© 2026 TRUST NEWS ESPAÑA. TODOS LOS DERECHOS RESERVADOS.</div>
            <div style={{ display: 'flex', gap: '24px' }}>
              <span style={{ cursor: 'pointer' }} className="footer-link">TÉRMINOS</span>
              <span style={{ cursor: 'pointer' }} className="footer-link">PRIVACIDAD</span>
              <span style={{ cursor: 'pointer' }} className="footer-link">DISEÑO POR ANTIGRAVITY</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
