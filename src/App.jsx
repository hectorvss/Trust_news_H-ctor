import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import './index.css';
import Navbar from './components/layout/Navbar';
import TrendingBar from './components/layout/TrendingBar';
import Hero from './components/layout/Hero';
import NewsFeed from './components/layout/NewsFeed';
import Sidebar from './components/sidebar/Sidebar';
import SpecialSection from './components/layout/SpecialSection';
import Account from './components/Account';
import CorporateLanding from './components/CorporateLanding';
import StoryDetail from './components/StoryDetail';
import StoryReader from './components/StoryReader';
import ManagerStudio from './components/ManagerStudio';
import ShareModal from './components/ShareModal';
import Footer from './components/Footer';
import { useAuth } from './context/AuthContext';
import { 
  getFavorites, 
  addFavorite, 
  removeFavorite, 
  logReading, 
  fetchStories, 
  fetchStoryById, 
  fetchAppConfig,
  getUsageMetrics,
  pingUsage,
  fetchSpecialSections
} from './supabaseService';
import AccessLimitModal from './components/AccessLimitModal';

// Anonymous favorites persistence (localStorage)
const ANON_FAVS_KEY = 'tne_anon_favorites';
const getAnonFavorites = () => { try { return JSON.parse(localStorage.getItem(ANON_FAVS_KEY) || '[]'); } catch { return []; } };
const saveAnonFavorites = (favs) => localStorage.setItem(ANON_FAVS_KEY, JSON.stringify(favs));
const clearAnonFavorites = () => localStorage.removeItem(ANON_FAVS_KEY);

const Plus = () => <span style={{ fontSize: '14px', opacity: 0.3, fontWeight: 700, display: 'inline-flex', alignItems: 'center', marginLeft: '4px', lineHeight: 1 }}>+</span>;

const App = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut, loading: authLoading } = useAuth();

  const [selectedStory, setSelectedStory] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [scrollPos, setScrollPos] = useState(0);
  const [forYouMode, setForYouMode] = useState(false);

  const [activeCategory, setActiveCategory] = useState('TODO');
  const [activeStoryFilter, setActiveStoryFilter] = useState('TODO');
  const [activeStoryTab, setActiveStoryTab] = useState('RESUMEN');
  const [showForYou, setShowForYou] = useState(false);
  const [visibleStories, setVisibleStories] = useState(20);

  const [favorites, setFavorites] = useState([]);
  const favStoryIds = useMemo(() => new Set(favorites.map(f => String(f.story_id || f.id))), [favorites]);
  const [shareConfig, setShareConfig] = useState({ isOpen: false, story: null });

  // Access & Usage Limits
  const [usageMetrics, setUsageMetrics] = useState({ articles_read: 0, reading_seconds: 0, read_article_ids: [] });
  const [accessModal, setAccessModal] = useState({ isOpen: false, mode: 'LIMIT' });
  const isPremium = profile?.subscription_tier === 'premium' || profile?.role === 'manager' || profile?.role === 'admin_editor';
  
  // Track Reading Time
  useEffect(() => {
    // Only track if there is a selected story/article and user is NOT premium
    // Actually, we can track usage for premium too to have data, but let's focus on enforcing free bounds
    if (!selectedStory && !selectedArticle) return;
    
    let activeStoryId = selectedArticle ? selectedArticle.id : (selectedStory ? selectedStory.id : null);
    
    // Check limit before tracking
    if (!isPremium && user && (usageMetrics.articles_read >= 3 || usageMetrics.reading_seconds >= 600)) {
      setAccessModal({ isOpen: true, mode: 'LIMIT' });
      return;
    }
    
    // If not authenticated and trying to read, we block tracking entirely since they are blocked
    if (!user) return;

    const interval = setInterval(async () => {
      // log 10 seconds of reading
      if (document.visibilityState === 'visible') {
        const biasCategory = selectedArticle ? selectedArticle.bias : null;
        const sourceName = selectedArticle ? selectedArticle.source : (selectedStory ? 'TNE Editorial' : null);
        
        pingUsage(user?.id, activeStoryId, 10, biasCategory, sourceName);
        setUsageMetrics(prev => ({
          ...prev,
          reading_seconds: prev.reading_seconds + 10
        }));
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [selectedStory, selectedArticle, user, isPremium, usageMetrics]);

  // Sync Usage Metrics and Limits
  useEffect(() => {
    getUsageMetrics(user?.id).then(data => {
      if (data) {
        setUsageMetrics(data);
        if (user && !isPremium && (data.articles_read >= 3 || data.reading_seconds >= 600)) {
          // If already reading something, show modal
          if (selectedStory || selectedArticle) {
            setAccessModal({ isOpen: true, mode: 'LIMIT' });
          }
        }
      }
    });
  }, [user, isPremium, selectedStory, selectedArticle]);


  // Dynamic Data State - loaded from Supabase only
  const [stories, setStories] = useState([]);
  const [appConfig, setAppConfig] = useState({ trending_topics: [], global_headlines: [] });
  const [storiesLoading, setStoriesLoading] = useState(true);
  const [specialSections, setSpecialSections] = useState([]);

  // Load Initial App Config + Special Sections
  useEffect(() => {
    fetchAppConfig().then(config => {
      if (config) setAppConfig(config);
    });
    fetchSpecialSections().then(sections => {
      if (sections && sections.length > 0) setSpecialSections(sections);
    });
  }, []);

  const refreshStories = useCallback(() => {
    setStoriesLoading(true);
    fetchStories(activeCategory).then(data => {
      setStories(data || []);
      setStoriesLoading(false);
    }).catch(err => {
      console.error('Error in App refreshStories:', err);
      setStoriesLoading(false);
    });
  }, [activeCategory]);

  useEffect(() => {
    refreshStories();
  }, [refreshStories]);

  // Deep-link: fetch story by ID when navigating directly to /story/:id
  useEffect(() => {
    const isStoryPath = location.pathname.match(/^\/story\/(.+)$/);
    const isArticlePath = location.pathname.match(/^\/article\/(.+)$/);
    
    if (isStoryPath || isArticlePath) {
      if (!authLoading && !user) {
        setAccessModal({ isOpen: true, mode: 'AUTH' });
      }

      const match = isStoryPath;
      if (match && match[1] !== 'new') {
        const storyId = match[1];
        if (!selectedStory || String(selectedStory.id) !== storyId) {
          fetchStoryById(storyId).then(story => {
            if (story) setSelectedStory(story);
          });
        }
      }
    }
  }, [location.pathname, user, authLoading]);

  // Load favorites: Supabase for authenticated users, localStorage for anonymous
  useEffect(() => {
    if (user) {
      const mergeAndLoad = async () => {
        // Merge any anonymous favorites into Supabase
        const anonFavs = getAnonFavorites();
        if (anonFavs.length > 0) {
          for (const fav of anonFavs) {
            await addFavorite(user.id, fav);
          }
          clearAnonFavorites();
        }
        const favs = await getFavorites(user.id);
        setFavorites(favs || []);
      };
      mergeAndLoad();
    } else {
      setFavorites(getAnonFavorites());
    }
  }, [user]);

  const openShare = (story) => {
    setShareConfig({ isOpen: true, story });
  };

  const toggleFavorite = async (story) => {
    if (!story) return;
    const storyId = String(story.id || story.story_id);
    const isFav = favStoryIds.has(storyId);

    if (!user) {
      // Anonymous: persist to localStorage
      setFavorites(prev => {
        let next;
        if (isFav) {
          next = prev.filter(f => String(f.story_id || f.id) !== storyId);
        } else {
          next = [{ ...story, story_id: storyId, id: storyId, story_title: story.title, story_image: story.image, story_category: story.location || story.category }, ...prev];
        }
        saveAnonFavorites(next);
        return next;
      });
      return;
    }

    // Authenticated: Supabase-backed toggle
    if (isFav) {
      await removeFavorite(user.id, storyId);
      setFavorites(prev => prev.filter(f => String(f.story_id || f.id) !== storyId));
    } else {
      const newFav = await addFavorite(user.id, story);
      if (newFav) {
        setFavorites(prev => [{ ...story, ...newFav, id: newFav.story_id, story_id: newFav.story_id }, ...prev]);
      }
    }
  };

  const onSelectStory = async (story) => {
    const storyId = story.id || story.story_id;
    
    // AUTH check for anonymous users
    if (!user) {
      setAccessModal({ isOpen: true, mode: 'AUTH' });
      return; // block navigation completely
    }

    // Enforce Access Base Check for FREE users
    if (!isPremium) {
       // If they click a new story and they are out of limits (and hadn't read this one yet)
       const hasReadThis = usageMetrics.read_article_ids.includes(String(storyId));
       if (!hasReadThis && (usageMetrics.articles_read >= 3 || usageMetrics.reading_seconds >= 600)) {
         setAccessModal({ isOpen: true, mode: 'LIMIT' });
         return; // block navigation
       }
    }

    // Ping usage (if it's new it adds to articles_read)
    pingUsage(user?.id, storyId, 0).then(() => {
       getUsageMetrics(user?.id).then(setUsageMetrics);
    });
    
    if (!story.fullContent) {
      const existing = stories.find(s => String(s.id) === String(storyId));
      if (existing && existing.fullContent) {
        setSelectedStory(existing);
      } else {
        const full = await fetchStoryById(storyId);
        setSelectedStory(full || existing || story);
      }
    } else {
      setSelectedStory(story);
    }
    navigate(`/story/${storyId}`);
  };

  const categories = ['TODO', 'PARA TI', 'POLÍTICA', 'FINANZAS', 'SOCIAL', 'TECNOLOGÍA', 'DEPORTE', 'CULTURA', 'INTERNACIONAL'];

  // Stories from Supabase (single source of truth)
  const searchParams = new URLSearchParams(location.search);
  const activeCity = searchParams.get('city');
  const activeTopic = searchParams.get('topic');

  const rawSource = stories;
  let finalStories = activeCategory === 'TODO' 
    ? rawSource 
    : (activeCategory === 'PARA_TI' || activeCategory === 'PARA TI'
        ? rawSource.filter(s => s.category && ['FINANZAS', 'TECNOLOGÍA', 'POLÍTICA'].includes(s.category.toUpperCase()))
        : rawSource.filter(s => s.category && s.category.toUpperCase() === activeCategory.toUpperCase()));

  if (activeCity) {
    const term = activeCity.toLowerCase();
    finalStories = finalStories.filter(s => (s.location && s.location.toLowerCase().includes(term)) || (s.title && s.title.toLowerCase().includes(term)));
  }
  
  if (activeTopic) {
    const term = activeTopic.toLowerCase();
    finalStories = finalStories.filter(s => 
      (s.title && s.title.toLowerCase().includes(term)) || 
      (s.summary && s.summary.toLowerCase().includes(term)) ||
      (s.category && s.category.toLowerCase().includes(term))
    );
  }
        
  const displayStories = finalStories.slice(0, visibleStories);
  
  // Robust Defaults for Trending
  const trendingTopics = (appConfig.trending_topics || []).length > 5 
    ? appConfig.trending_topics 
    : ["Ley de Vivienda", "FMI España", "Crisis Alquiler", "Reforma Mordaza", "Elecciones Hungría", "Inteligencia Artificial", "Energía Solar", "BCE", "Sánchez", "Mercado"];
    
  const globalHeadlines = (appConfig.global_headlines || []).length > 0 
    ? appConfig.global_headlines 
    : [
        { t: "España aprueba la nueva ley de paridad en órganos constitucionales.", w: "70%" },
        { t: "La inflación en la eurozona cae al 2.4%, abriendo puerta a bajada de tipos.", w: "35%" }
      ];

  const blindSpotsData = (appConfig.blind_spots || []).length > 0 
    ? appConfig.blind_spots 
    : [
        { type: 'LEFT', text: 'El aumento de los costes sanitarios en las zonas rurales suele ser ignorado por los medios de comunicación progresistas.' },
        { type: 'RIGHT', text: 'Los indicadores económicos positivos de las reformas laborales no suelen aparecer en los medios conservadores.' }
      ];

// Components extracted to separate files

  if (authLoading) return <div className="loading-overlay" style={{ background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '2px' }}>CONECTANDO CON TNE CLOUD...</div>;

  return (
    <div className="app">
      <Helmet>
        <title>TNE — Trust News España | Periodismo Transparente</title>
        <meta name="description" content="La plataforma de noticias que analiza el sesgo mediático y te ofrece una visión completa de la actualidad en España." />
        <meta name="keywords" content="noticias, españa, sesgo mediático, periodismo, transparencia, actualidad" />
      </Helmet>
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
      <Navbar 
        navigate={navigate} 
        user={user} 
        profile={profile} 
        signOut={signOut} 
        activeCategory={activeCategory} 
        setActiveCategory={setActiveCategory} 
        setSelectedStory={setSelectedStory} 
        showForYou={showForYou} 
        setShowForYou={setShowForYou} 
        categories={categories} 
      />
      <main style={{ marginTop: '72px', minHeight: '100vh', background: 'white' }}>
        <Routes>
          <Route path="/" element={
            <>
              {/* Launch Offer Banner */}
              <div style={{ background: 'black', color: 'white', padding: '8px var(--page-padding)', textAlign: 'center', fontSize: '11px', fontWeight: 800, letterSpacing: '2px', fontFamily: 'var(--font-mono)', borderBottom: 'var(--border-thin)' }}>
                OFERTA DE LANZAMIENTO: 1€ POR SEMANA • <span onClick={() => navigate('/company?section=suscripciones')} style={{ textDecoration: 'underline', cursor: 'pointer' }}>OBTÉN EL DESCUENTO ↗</span>
              </div>

              {/* Active Category/Filter Indicator */}
              {(activeCategory !== 'TODO' || activeCity || activeTopic) && (
                <div style={{ padding: '20px var(--page-padding)', borderBottom: 'var(--border-thin)', background: 'black', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                    FILTRO: {activeCategory !== 'TODO' ? activeCategory : ''} {activeCity ? `CIUDAD: ${activeCity}` : ''} {activeTopic ? `TEMA: ${activeTopic}` : ''}
                  </span>
                  <span onClick={() => { setActiveCategory('TODO'); navigate('/'); }} style={{ cursor: 'pointer', fontSize: '11px', fontWeight: 700 }}>REINICIAR FILTRO ✕</span>
                </div>
              )}

              {/* Trending Topics Bar - Grab & Slide */}
              <TrendingBar 
                navigate={navigate} 
                trendingTopics={trendingTopics} 
                activeTopic={activeTopic} 
              />

              {/* Hero Section */}
              <Hero 
                activeCategory={activeCategory} 
                activeCity={activeCity} 
                activeTopic={activeTopic} 
              />

              {/* Content Split */}
              <section className="layout-split">
                <Sidebar 
                  navigate={navigate} 
                  globalHeadlines={globalHeadlines} 
                  favoritesCount={favorites.length} 
                  blindSpotsData={blindSpotsData} 
                  relatedTopics={(appConfig.related_topics?.length > 0) ? appConfig.related_topics : ['POLÍTICA FISCAL', 'IBEX 35', 'ENERGÍA VERDE', 'OTAN', 'STARTUPS', 'MUSEO DEL PRADO']} 
                  activeTopic={activeTopic} 
                  loading={storiesLoading}
                />

                <NewsFeed 
                  storiesLoading={storiesLoading} 
                  displayStories={displayStories} 
                  stories={stories} 
                  onSelectStory={onSelectStory} 
                  favStoryIds={favStoryIds} 
                  toggleFavorite={toggleFavorite} 
                  openShare={openShare} 
                  visibleStories={visibleStories} 
                  finalStoriesCount={finalStories.length} 
                  setVisibleStories={setVisibleStories} 
                />
              </section>

              {/* SPECIAL SECTIONS GRID SYSTEM — powered by Supabase special_sections table */}
              {/* Special Sections Selector - Dynamic + Fallback Merge */}
              {(() => {
                const hardcoded = [
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
                      barType: 'grayscale',
                      story_id: 'tregua-gaza-2024'
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
                      barType: 'grayscale',
                      story_id: 'ley-vivienda-2024'
                    },
                    sides: [
                      { label: 'ALEMANIA', title: 'Berlín aprueba el paquete de defensa más grande desde la Guerra Fría.', meta: 'COBERTURA CENTRISTA' },
                      { label: 'POLONIA', title: 'Tusk lidera el desbloqueo de fondos europeos tras reformas judiciales.', meta: 'NOTICIA DESTACADA' },
                      { label: 'HUNGRÍA', title: 'Orbán critica la centralización de Bruselas en vísperas de las elecciones.', meta: 'SESGO DE DERECHA' }
                    ]
                  }
                ];

                // combined starts with DB sections, fills with hardcoded ones to maintain density
                const combined = [...specialSections];
                hardcoded.forEach(h => {
                  if (combined.length < 4 && !combined.find(s => s.title === h.title)) {
                    combined.push(h);
                  }
                });

                return combined.map((section, idx) => (
                  <SpecialSection 
                    key={section.id || section.title} 
                    idx={idx} 
                    section={section} 
                    stories={stories} 
                    onSelectStory={onSelectStory} 
                    navigate={navigate} 
                  />
                ));
              })()}

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
                onSelectStory={onSelectStory}
              />
            </div>
          } />
          <Route path="/bias" element={<BiasAnalysis onBack={() => navigate('/')} />} />
          <Route path="/story/:id" element={
            <div className="container route-container" style={{ padding: '60px 24px', background: 'white' }}>
                {(() => {
                  const storyId = location.pathname.split('/').pop();
                  let currentStory = selectedStory || finalStories.find(s => String(s.id) === storyId);
                  
                  if (!currentStory || (storiesLoading && !currentStory.title)) {
                    return (
                      <div style={{ padding: '20vh 0', textAlign: 'center', fontFamily: 'var(--font-mono)', background: 'white', minHeight: '80vh' }}>
                         <h2 style={{ fontSize: '12px', opacity: 0.3 }}>IDENTIFICANDO NOTICIA...</h2>
                      </div>
                    );
                  }

                  // PHYSICAL BLOCK: If modal is open for AUTH or LIMIT, do NOT render the story
                  if (accessModal.isOpen) {
                    return <div style={{ minHeight: '80vh' }} />;
                  }

                  return (
                    <StoryDetail 
                      story={location.pathname === '/story/new' ? { category: 'POLÍTICA', bias: { left: 33, center: 34, right: 33 }, articles: [] } : currentStory} 
                      isFavorite={favStoryIds.has(String(currentStory.id))}
                      onToggleFavorite={() => toggleFavorite(currentStory)}
                      onShare={() => openShare(currentStory)}
                      onBack={() => navigate('/')}
                      onRefresh={refreshStories}
                      setSelectedStory={setSelectedStory}
                      onSelectArticle={setSelectedArticle}
                      activeFilter={activeStoryFilter} setActiveFilter={setActiveStoryFilter}
                      activeTab={activeStoryTab} setActiveTab={setActiveStoryTab}
                      userRole={profile?.role || (user?.email === 'hectorvidal0411@gmail.com' ? 'manager' : 'reader')}
                    />
                  );
                })()}
            </div>
          } />
          <Route path="/article/:id" element={
            <div className="container" style={{ padding: '60px 24px' }}>
              {(() => {
                const articleId = location.pathname.split('/').pop();
                const currentArticle = selectedArticle || (selectedStory?.articles?.[articleId]) || null;
                
                if (!currentArticle) {
                  return (
                    <div style={{ padding: '100px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                      <h2 style={{ fontSize: '12px', opacity: 0.3 }}>CARGANDO ARTÍCULO...</h2>
                    </div>
                  );
                }

                if (accessModal.isOpen) {
                    return <div style={{ minHeight: '80vh' }} />;
                }
                
                return (
                  <StoryReader 
                    article={currentArticle} 
                    onBack={() => { navigate(-1); setTimeout(() => window.scrollTo(0, scrollPos), 50); }} 
                  />
                );
              })()}
            </div>
          } />
          <Route path="/account" element={<Account user={user} profile={profile} onBack={() => navigate('/')} />} />
          <Route path="/manager" element={<ManagerStudio user={user} profile={profile} stories={finalStories} onBack={() => navigate('/')} onRefresh={refreshStories} />} />
          <Route path="/company" element={<CorporateLanding type="COMPANY" onBack={() => navigate('/')} />} />
          <Route path="/help" element={<CorporateLanding type="HELP" onBack={() => navigate('/')} />} />
          <Route path="/tools" element={<CorporateLanding type="TOOLS" onBack={() => navigate('/')} />} />
          <Route path="/terms" element={<CorporateLanding type="TERMS" onBack={() => navigate('/')} />} />
          <Route path="/privacy" element={<CorporateLanding type="PRIVACY" onBack={() => navigate('/')} />} />
          <Route path="/pricing" element={<CorporateLanding type="COMPANY" onBack={() => navigate('/')} />} />
        </Routes>
      </main>
      <Footer links={appConfig.footer_links} />
      <ShareModal 
        isOpen={shareConfig.isOpen} 
        onClose={() => setShareConfig({ isOpen: false, story: null })} 
        storyTitle={shareConfig.story?.title}
        storyUrl={shareConfig.story ? `${window.location.origin}/story/${shareConfig.story.id}` : ''}
      />
      
      <AccessLimitModal 
        isOpen={accessModal.isOpen} 
        mode={accessModal.mode}
        onClose={(goHome) => { 
          setAccessModal((prev) => ({ ...prev, isOpen: false })); 
          if (goHome) {
            navigate('/'); 
            setSelectedStory(null); 
            setSelectedArticle(null); 
          }
        }}
        currentPlan={profile?.subscription_tier?.toUpperCase() || 'FREE'}
      />
    </div>
  );
};

export default App;
