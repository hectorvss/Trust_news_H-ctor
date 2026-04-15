import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import './index.css';
import { mockStories } from './mockData';
import StoryCard from './components/StoryCard';
import StoryDetail from './components/StoryDetail';
import Pricing from './components/Pricing';
import Auth from './components/Auth';
import CorporateLanding from './components/CorporateLanding';
import BiasAnalysis from './components/BiasAnalysis';
import StoryReader from './components/StoryReader';
import DailySummary from './components/DailySummary';
import FavoritesView from './components/FavoritesView';
import Footer from './components/Footer';
import ShareModal from './components/ShareModal';

const Plus = () => <span style={{ fontSize: '14px', opacity: 0.3, fontWeight: 700, display: 'inline-flex', alignItems: 'center', marginLeft: '4px', lineHeight: 1 }}>+</span>;

const App = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedStory, setSelectedStory] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [scrollPos, setScrollPos] = useState(0);
  const [forYouMode, setForYouMode] = useState(false);

  const [activeCategory, setActiveCategory] = useState('TODO');
  const [activeStoryFilter, setActiveStoryFilter] = useState('TODO');
  const [activeStoryTab, setActiveStoryTab] = useState('RESUMEN');
  const [showForYou, setShowForYou] = useState(false);
  const [visibleStories, setVisibleStories] = useState(4);

  const [favorites, setFavorites] = useState([]);
  const [shareConfig, setShareConfig] = useState({ isOpen: false, story: null });

  const openShare = (story) => {
    setShareConfig({ isOpen: true, story });
  };

  const toggleFavorite = (story) => {
    if (!story) return;
    setFavorites(prev => {
      const isFav = prev.some(f => f.id === story.id);
      if (isFav) return prev.filter(f => f.id !== story.id);
      return [story, ...prev];
    });
  };

  const categories = ['TODO', 'PARA TI', 'POLÍTICA', 'FINANZAS', 'SOCIAL', 'TECNOLOGÍA', 'DEPORTE', 'CULTURA', 'INTERNACIONAL'];

  const categorizedStories = mockStories.map((s, i) => ({
    ...s,
    category: ['POLÍTICA', 'FINANZAS', 'SOCIAL', 'TECNOLOGÍA', 'DEPORTE', 'CULTURA', 'INTERNACIONAL'][i % 8]
  }));

  const displayStoriesFull = activeCategory === 'PARA TI'
    ? categorizedStories.filter(s => ['FINANZAS', 'TECNOLOGÍA', 'POLÍTICA'].includes(s.category))
    : (activeCategory === 'TODO' 
        ? categorizedStories 
        : categorizedStories.filter(s => s.category === activeCategory));

  const displayStories = displayStoriesFull.slice(0, visibleStories);

  const Navbar = () => (
    <nav className="navbar">
      <div className="navbar__inner">
        <div className="navbar__logo" onClick={() => { navigate('/'); setActiveCategory('TODO'); setSelectedStory(null); }} style={{ cursor: 'pointer' }}>TNE.</div>
        <div className="navbar__links" style={{ display: 'flex', alignItems: 'center' }}>
          <a href="/" className="navbar__link" onClick={(e) => { e.preventDefault(); navigate('/'); setActiveCategory('TODO'); setSelectedStory(null); }}>INICIO</a>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <a 
              href="#" 
              className="navbar__link" 
              onClick={(e) => { e.preventDefault(); setShowForYou(!showForYou); }}
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              CATEGORÍAS {showForYou ? '▲' : '▼'}
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
                    onClick={() => { setActiveCategory(cat); setShowForYou(false); navigate('/'); setSelectedStory(null); }}
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
          <a href="/pricing" className="navbar__link" onClick={(e) => { e.preventDefault(); navigate('/pricing'); }}>PRECIOS</a>
          <a href="/auth" className="navbar__link navbar__link--btn" onClick={(e) => { e.preventDefault(); navigate('/auth'); }}>COMENZAR</a>
        </div>
      </div>
    </nav>
  );

  return (
    <div className="app">
      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateX(10px); }
          15% { opacity: 1; transform: translateX(0); }
          85% { opacity: 1; transform: translateX(0); }
          100% { opacity: 0; transform: translateX(-5px); }
        }
        @keyframes heartPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
      `}</style>
      <Navbar />
      <main style={{ marginTop: '72px', minHeight: '80vh' }}>
        <Routes>
          <Route path="/" element={
            <>
              {/* Launch Offer Banner */}
              <div style={{ background: 'black', color: 'white', padding: '8px var(--page-padding)', textAlign: 'center', fontSize: '11px', fontWeight: 800, letterSpacing: '2px', fontFamily: 'var(--font-mono)', borderBottom: 'var(--border-thin)' }}>
                OFERTA DE LANZAMIENTO: 1€ POR SEMANA • <span onClick={() => navigate('/pricing')} style={{ textDecoration: 'underline', cursor: 'pointer' }}>OBTÉN EL DESCUENTO ↗</span>
              </div>

              {/* Active Category Indicator */}
              {activeCategory !== 'TODO' && (
                <div style={{ padding: '20px var(--page-padding)', borderBottom: 'var(--border-thin)', background: 'black', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>PORTAL: {activeCategory}</span>
                  <span onClick={() => setActiveCategory('TODO')} style={{ cursor: 'pointer', fontSize: '11px', fontWeight: 700 }}>REINICIAR FILTRO ✕</span>
                </div>
              )}

              {/* Trending Topics Bar */}
              <div style={{ borderBottom: 'var(--border-thin)', padding: '12px var(--page-padding)', display: 'flex', alignItems: 'center', gap: '16px', overflowX: 'auto', whiteSpace: 'nowrap', background: 'white' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 6l-9.5 9.5-5-5L1 18"/><path d="M17 6h6v6"/></svg>
                  TRENDING
                </span>
                {['Ley de Vivienda', 'FMI España', 'Crisis Alquiler', 'Reforma Mordaza', 'Elecciones Hungría', 'Inteligencia Artificial', 'Energía Solar'].map(topic => (
                  <span key={topic} style={{ backgroundColor: 'white', padding: '8px 16px', borderRadius: '100px', fontSize: '11px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', border: '1px solid black', transition: '0.2s' }}>
                    {topic} <Plus />
                  </span>
                ))}
              </div>

              {/* Hero Section */}
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
                    {activeCategory === 'TODO' 
                      ? 'Contrasta las \n noticias en España.' 
                      : (activeCategory === 'PARA TI' ? 'Tu Selección \n Personal.' : `Contraste: \n ${activeCategory}.`)}
                  </h1>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
                    <Plus /> <Plus />
                  </div>
                </div>
              </section>

              {/* Content Split */}
              <section className="layout-split">
                <div className="sidebar">
                  {/* Daily Briefing - Exact Restoration */}
                  <div 
                    onClick={() => navigate('/daily-summary')}
                    style={{ padding: '30px', border: 'var(--border-thin)', borderRadius: '24px', marginBottom: '32px', background: '#fff', cursor: 'pointer' }}
                  >
                    <div style={{ fontSize: '10px', fontWeight: 800, fontFamily: 'var(--font-mono)', opacity: 0.3, marginBottom: '20px', letterSpacing: '2px' }}>
                      MIÉRCOLES, 15 DE ABRIL DE 2026
                    </div>
                    <h2 style={{ fontSize: '32px', fontWeight: 800, margin: '0 0 16px 0', letterSpacing: '-1px' }}>Resumen Diario</h2>
                    <div style={{ fontSize: '11px', opacity: 0.4, fontFamily: 'var(--font-mono)', marginBottom: '32px', fontWeight: 800 }}>
                      12 HISTORIAS • 342 ARTÍCULOS • 8M LECTURA
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '30px' }}>
                      <p style={{ fontSize: '14px', fontWeight: 700, lineHeight: '1.4', margin: 0 }}>España aprueba la nueva ley de paridad en órganos constitucionales.</p>
                      <p style={{ fontSize: '14px', fontWeight: 700, lineHeight: '1.4', margin: 0 }}>La inflación en la eurozona cae al 2.4%, abriendo puerta a bajada de tipos.</p>
                    </div>
                    <div style={{ fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.4 }}>
                       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                       92% DE INFORMES ORIGINALES
                    </div>
                  </div>

                  {/* My Bias Card - Exact Restoration */}
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

                  {/* Favorites Card - Re-inserted */}
                  <div style={{ padding: '30px', border: 'var(--border-thin)', borderRadius: '24px', marginBottom: '32px', background: '#fff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 8px 0', letterSpacing: '-1px' }}>Mis Favoritos</h2>
                      <span style={{ fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.2 }}>[ {String(favorites.length).padStart(2, '0')} ]</span>
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

                   {/* Headlines - Exact Restoration */}
                   <div style={{ marginBottom: '60px' }}>
                    <h3 style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '2px', borderBottom: '2.5px solid black', paddingBottom: '12px', marginBottom: '24px' }}>TITULARES DESTACADOS</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                      {[
                        { t: 'El BCE mantiene los tipos pero apunta a junio.', w: '70%' },
                        { t: 'Crisis de vivienda: el precio del alquiler sube un 12%.', w: '35%' },
                        { t: 'Sánchez propone un pacto nacional por la IA.', w: '85%' },
                        { t: 'La selección española se prepara para el amistoso.', w: '45%' }
                      ].map((item, i) => (
                        <div key={i}>
                          <p style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 10px 0', lineHeight: '1.2' }}>{item.t}</p>
                          <div style={{ width: '100%', height: '4px', background: '#f0f0f0' }}>
                            <div style={{ width: item.w, height: '100%', background: '#444' }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Puntos Ciegos - Exact Restoration */}
                  <div style={{ marginBottom: '60px' }}>
                    <h2 style={{ fontSize: '32px', fontWeight: 800, margin: '0 0 40px 0', letterSpacing: '-1.5px', lineHeight: '1' }}>Puntos Ciegos —<br/>Destacados</h2>
                    
                    <div style={{ marginBottom: '40px', borderBottom: '1px solid black', paddingBottom: '40px' }}>
                      <span style={{ background: 'black', color: 'white', fontSize: '10px', fontWeight: 900, padding: '4px 10px', borderRadius: '100px', fontFamily: 'var(--font-mono)' }}>PUNTO CIEGO DE IZQUIERDA</span>
                      <p style={{ fontSize: '19px', fontWeight: 600, marginTop: '20px', lineHeight: '1.2' }}>El aumento de los costes sanitarios en las zonas rurales suele ser ignorado por los medios de comunicación progresistas.</p>
                    </div>

                    <div>
                      <span style={{ background: '#888', color: 'white', fontSize: '10px', fontWeight: 900, padding: '4px 10px', borderRadius: '100px', fontFamily: 'var(--font-mono)' }}>PUNTO CIEGO DE DERECHA</span>
                      <p style={{ fontSize: '19px', fontWeight: 600, marginTop: '20px', lineHeight: '1.2' }}>Los indicadores económicos positivos de las reformas laborales no suelen aparecer en los medios conservadores.</p>
                    </div>
                  </div>

                  {/* Related Topics - Exact Restoration */}
                  <div style={{ marginBottom: '60px' }}>
                    <h3 style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '2px', borderBottom: '2.5px solid black', paddingBottom: '12px', marginBottom: '24px', textTransform: 'uppercase' }}>Temas Relacionados</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {['POLÍTICA FISCAL', 'IBEX 35', 'ENERGÍA VERDE', 'OTAN', 'STARTUPS', 'MUSEO DEL PRADO'].map(topic => (
                        <span key={topic} style={{ background: 'none', border: '1px solid #eee', fontSize: '10px', fontWeight: 800, padding: '8px 16px', borderRadius: '100px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', transition: '0.2s' }}>{topic} <Plus /></span>
                      ))}
                    </div>
                  </div>

                  {/* Local News - Exact Restoration */}
                  <div style={{ padding: '30px', border: 'var(--border-thin)', borderRadius: '24px', background: '#fff', marginBottom: '60px', overflow: 'hidden' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.5px' }}>Noticias Locales</h3>
                    <p style={{ fontSize: '13px', opacity: 0.4, marginBottom: '30px', lineHeight: '1.2' }}>Descubre qué está pasando en tu ciudad ahora mismo.</p>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', borderBottom: '1.5px solid #f8f8f8', paddingBottom: '10px' }}>
                      <input type="text" placeholder="Tu ciudad..." style={{ flex: 1, border: 'none', fontSize: '14px', outline: 'none', fontWeight: 600, width: '100%' }} />
                      <button style={{ background: 'black', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '100px', fontWeight: 900, fontSize: '11px', cursor: 'pointer', flexShrink: 0 }}>FIJAR</button>
                    </div>
                  </div>
                </div>

                <div className="main-content">
                   {/* Main Stories Feed */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
                    {displayStories.map(story => (
                      <div key={story.id} onClick={() => { navigate(`/story/${story.id}`); setSelectedStory(story); }} style={{ cursor: 'pointer' }}>
                        <StoryCard 
                          story={story} 
                          isFavorite={favorites.some(f => f.id === story.id)}
                          onToggleFavorite={toggleFavorite}
                          onShare={() => openShare(story)}
                        />
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '60px', marginBottom: '40px' }}>
                    {visibleStories < displayStoriesFull.length ? (
                      <button 
                        onClick={() => setVisibleStories(prev => prev + 4)}
                        style={{ padding: '18px 40px', border: '1.5px solid black', borderBottomWidth: '3px', background: 'none', borderRadius: '100px', fontSize: '12px', fontWeight: 900, cursor: 'pointer', transition: '0.2s', letterSpacing: '1px' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'black'; e.currentTarget.style.color = 'white'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'black'; }}
                      >
                        CARGAR MÁS NOTICIAS
                      </button>
                    ) : (
                      <div style={{ opacity: 0.3, fontSize: '11px', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>FIN DE LAS NOTICIAS RECIENTES</div>
                    )}
                  </div>
                </div>
              </section>

              {/* SPECIAL SECTIONS GRID SYSTEM - EXACT REPLICATION */}
              {[
                {
                  id: 'isr-gaz',
                  label: 'ESPECIAL:',
                  title: 'Israel-Gaza',
                  btn1: 'MÁS BLOQUES ASÍ',
                  btn2: 'OCULTAR ESTO',
                  trend: 'TEMA EN TENDENCIA GLOBAL',
                  main: {
                    label: 'NOTICIA DESTACADA — HACE 4H',
                    title: 'Nuevas negociaciones en El Cairo buscan una tregua humanitaria en Gaza',
                    desc: 'Delegaciones de Israel y Hamás se reúnen con mediadores egipcios para discutir un posible intercambio de rehenes y una pausa prolongada en las hostilidades antes del inicio del Ramadán.',
                    legendLeft: 'COBERTURA: 124 FUENTES',
                    legendRight: 'VER ANÁLISIS ↗',
                    barType: 'grayscale'
                  },
                  sides: [
                    { label: 'POLÍTICA EXTERIOR', title: 'Ayuda humanitaria llega al puerto flotante construido por EE.UU.', meta: 'COBERTURA CENTRISTA' },
                    { label: 'CONFLICTO NORTE', title: 'Aumenta la tensión en la frontera norte: intercambio de fuego con Hezbolá.', meta: 'PUNTO CIEGO DE DERECHA' },
                    { label: 'SOCIEDAD CIVIL', title: 'Protestas masivas en Tel Aviv exigen la convocatoria de elecciones anticipadas.', meta: 'PUNTO CIEGO DE IZQUIERDA' }
                  ]
                },
                {
                  id: 'eur-pol',
                  label: 'EUROPEAN',
                  title: 'POLITICS',
                  btn1: 'MÁS DE EUROPA',
                  btn2: 'MENOS DE EUROPA',
                  trend: 'ELECCIONES JUNIO 2024',
                  main: {
                    label: 'U.E. — NOTICIA CENTRAL',
                    title: 'Macron advierte que Europa "puede morir" si no se reestructura militarmente',
                    desc: 'El presidente francés hace un llamamiento a la autonomía estratégica europea ante la incertidumbre del apoyo estadounidense y el ascenso de potencias rivales.',
                    legendLeft: 'COBERTURA: 88 FUENTES',
                    legendRight: 'VER PERSPECTIVAS ↗',
                    barType: 'grayscale'
                  },
                  sides: [
                    { label: 'ALEMANIA', title: 'Berlín aprueba el paquete de defensa más grande desde la Guerra Fría.', meta: 'COBERTURA CENTRISTA' },
                    { label: 'POLONIA', title: 'Tusk lidera el desbloqueo de fondos europeos tras reformas judiciales.', meta: 'NOTICIA DESTACADA' },
                    { label: 'HUNGRÍA', title: 'Orbán critica la centralización de Bruselas en vísperas de las elecciones.', meta: 'SESGO DE DERECHA' }
                  ]
                },
                {
                  id: 'us-elec',
                  label: 'U.S.',
                  title: 'ELECTIONS',
                  btn1: 'MÁS DE EE.UU.',
                  btn2: 'MENOS DE EE.UU.',
                  trend: 'RUMBO A NOVIEMBRE 2024',
                  main: {
                    label: 'DEBATE PRESIDENCIAL — ANÁLISIS',
                    title: 'Trump y Biden empatados en los estados clave según los últimos sondeos',
                    desc: 'La economía y la política migratoria se consolidan como los dos ejes principales que decidirán el voto en Pensilvania, Michigan y Wisconsin.',
                    legendLeft: 'SESGO: BIPARTIDISTA ESTATAL',
                    legendRight: '245 FUENTES ANALIZADAS',
                    barType: 'bipartisan'
                  },
                  sides: [
                    { label: 'CORTE SUPREMA', title: 'Fallo histórico sobre la inmunidad presidencial genera debate jurídico.', meta: 'COBERTURA LEGAL' },
                    { label: 'ECONOMÍA', title: 'La inflación en EE.UU. cae más de lo esperado: ¿respiro para Biden?', meta: 'ANÁLISIS FINANCIERO' },
                    { label: 'CAMPAÑA RNC', title: 'Trump consolida su apoyo entre los votantes latinos en Florida.', meta: 'PUNTO CIEGO DE IZQUIERDA' }
                  ]
                },
                {
                  id: 'cli-cri',
                  label: 'CLIMATE',
                  title: 'CRISIS',
                  btn1: 'MÁS CLIMA',
                  btn2: 'MENOS CLIMA',
                  trend: 'EMERGENCIA GLOBAL',
                  main: {
                    label: 'INFORME IPCC — CIENCIA',
                    title: 'Abril rompe récords como el mes más caluroso de la historia mundial',
                    desc: 'Los niveles de CO2 en la atmósfera alcanzan un nuevo máximo, acelerando el deshielo en los polos y la frecuencia de eventos climáticos extremos.',
                    legendLeft: 'ALTO CONSENSO CIENTÍFICO',
                    legendRight: '512 ESTUDIOS REVISADOS',
                    barType: 'grayscale'
                  },
                  sides: [
                    { label: 'OCEANOGRAFÍA', title: 'Blanqueamiento masivo del coral en la Gran Barrera: alerta roja.', meta: 'COBERTURA AMBIENTAL' },
                    { label: 'RENOVABLES', title: 'La energía solar supera al carbón en la red eléctrica de EE.UU.', meta: 'PUNTO CIEGO DE DERECHA' },
                    { label: 'LEGISLACIÓN', title: 'Nuevas tasas al carbono: el debate sobre el impacto en los precios.', meta: 'PERSPECTIVA ECONÓMICA' }
                  ]
                }
              ].map((section, idx) => (
                <section key={section.id} className="layout-split" style={{ borderTop: section.id === 'isr-gaz' ? 'var(--border-thin)' : '1px solid black', background: '#fff' }}>
                  <div className="sidebar" style={{ display: 'flex', flexDirection: 'column', padding: '60px 40px', borderRight: 'var(--border-thin)' }}>
                    <h2 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-1.5px', lineHeight: '1', margin: '0 0 32px 0' }}>{section.label}<br/>{section.title}</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <button style={{ padding: '14px', background: 'black', color: 'white', border: 'none', borderRadius: '4px', fontSize: '10px', fontWeight: 900, cursor: 'pointer', letterSpacing: '1px' }}>{section.btn1}</button>
                      <button style={{ padding: '14px', background: 'none', border: '1px solid #f0f0f0', borderRadius: '4px', fontSize: '10px', fontWeight: 900, cursor: 'pointer', color: '#999', letterSpacing: '1px' }}>{section.btn2}</button>
                    </div>
                    <div style={{ marginTop: 'auto', fontSize: '10px', opacity: 0.2, fontFamily: 'var(--font-mono)', fontWeight: 800 }}>{section.trend}</div>
                  </div>
                  <div className="main-content" style={{ padding: 0 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', minHeight: '600px' }}>
                      <div style={{ padding: '60px', borderRight: 'var(--border-thin)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{ fontSize: '11px', fontWeight: 900, opacity: 0.25, letterSpacing: '1px', fontFamily: 'var(--font-mono)' }}>{section.main.label}</div>
                        <h3 style={{ fontSize: '48px', fontWeight: 800, lineHeight: '1.05', letterSpacing: '-2px', margin: 0 }}>{section.main.title}</h3>
                        <p style={{ fontSize: '18px', color: '#666', lineHeight: '1.4', maxWidth: '90%', margin: 0 }}>{section.main.desc}</p>
                        <div style={{ marginTop: 'auto' }}>
                          <div style={{ display: 'flex', height: '8px', background: '#f5f5f5', borderRadius: '4px', overflow: 'hidden' }}>
                            {section.main.barType === 'bipartisan' ? (
                              <>
                                <div style={{ width: '40%', background: 'black' }}></div>
                                <div style={{ width: '15%', background: '#ccc' }}></div>
                                <div style={{ width: '45%', background: '#666' }}></div>
                              </>
                            ) : (
                              <>
                                <div style={{ width: '60%', background: 'black' }}></div>
                                <div style={{ width: '25%', background: '#666' }}></div>
                              </>
                            )}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>
                            <span style={{ opacity: 0.8 }}>{section.main.legendLeft}</span>
                            <span style={{ opacity: 0.3 }}>{section.main.legendRight}</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {section.sides.map((side, sIdx) => (
                           <div key={sIdx} style={{ padding: '40px', borderBottom: sIdx < 2 ? 'var(--border-thin)' : 'none', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center' }}>
                             <div style={{ fontSize: '10px', fontWeight: 900, opacity: 0.3, letterSpacing: '0.5px' }}>{side.label}</div>
                             <h4 style={{ fontSize: '19px', fontWeight: 700, lineHeight: '1.25', margin: 0 }}>{side.title}</h4>
                             <div style={{ fontSize: '10px', fontWeight: 900, opacity: 0.25, fontFamily: 'var(--font-mono)' }}>{side.meta}</div>
                           </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              ))}
            </>
          } />

          <Route path="/pricing" element={<div className="container" style={{ padding: '60px 24px' }}><Pricing onBack={() => navigate('/')} /></div>} />
          <Route path="/auth" element={<div className="container" style={{ padding: '60px 24px' }}><Auth onBack={() => navigate('/')} /></div>} />
          <Route path="/daily-summary" element={<DailySummary onBack={() => navigate('/')} />} />
          <Route path="/favorites" element={
            <div className="container" style={{ padding: '60px 0' }}>
              <FavoritesView 
                favorites={favorites} 
                onBack={() => navigate('/')} 
                onSelectStory={(story) => { setSelectedStory(story); navigate(`/story/${story.id}`); }}
              />
            </div>
          } />
          <Route path="/bias" element={<BiasAnalysis onBack={() => navigate('/')} />} />
          <Route path="/story/:id" element={
            <div className="container" style={{ padding: '60px 24px' }}>
                <StoryDetail 
                  story={{ ...(selectedStory || categorizedStories[0]), onSelectArticle: (art) => { setScrollPos(window.scrollY); setSelectedArticle(art); navigate(`/article/${art.id}`); } }} 
                  isFavorite={favorites.some(f => f.id === (selectedStory?.id || categorizedStories[0].id))}
                  onToggleFavorite={() => toggleFavorite(selectedStory || categorizedStories[0])}
                  onShare={() => openShare(selectedStory || categorizedStories[0])}
                  onBack={() => navigate('/')}
                  activeFilter={activeStoryFilter} setActiveFilter={setActiveStoryFilter}
                  activeTab={activeStoryTab} setActiveTab={setActiveStoryTab}
                />
            </div>
          } />
          <Route path="/article/:id" element={
            <div className="container" style={{ padding: '60px 24px' }}>
              <StoryReader article={selectedArticle || categorizedStories[0].articles[0]} onBack={() => { navigate(-1); setTimeout(() => window.scrollTo(0, scrollPos), 50); }} />
            </div>
          } />
          <Route path="/company" element={<CorporateLanding type="COMPANY" onBack={() => navigate('/')} />} />
          <Route path="/help" element={<CorporateLanding type="HELP" onBack={() => navigate('/')} />} />
        </Routes>
      </main>
      <Footer />
      <ShareModal 
        isOpen={shareConfig.isOpen} 
        onClose={() => setShareConfig({ isOpen: false, story: null })} 
        storyTitle={shareConfig.story?.title}
        storyUrl={shareConfig.story ? `${window.location.origin}/story/${shareConfig.story.id}` : ''}
      />
    </div>
  );
};

export default App;
