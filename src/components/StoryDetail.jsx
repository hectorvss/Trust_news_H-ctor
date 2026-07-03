import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import BiasBar from './BiasBar';
import ShareModal from './ShareModal';
import Plus from './ui/Plus';
import ToddyChatPanel from './ToddyChatPanel';
import ToddyFloatingLauncher from './ToddyFloatingLauncher';
import { saveStory, buildSourceIndex } from '../supabaseService';
import { CoverageDetails, SourceTag, SourceLogo, toBucket, MiniBiasBar } from './coverage';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { normalizeCategory } from '../supabaseService';

const InlineEdit = ({ text, onChange, isEditing, tag = 'span', style = {}, multiline = false, placeholder = 'Añadir texto...' }) => {
  if (!isEditing) {
    if (!text && !isEditing) return null;
    return React.createElement(tag, { style: { ...style, whiteSpace: multiline ? 'pre-wrap' : 'normal' } }, text);
  }
  
  if (multiline) {
    return <textarea 
      value={text || ''} 
      onChange={e => onChange(e.target.value)} 
      placeholder={placeholder}
      style={{ 
        ...style, 
        background: 'rgba(0,0,0,0.03)', 
        border: '1px dashed #ccc', 
        width: '100%', 
        minHeight: '80px', 
        padding: '8px', 
        resize: 'vertical',
        outline: 'none',
        fontFamily: 'inherit',
        fontSize: 'inherit',
        fontWeight: 'inherit',
        lineHeight: 'inherit',
        letterSpacing: 'inherit',
        color: 'inherit',
      }} 
    />;
  }
  
  return <input 
    type="text" 
    value={text || ''} 
    onChange={e => onChange(e.target.value)} 
    placeholder={placeholder}
    style={{ 
      ...style, 
      background: 'rgba(0,0,0,0.03)', 
      border: '1px dashed #ccc', 
      width: '100%', 
      padding: '4px 8px', 
      outline: 'none',
      fontFamily: 'inherit',
      fontSize: 'inherit',
      fontWeight: 'inherit',
      lineHeight: 'inherit',
      letterSpacing: 'inherit',
      color: 'inherit'
    }} 
  />;
};

const InlineSelect = ({ text, onChange, options, isEditing, style = {} }) => {
   if(!isEditing) return <span style={style}>{text}</span>;
   return (
     <select 
       value={text || ''} 
       onChange={e => onChange(e.target.value)}
       style={{ 
         ...style,
         background: 'rgba(0,0,0,0.03)', border: '1px dashed #ccc', outline: 'none',
         fontFamily: 'inherit', fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit'
       }}
     >
       {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
     </select>
   );
};

const StoryDetail = ({ story, onBack, onRefresh, setSelectedStory, onSelectArticle, activeFilter, setActiveFilter, activeTab, setActiveTab, isFavorite, onToggleFavorite, onShare, userRole }) => {
  const navigate = useNavigate();
  const { isMobile, isTablet } = useBreakpoint();
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(!story || !story.id); // Default to editing if it's a new story
  const [editedStory, setEditedStory] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [infoSubTab, setInfoSubTab] = useState('GENERAL');
  const [showManagerBar, setShowManagerBar] = useState(true);
  const [showToddy, setShowToddy] = useState(false);
  const [sourceIndex, setSourceIndex] = useState({});
  const [coverageView, setCoverageView] = useState('COMPARE'); // LEFT | CENTER | RIGHT | COMPARE

  useEffect(() => {
    setEditedStory(story || {});
    if(!story || !story.id) setIsEditing(true);
  }, [story]);

  // Load the source catalog once to enrich articles with bias/factuality/ownership
  useEffect(() => {
    buildSourceIndex().then(setSourceIndex).catch(() => {});
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
     setIsSaving(true);
     const isNew = !editedStory.id;
     const response = await saveStory(editedStory);
     if (response) {
       setEditedStory(response);
       if (setSelectedStory) setSelectedStory(response);
       setIsEditing(false);
       if (onRefresh) onRefresh();
       if (isNew && response.id) {
         navigate(`/story/${response.id}`, { replace: true });
       }
     }
     setIsSaving(false);
  };

  const handleImportJSON = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      const parsed = JSON.parse(clipboardText);
      if (parsed && typeof parsed === 'object') {
        if(window.confirm('Válido JSON detectado en el portapapeles. ¿Deseas sobreescribir la historia actual?')) {
          setEditedStory(parsed);
          return;
        }
      }
    } catch(err) {
      // Ignore clipboard error and fallback to prompt
    }
    
    const val = prompt('Pega el JSON completo de la historia aquí. Advertencia: esto sobreescribirá todos los campos actuales.');
    if (val) {
       try {
         const parsed = JSON.parse(val);
         setEditedStory(parsed);
       } catch(e) {
         alert('El formato JSON insertado no es válido.');
       }
    }
  };

  if (!editedStory || Object.keys(editedStory).length === 0) return null;

  // Enrich each article with catalog data (bias rating, factuality, ownership, logo)
  const enrichArticle = (art) => {
    const cat = sourceIndex[(art.source || '').toLowerCase()] || null;
    const biasRating = cat?.biasRating || art.bias || 'CENTER';
    return {
      ...art,
      readerContent: art.readerContent,
      title: art.title || editedStory.title || 'Título provisorio',
      _src: cat,
      name: art.source,
      domain: cat?.domain || null,
      logoUrl: cat?.logoUrl || null,
      biasRating,
      _bucket: toBucket(biasRating),
      factuality: cat?.factuality || null,
      ownershipCategory: cat?.ownershipCategory || null
    };
  };

  const allArticles = (editedStory.articles || []).map(enrichArticle);

  const filteredArticles = activeFilter === 'TODO'
    ? allArticles
    : allArticles.filter(art => art._bucket === activeFilter);

  // Derive a coverage object: prefer DB-computed columns, else compute on the fly
  const computeClientCoverage = () => {
    const counts = { LEFT: 0, CENTER: 0, RIGHT: 0 };
    const fact = {};
    const own = {};
    allArticles.forEach(a => {
      counts[a._bucket] = (counts[a._bucket] || 0) + 1;
      const f = a.factuality || 'UNKNOWN'; fact[f] = (fact[f] || 0) + 1;
      const o = a.ownershipCategory || 'UNKNOWN'; own[o] = (own[o] || 0) + 1;
    });
    const total = allArticles.length;
    const pct = n => (total > 0 ? Math.round((n * 100) / total) : 0);
    const maxKey = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
    return {
      totalSources: total,
      leaningLeft: counts.LEFT, leaningCenter: counts.CENTER, leaningRight: counts.RIGHT,
      biasDistribution: { left: pct(counts.LEFT), center: pct(counts.CENTER), right: pct(counts.RIGHT) },
      factualityBreakdown: fact,
      ownershipBreakdown: own,
      dominantLean: total > 0 ? maxKey : null,
      dominantLeanPct: total > 0 ? pct(counts[maxKey] || 0) : 0,
      coverageUpdatedAt: editedStory.coverageUpdatedAt || editedStory.updated_at || null
    };
  };

  // Prefer real pipeline coverage (coverage_left/center/right via mapStory);
  // fall back to computing from the enriched article list whenever the DB
  // breakdown is missing or empty, so the bias widgets still populate.
  const _db = editedStory.biasDistribution || null;
  const _dbHasCoverage = !!_db && (editedStory.totalSources || 0) > 0 &&
    ((_db.left || 0) + (_db.center || 0) + (_db.right || 0)) > 0;
  const coverageStory = _dbHasCoverage ? editedStory : computeClientCoverage();

  // Sources list for the bias distribution logos. Each entry keeps its index
  // into allArticles so clicking a logo can open that exact article, the same
  // way clicking an article card does.
  const coverageSources = allArticles.map((a, i) => ({
    id: a._src?.id || a.source,
    name: a.source,
    domain: a.domain,
    logoUrl: a.logoUrl,
    biasRating: a.biasRating,
    _articleIndex: i
  }));

  // Clicking a source logo in Coverage Details opens its article exactly like
  // clicking the article card does: it never dead-ends, since selectedArticle
  // is the object StoryReader actually reads (the URL index is only a fallback).
  const handleCoverageSourceClick = (source) => {
    if (isEditing) return;
    const article = allArticles[source._articleIndex];
    if (!article) return;
    onSelectArticle(article);
    navigate(`/article/${source._articleIndex}`);
  };

  const updateStory = (key, val) => {
    setEditedStory(prev => ({ ...prev, [key]: val }));
  };

  const isManager = userRole === 'manager' || userRole === 'admin_editor';

  return (
    <div className="story-detail-overlay" style={{
      position: 'fixed', top: '72px', left: 0, right: 0, bottom: 0,
      background: 'white', zIndex: 2000, overflowY: 'auto', boxSizing: 'border-box',
      animation: 'fadeIn 0.3s ease-out'
    }}>
      <Helmet>
        <title>{editedStory?.title || 'Noticia'} | TNE</title>
        <meta name="description" content={editedStory?.summary || 'Lee la cobertura completa de esta noticia en Trust News España.'} />
      </Helmet>
      <div style={{ maxWidth: 'var(--content-width)', margin: '0 auto', padding: isMobile ? '16px 16px 48px' : isTablet ? '24px 24px 56px' : '32px 32px 72px' }}>
      
      {/* MANAGER FLOATING SAVE BAR */}
      {isManager && showManagerBar && (
         <div style={{ position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)', background: 'black', color: 'white', padding: '16px 32px', borderRadius: '100px', display: 'flex', gap: '24px', alignItems: 'center', zIndex: 1000, boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}>
           <div style={{ fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>MODO EDICIÓN</div>
           
           <div 
             onClick={() => setIsEditing(!isEditing)} 
             style={{
               display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '6px 16px',
               background: isEditing ? 'white' : 'transparent', 
               color: isEditing ? 'black' : 'white',
               border: '1px solid white', borderRadius: '100px', 
               fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)', transition: 'background-color 0.2s, color 0.2s'
             }}
           >
             <div style={{ 
               width: '6px', height: '6px', borderRadius: '50%', background: isEditing ? '#000' : '#444', marginRight: '8px',
               boxShadow: isEditing ? '0 0 0 2px rgba(0,0,0,0.2)' : 'none' 
             }} />
             {isEditing ? 'ACTIVO' : 'INACTIVO'}
           </div>

           {isEditing && (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', borderLeft: '1px solid #333', paddingLeft: '24px' }}>
                <button onClick={handleImportJSON} style={{ padding: '8px 16px', background: 'transparent', color: 'white', border: '1px dashed #555', borderRadius: '100px', fontSize: '10px', fontWeight: 800, fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>
                  {'{...} PEGAR JSON'}
                </button>
                <button disabled={isSaving} onClick={handleSave} style={{ padding: '8px 24px', background: 'white', color: 'black', border: 'none', borderRadius: '100px', fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>
                  {isSaving ? 'GUARDANDO...' : 'GUARDAR'}
                </button>
              </div>
           )}

           <div 
             onClick={() => { setIsEditing(false); setShowManagerBar(false); }} 
             style={{ marginLeft: isEditing ? '0' : '12px', cursor: 'pointer', opacity: 0.5, fontSize: '12px', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
             title="Cerrar modo edición"
           >
             ✖
           </div>
         </div>
      )}

      {/* 1. PRIMARY INTELLIGENCE INDICATORS (TOP HEADER) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', flexWrap: 'wrap', gap: '16px', marginBottom: isMobile ? '24px' : '32px', borderBottom: 'var(--border-thin)', paddingBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', minWidth: 0 }}>
          <span onClick={onBack} style={{ cursor: 'pointer', fontSize: '13px', fontWeight: 900, fontFamily: 'var(--font-mono)', marginRight: isMobile ? '8px' : '24px', whiteSpace: 'nowrap' }}>← REGRESAR</span>
          
          <div style={{ padding: isMobile ? '8px 12px' : '8px 20px', background: '#f5f5f5', borderRadius: '4px', fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', display: 'flex', gap: '8px' }}>
            <span style={{ opacity: 0.3 }}>SECCIÓN:</span>
            <InlineSelect text={normalizeCategory(editedStory.category || 'POLÍTICA')} options={['POLÍTICA', 'ECONOMÍA', 'SOCIEDAD', 'TECNOLOGÍA', 'DEPORTES', 'CULTURA', 'INTERNACIONAL', 'MEDIO AMBIENTE', 'CIENCIA', 'SUCESOS', 'VIVIENDA']} onChange={v => updateStory('category', v)} isEditing={isEditing} />
          </div>
          <div style={{ padding: isMobile ? '8px 12px' : '8px 20px', background: '#f5f5f5', borderRadius: '4px', fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', display: 'flex', gap: '8px' }}>
            <span style={{ opacity: 0.3 }}>FACTUALIDAD:</span>
            <InlineSelect text={editedStory.factuality || 'ALTA'} options={['ALTA', 'MIXTA', 'BAJA']} onChange={v => updateStory('factuality', v)} isEditing={isEditing} />
          </div>
          <div style={{ padding: isMobile ? '8px 12px' : '8px 20px', background: '#f5f5f5', borderRadius: '4px', fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', display: 'flex', gap: '8px' }}>
            <span style={{ opacity: 0.3 }}>CONSENSO:</span>
            <InlineSelect text={editedStory.consensus || 'MEDIO'} options={['ALTO', 'MEDIO', 'BAJO', 'POLARIZADO']} onChange={v => updateStory('consensus', v)} isEditing={isEditing} />
          </div>
          <div style={{ padding: isMobile ? '8px 12px' : '8px 20px', background: '#f5f5f5', borderRadius: '4px', fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', display: 'flex', gap: '8px' }}>
            <span style={{ opacity: 0.3 }}>IMPACTO:</span>
            <InlineSelect text={editedStory.impact || 'ALTO'} options={['ALTO', 'MEDIO', 'BAJO']} onChange={v => updateStory('impact', v)} isEditing={isEditing} />
          </div>

        </div>
        
        <div style={{ display: 'flex', gap: isMobile ? '14px' : '20px', alignItems: 'center', alignSelf: isMobile ? 'flex-end' : 'center' }}>
          {copied && (
            <span style={{ fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)', marginRight: '-8px', animation: 'fadeInOut 2s forwards', letterSpacing: '1px' }}>
              ENLACE COPIADO
            </span>
          )}

          {!isEditing && (editedStory.status || 'published') === 'published' && (
            <button
              onClick={(e) => { e.stopPropagation(); setShowToddy(true); }}
              style={{
                border: '1px solid #111',
                background: '#111',
                color: '#fff',
                padding: isMobile ? '9px 10px' : '10px 14px',
                fontSize: '11px',
                fontWeight: 900,
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                letterSpacing: '0'
              }}
            >
              PREGUNTAR A TODDY
            </button>
          )}
          
          {/* 1. HEART ICON (Like) */}
          <svg 
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
            style={{ cursor: 'pointer', transition: '0.2s', fill: isFavorite ? '#000' : 'none', color: isFavorite ? '#000' : 'currentColor', opacity: isFavorite ? 1 : 0.4 }} 
            onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
            onMouseLeave={(e) => { if(!isFavorite) e.currentTarget.style.opacity = 0.4; }}
            width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>

          {/* 2. LINK ICON */}
          <svg 
            onClick={handleCopy}
            style={{ opacity: 0.4, cursor: 'pointer', transition: '0.2s' }} 
            onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
            onMouseLeave={(e) => e.currentTarget.style.opacity = 0.4}
            width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
          </svg>

          {/* 3. SHARE BOX ICON */}
          <svg 
            onClick={(e) => { e.stopPropagation(); if(onShare) onShare(); }}
            style={{ opacity: 0.4, cursor: 'pointer', transition: '0.2s' }} 
            onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
            onMouseLeave={(e) => e.currentTarget.style.opacity = 0.4}
            width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
            <polyline points="16 6 12 2 8 6"></polyline>
            <line x1="12" y1="2" x2="12" y2="15"></line>
          </svg>
        </div>
      </div>

      <div className="layout-split" style={{ alignItems: 'flex-start', gap: isTablet ? '32px' : '60px' }}>
        
        {/* MAIN CONTENT AREA */}
        <div className="main-content" style={{ flex: '0 0 65%', padding: 0 }}>
          
          <h1 style={{ marginBottom: '32px' }}>
             <InlineEdit 
               text={editedStory.title} 
               onChange={v => updateStory('title', v)} 
               isEditing={isEditing} 
               placeholder="Escribe el Título de la Noticia..."
               style={{ fontSize: isMobile ? '40px' : isTablet ? '48px' : '56px', fontWeight: 800, letterSpacing: isMobile ? '-1.6px' : '-3.5px', lineHeight: '1.02', margin: 0, display: 'block' }}
             />
          </h1>

          {/* MINIMAL TABS navigation */}
          {(!isEditing || editedStory.title) && (
          <div style={{ display: 'flex', gap: '24px', borderBottom: 'var(--border-thin)', marginBottom: '40px', flexWrap: 'wrap' }}>
            {['RESUMEN', '+ INFO', 'CONTEXTO', 'IMPACTO', 'COBERTURA', 'DATOS', 'FUENTES', 'CLAVES'].map(t => (
              <div 
                key={t}
                onClick={() => setActiveTab(t)}
                style={{ 
                  padding: '16px 0', fontSize: '13px', fontWeight: 800, fontFamily: 'var(--font-mono)', cursor: 'pointer',
                  borderBottom: activeTab === t ? '2px solid black' : '1px solid transparent',
                  opacity: activeTab === t ? 1 : 0.4, transition: '0.2s', marginBottom: '-1px'
                }}
              >
                {t}
              </div>
            ))}
          </div>
          )}

          <div style={{ marginBottom: '60px' }}>
            {activeTab === 'RESUMEN' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                {/* PERSPECTIVA DE COBERTURA — Left/Center/Right/Comparación (read mode) */}
                {!isEditing && (editedStory.consensoNarrativo || '').trim() && (() => {
                  const narratives = (editedStory.consensoNarrativo || '').split('|');
                  const map = { LEFT: narratives[0], CENTER: narratives[1], RIGHT: narratives[2] };
                  const viewLabel = { LEFT: 'IZQUIERDA', CENTER: 'CENTRO', RIGHT: 'DERECHA', COMPARE: 'COMPARACIÓN' };
                  const toBullets = (txt) => (txt || '').split(/(?:\n|\.\s)/).map(s => s.trim()).filter(s => s.length > 4);
                  return (
                    <div style={{ border: 'var(--border-thin)', overflow: 'hidden' }}>
                      <div style={{ display: 'flex', borderBottom: 'var(--border-thin)' }}>
                        {['LEFT', 'CENTER', 'RIGHT', 'COMPARE'].map(v => (
                          <button
                            key={v}
                            onClick={() => setCoverageView(v)}
                            style={{
                              flex: 1, padding: '12px 8px', border: 'none', cursor: 'pointer',
                              fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '0.5px',
                              borderRight: v !== 'COMPARE' ? '1px solid #eee' : 'none',
                              background: coverageView === v ? '#000' : '#fff',
                              color: coverageView === v ? '#fff' : '#000', transition: '0.2s'
                            }}
                          >
                            {viewLabel[v]}
                          </button>
                        ))}
                      </div>
                      <div style={{ padding: '28px' }}>
                        {coverageView === 'COMPARE' ? (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                            {['LEFT', 'CENTER', 'RIGHT'].map(b => (
                              <div key={b} style={{ borderTop: `3px solid ${b === 'LEFT' ? '#000' : b === 'CENTER' ? '#888' : '#d8d8d8'}`, paddingTop: '14px' }}>
                                <div style={{ fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.4, marginBottom: '12px', letterSpacing: '1px' }}>{viewLabel[b]}</div>
                                <p style={{ fontSize: '13px', lineHeight: '1.5', margin: 0, fontWeight: 500 }}>{map[b] || 'Sin narrativa registrada para este lado.'}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {toBullets(map[coverageView]).length > 0 ? (
                              toBullets(map[coverageView]).map((line, idx) => (
                                <div key={idx} style={{ display: 'flex', gap: '14px', fontSize: '15px', lineHeight: '1.5', fontWeight: 500 }}>
                                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#000', marginTop: '7px', flexShrink: 0 }} />
                                  <span>{line}.</span>
                                </div>
                              ))
                            ) : (
                              <p style={{ fontSize: '14px', opacity: 0.4, margin: 0, fontFamily: 'var(--font-mono)' }}>Sin narrativa registrada para esta perspectiva.</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                <div>
                  <div style={{ fontSize: '10px', fontWeight: 900, opacity: 0.3, marginBottom: '24px', letterSpacing: '1px' }}>RESUMEN EJECUTIVO</div>
                  <div style={{ display: 'flex', gap: '24px', fontSize: '22px', lineHeight: '1.4', fontWeight: 600 }}>
                    <Plus /> 
                    <InlineEdit 
                       text={editedStory.summary || editedStory.fullContent?.split('\n')[0]} 
                       onChange={v => updateStory('summary', v)} 
                       isEditing={isEditing} 
                       multiline 
                       placeholder="Escribe el resumen ejecutivo..." 
                       style={{ margin: 0, flex: 1 }} 
                    />
                  </div>
                </div>

                <div>
                   <div style={{ fontSize: '10px', fontWeight: 900, opacity: 0.3, marginBottom: '24px', letterSpacing: '1px' }}>DESGLOSE DE INTELIGENCIA</div>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                     {isEditing ? (
                        <InlineEdit 
                            text={editedStory.desglose} 
                            onChange={v => updateStory('desglose', v)} 
                            isEditing={true} 
                            multiline 
                            placeholder="Desglose punto por punto..." 
                            style={{ fontSize: '17px', lineHeight: '1.6', fontWeight: 500 }} 
                        />
                     ) : (
                       (Array.isArray(editedStory.desglose) ? editedStory.desglose : (editedStory.desglose || '').split('\n')).filter(l => l && String(l).trim()).map((line, idx) => (
                         <div key={idx} style={{ display: 'flex', gap: '24px', fontSize: '17px', lineHeight: '1.6', fontWeight: 500 }}>
                            <Plus />
                            <span>{line}</span>
                         </div>
                       ))
                     )}
                   </div>
                </div>
              </div>
            )}

            {activeTab === '+ INFO' && (
              <div>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '60px' }}>
                  <div style={{ display: 'flex', border: '1px solid black', borderRadius: '100px', overflow: 'hidden' }}>
                    {['GENERAL', 'PERSPECTIVAS'].map(p => (
                      <div 
                        key={p} 
                        onClick={() => setInfoSubTab(p)}
                        style={{ 
                          padding: '8px 24px', fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', cursor: 'pointer',
                          background: infoSubTab === p ? 'black' : 'white', color: infoSubTab === p ? 'white' : 'black',
                          borderRight: p === 'GENERAL' ? '1px solid black' : 'none'
                        }}
                      >
                        {p}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', fontSize: '19px', lineHeight: '1.8', fontWeight: 400, maxWidth: '900px' }}>
                   {isEditing ? (
                      <InlineEdit 
                          text={infoSubTab === 'GENERAL' ? editedStory.fullContent : editedStory.perspectivasInfo} 
                          onChange={v => updateStory(infoSubTab === 'GENERAL' ? 'fullContent' : 'perspectivasInfo', v)} 
                          isEditing={true} 
                          multiline 
                          placeholder={infoSubTab === 'GENERAL' ? "Todo el contenido de la historia ampliada..." : "Perspectivas detalladas de diferentes medios..."} 
                          style={{ margin: 0, minHeight: '400px' }} 
                      />
                   ) : (
                      (() => {
                        const content = infoSubTab === 'GENERAL' ? editedStory.fullContent : editedStory.perspectivasInfo;
                        const paras = Array.isArray(content) ? content : (content || '').split('\n');
                        return paras.filter(l => l && String(l).trim()).map((p, idx) => (
                          <div key={idx} style={{ display: 'flex', gap: '40px', marginBottom: '1.5em' }}>
                            <div style={{ fontSize: '14px', fontWeight: 900, opacity: 0.1, paddingTop: '4px' }}>{String(idx + 1).padStart(2, '0')}</div>
                            <p style={{ margin: 0 }}>{p}</p>
                          </div>
                        ));
                      })()
                   )}
                </div>
              </div>
            )}

            {activeTab === 'CONTEXTO' && (
              <div style={{ maxWidth: '900px' }}>
                <div style={{ fontSize: '10px', fontWeight: 900, opacity: 0.3, marginBottom: '24px', letterSpacing: '1px' }}>ANÁLISIS DE CONTEXTO ESTRUCTURAL</div>
                <div style={{ fontSize: '19px', lineHeight: '1.8', fontWeight: 400 }}>
                   {isEditing ? (
                      <InlineEdit 
                          text={editedStory.contexto} 
                          onChange={v => updateStory('contexto', v)} 
                          isEditing={true} 
                          multiline 
                          placeholder="Proporciona contexto histórico, antecedentes..." 
                          style={{ minHeight: '300px' }} 
                      />
                   ) : (
                     (Array.isArray(editedStory.contexto) ? editedStory.contexto : (editedStory.contexto || '').split('\n')).filter(l => l && String(l).trim()).map((p, idx) => (
                       <div key={idx} style={{ display: 'flex', gap: '24px', marginBottom: '32px' }}>
                          <Plus />
                          <p style={{ margin: 0 }}>{p}</p>
                       </div>
                     ))
                   )}
                </div>
              </div>
            )}


            {activeTab === 'IMPACTO' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '80px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: 900, opacity: 0.3, marginBottom: '24px', letterSpacing: '1px', color: 'black' }}>PROYECCIÓN SOCIAL</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                         {isEditing ? (
                            <InlineEdit 
                               text={editedStory.impactoSocial} 
                               onChange={v => updateStory('impactoSocial', v)} 
                               isEditing={true} multiline
                               placeholder="Impacto social. Un punto por línea." 
                               style={{ fontSize: '17px', lineHeight: '1.6', fontWeight: 600 }}
                            />
                         ) : (
                           (Array.isArray(editedStory.impactoSocial) ? editedStory.impactoSocial : (editedStory.impactoSocial || '').split('\n')).filter(l => l && String(l).trim()).map((line, idx) => (
                             <div key={idx}>
                               <div style={{ fontSize: '9px', fontWeight: 900, opacity: 0.3, marginBottom: '8px' }}>EJE {idx + 1}</div>
                               <div style={{ fontSize: '17px', lineHeight: '1.4', fontWeight: 600 }}>{line}</div>
                             </div>
                           ))
                         )}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: 900, opacity: 0.3, marginBottom: '24px', letterSpacing: '1px' }}>IMPLICACIONES SISTÉMICAS</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                         {isEditing ? (
                           <InlineEdit 
                             text={editedStory.impactoSistemico} 
                             onChange={v => updateStory('impactoSistemico', v)} 
                             isEditing={true} multiline
                             placeholder="Implicaciones sistémicas. Un punto por línea." 
                             style={{ fontSize: '17px', lineHeight: '1.6', fontWeight: 600 }}
                           />
                         ) : (
                           (Array.isArray(editedStory.impactoSistemico) ? editedStory.impactoSistemico : (editedStory.impactoSistemico || '').split('\n')).filter(l => l && String(l).trim()).map((line, idx) => (
                             <div key={idx} style={{ paddingLeft: '24px', position: 'relative' }}>
                               <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: 'black' }} />
                               <div style={{ fontSize: '17px', lineHeight: '1.4', fontWeight: 600 }}>{line}</div>
                             </div>
                           ))
                         )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'COBERTURA' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '60px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' }}>
                  {['IZQUIERDA', 'CENTRO', 'DERECHA'].map((bias, idx) => {
                    const narratives = (editedStory.consensoNarrativo || '').split('|');
                    const text = narratives[idx] || (idx === 0 ? editedStory.consensoNarrativo : '');
                    return (
                      <div key={idx} style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '10px', fontWeight: 900, opacity: 0.3, marginBottom: '24px', letterSpacing: '1px' }}>NARRATIVA {bias}</div>
                        <div style={{ fontSize: '17px', lineHeight: '1.4', fontWeight: 500, wordBreak: 'break-word', overflow: 'hidden' }}>
                           <InlineEdit 
                             text={text} 
                             onChange={v => {
                                const parts = (editedStory.consensoNarrativo || '||').split('|');
                                while(parts.length < 3) parts.push('');
                                parts[idx] = v;
                                updateStory('consensoNarrativo', parts.join('|'));
                             }} 
                             isEditing={isEditing} 
                             placeholder={`Narrativa de ${bias.toLowerCase()}...`}
                           />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ padding: '48px', border: '1px solid #ddd', borderRadius: '12px' }}>
                   <div style={{ fontSize: '10px', fontWeight: 900, opacity: 0.3, marginBottom: '24px', letterSpacing: '1px' }}>SÍNTESIS DE TNE INTELLIGENCE</div>
                   <div style={{ fontSize: '20px', lineHeight: '1.4', fontWeight: 600 }}>
                      <InlineEdit 
                        text={editedStory.analyticalSnippet} 
                        onChange={v => updateStory('analyticalSnippet', v)} 
                        isEditing={isEditing} 
                        multiline
                        placeholder="Escribe la síntesis editorial aquí..." 
                      />
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'DATOS' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px' }}>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 900, opacity: 0.3, marginBottom: '40px', letterSpacing: '1px' }}>CIFRAS CLAVE</div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {(editedStory.cifrasClave || []).map((c, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #eee' }}>
                        <div style={{ fontSize: '15px' }}>
                          <InlineEdit text={c.label} onChange={v => {
                            const next = [...(editedStory.cifrasClave || [])];
                            next[idx] = { ...next[idx], label: v };
                            updateStory('cifrasClave', next);
                          }} isEditing={isEditing} placeholder="Etiqueta..." />
                        </div>
                        <div style={{ fontSize: '15px', fontWeight: 800 }}>
                          <InlineEdit text={c.value} onChange={v => {
                            const next = [...(editedStory.cifrasClave || [])];
                            next[idx] = { ...next[idx], value: v };
                            updateStory('cifrasClave', next);
                          }} isEditing={isEditing} placeholder="Valor..." />
                        </div>
                      </div>
                    ))}
                    {isEditing && (
                      <button 
                        onClick={() => updateStory('cifrasClave', [...(editedStory.cifrasClave || []), { label: 'Nueva Cifra', value: '0' }])}
                        style={{ marginTop: '20px', padding: '8px', background: '#eee', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', fontWeight: 800 }}
                      >+ AÑADIR CIFRA</button>
                    )}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 900, opacity: 0.3, marginBottom: '40px', letterSpacing: '1px' }}>ESTADO DE VERIFICACIÓN</div>
                  <div style={{ padding: '40px', border: '1px solid black', borderRadius: '12px' }}>
                     <div style={{ fontSize: '14px', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '18px' }}>[✓]</span> CONFIRMADO OFICIALMENTE
                     </div>
                     <div style={{ fontSize: '15px', lineHeight: '1.6', opacity: 0.5 }}>
                        <InlineEdit 
                          text={editedStory.verificacionInfo} 
                          onChange={v => updateStory('verificacionInfo', v)} 
                          isEditing={isEditing} 
                          multiline 
                          placeholder="Detalles sobre la verificación de los datos..." 
                        />
                     </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'FUENTES' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '40px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                   <div>
                      <div style={{ fontSize: '10px', fontWeight: 900, opacity: 0.3, marginBottom: '24px', letterSpacing: '1px' }}>ORIGEN DE LA INFORMACIÓN</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {(Array.isArray(editedStory.origenInfo) ? editedStory.origenInfo : []).map((o, idx) => (
                           <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 24px', border: '1px solid #eee', borderRadius: '4px', background: '#fdfdfd' }}>
                              <div style={{ fontSize: '15px', fontWeight: 600 }}>
                                 <InlineEdit text={o} onChange={v => {
                                    const next = [...(editedStory.origenInfo || [])];
                                    next[idx] = v;
                                    updateStory('origenInfo', next);
                                 }} isEditing={isEditing} />
                              </div>
                              <div style={{ fontSize: '11px', fontWeight: 800, opacity: 0.2 }}>✓ VERIFICADO</div>
                           </div>
                        ))}
                        {isEditing && (
                           <button onClick={() => updateStory('origenInfo', [...(editedStory.origenInfo || []), 'Nueva Fuente'])} style={{ padding: '8px', border: '1px dashed #ccc', background: 'none', cursor: 'pointer', fontSize: '10px', fontWeight: 900 }}>+ AÑADIR ORIGEN</button>
                        )}
                      </div>
                   </div>
                   <div>
                      <div style={{ fontSize: '10px', fontWeight: 900, opacity: 0.3, marginBottom: '24px', letterSpacing: '1px' }}>MEDIOS ANALIZADOS</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', fontSize: '13px', fontWeight: 700 }}>
                        {(Array.isArray(editedStory.mediosAnalizados) ? editedStory.mediosAnalizados : []).map((m, idx) => (
                           <div key={idx} style={{ padding: '8px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'black' }} />
                              <InlineEdit text={m} onChange={v => {
                                 const next = [...(editedStory.mediosAnalizados || [])];
                                 next[idx] = v;
                                 updateStory('mediosAnalizados', next);
                              }} isEditing={isEditing} />
                           </div>
                        ))}
                        {isEditing && (
                           <button onClick={() => updateStory('mediosAnalizados', [...(editedStory.mediosAnalizados || []), 'Nuevo Medio'])} style={{ padding: '8px', border: '1px dashed #ccc', background: 'none', cursor: 'pointer', fontSize: '10px', fontWeight: 900 }}>+ AÑADIR MEDIO</button>
                        )}
                      </div>
                   </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '60px' }}>
                   <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '10px', fontWeight: 900, opacity: 0.3, marginBottom: '24px', letterSpacing: '1px' }}>DISTRIBUCIÓN DE SESGO</div>
                      <div style={{ padding: '48px', background: 'black', color: 'white', borderRadius: '8px', overflow: 'hidden' }}>
                         <div style={{ fontSize: '11px', fontWeight: 900, marginBottom: '24px' }}>ANÁLISIS DE NEUTRALIDAD</div>
                         <div style={{ fontSize: '16px', lineHeight: '1.6', opacity: 0.8, wordBreak: 'break-word' }}>
                            <InlineEdit 
                              text={editedStory.biasInfo || `Se han analizado ${editedStory.articles?.length || 0} fuentes únicas. El ${editedStory.bias?.left || 33}% del volumen informativo proviene de medios con tendencia progresista, frente al ${editedStory.bias?.right || 33}% de tendencia conservadora.`} 
                              onChange={v => updateStory('biasInfo', v)} 
                              isEditing={isEditing} 
                              multiline 
                              placeholder="Describe el análisis de neutralidad..." 
                            />
                         </div>
                      </div>
                   </div>
                   <div>
                      <div style={{ fontSize: '10px', fontWeight: 900, opacity: 0.3, marginBottom: '24px', letterSpacing: '1px' }}>DOCUMENTOS</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {(Array.isArray(editedStory.documentosInfo) ? editedStory.documentosInfo : []).map((d, idx) => (
                           <div key={idx} style={{ padding: '16px 24px', border: '1px solid black', borderRadius: '8px', fontSize: '13px', fontWeight: 900, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <InlineEdit text={d.name || d} onChange={v => {
                                 const next = [...(editedStory.documentosInfo || [])];
                                 next[idx] = typeof d === 'object' ? { ...d, name: v } : v;
                                 updateStory('documentosInfo', next);
                              }} isEditing={isEditing} />
                              <span style={{ fontSize: '16px' }}>↘</span>
                           </div>
                        ))}
                        {isEditing && (
                           <button onClick={() => updateStory('documentosInfo', [...(editedStory.documentosInfo || []), 'NUEVO_DOC.PDF'])} style={{ padding: '8px', border: '1px dashed #ccc', background: 'none', cursor: 'pointer', fontSize: '10px', fontWeight: 900 }}>+ AÑADIR DOCUMENTO</button>
                        )}
                      </div>
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'CLAVES' && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {Array.isArray(editedStory.desglose) && editedStory.desglose.length > 0 ? (
                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '48px' }}>
                      {editedStory.desglose.slice(0, 6).map((clave, idx) => (
                         <div key={idx} style={{ padding: '40px', border: '1px solid black', position: 'relative', minHeight: '180px' }}>
                            <div style={{ position: 'absolute', left: '24px', top: '-11px', background: 'white', padding: '0 8px', fontSize: '10px', fontWeight: 900, letterSpacing: '1px' }}>CLAVE {idx + 1}</div>
                            <div style={{ fontSize: '18px', fontWeight: 600, lineHeight: '1.4' }}>
                               <InlineEdit text={clave} onChange={v => {
                                  const next = [...(editedStory.desglose || [])];
                                  next[idx] = v;
                                  updateStory('desglose', next);
                               }} isEditing={isEditing} multiline />
                            </div>
                         </div>
                      ))}
                      {isEditing && (
                         <button onClick={() => updateStory('desglose', [...(editedStory.desglose || []), 'Nueva clave editorial...'])} style={{ padding: '40px', border: '1px dashed #ccc', minHeight: '180px', background: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 900 }}>+ AÑADIR CLAVE</button>
                      )}
                   </div>
                ) : (
                  isEditing && (
                    <button onClick={() => updateStory('desglose', ['Nueva clave editorial...'])} style={{ padding: '40px', border: '1px dashed #ccc', marginBottom: '48px', background: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 900, width: '100%' }}>+ AÑADIR CLAVES EDITORIALES</button>
                  )
                )}
 
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                   <div>
                      <div style={{ fontSize: '10px', fontWeight: 900, opacity: 0.3, marginBottom: '24px', letterSpacing: '1px' }}>PROTAGONISTAS</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                         <div>
                            <div style={{ fontSize: '18px', fontWeight: 800, marginBottom: '12px' }}>Beneficiados</div>
                            <div style={{ fontSize: '15px', lineHeight: '1.6', opacity: 0.5 }}>
                              <InlineEdit 
                                 text={editedStory.protagonistasInfo?.beneficiados || ''} 
                                 onChange={v => updateStory('protagonistasInfo', { ...editedStory.protagonistasInfo, beneficiados: v })} 
                                 isEditing={isEditing} 
                                 multiline 
                                 placeholder="Quiénes son los beneficiados..." 
                              />
                            </div>
                         </div>
                         <div>
                            <div style={{ fontSize: '18px', fontWeight: 800, marginBottom: '12px' }}>Afectados</div>
                            <div style={{ fontSize: '15px', lineHeight: '1.6', opacity: 0.5 }}>
                               <InlineEdit 
                                  text={editedStory.protagonistasInfo?.afectados || ''} 
                                  onChange={v => updateStory('protagonistasInfo', { ...editedStory.protagonistasInfo, afectados: v })} 
                                  isEditing={isEditing} 
                                  multiline 
                                  placeholder="Quiénes son los afectados..." 
                               />
                            </div>
                         </div>
                      </div>
                   </div>
                   <div>
                      <div style={{ fontSize: '10px', fontWeight: 900, opacity: 0.3, marginBottom: '24px', letterSpacing: '1px' }}>PREGUNTAS ABIERTAS</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                         {(Array.isArray(editedStory.preguntasInfo) ? editedStory.preguntasInfo : (editedStory.preguntasInfo || '').split('\n')).filter(l => l && String(l).trim()).map((q, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '16px', fontSize: '16px', fontWeight: 500 }}>
                               <span style={{ opacity: 0.3 }}>+</span> 
                               <InlineEdit text={q} onChange={v => {
                                  const next = [...(editedStory.preguntasInfo || [])];
                                  next[idx] = v;
                                  updateStory('preguntasInfo', next);
                               }} isEditing={isEditing} />
                            </div>
                         ))}
                         {isEditing && (
                            <button onClick={() => updateStory('preguntasInfo', [...(editedStory.preguntasInfo || []), 'Nueva pregunta abierta'])} style={{ padding: '8px', border: '1px dashed #ccc', background: 'none', cursor: 'pointer', fontSize: '10px', fontWeight: 900, alignSelf: 'flex-start' }}>+ AÑADIR PREGUNTA</button>
                         )}
                      </div>
                   </div>
                </div>
              </div>
            )}

          </div>

          {/* ARTICLE LIST (Cards) */}
          <div style={{ borderTop: '2px solid black', paddingTop: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <div style={{ fontSize: '24px', fontWeight: 800 }}>{filteredArticles.length} ARTÍCULOS</div>
              
              {isEditing ? (
                 <button 
                   onClick={() => updateStory('articles', [{ title: 'Nuevo Artículo', source: 'Medio', bias: 'CENTER', time: 'Reciente', origin: 'Indeterminado', type: 'REPORTAJE', author: 'Autor', tone: 'Neutral', angle: 'General', diff: 'Enfoque...', summary: 'Resumen...' }, ...(editedStory.articles || [])])}
                   style={{ padding: '8px 16px', background: 'black', color: 'white', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', borderRadius: '100px' }}
                 >
                   + AÑADIR NUEVA TARJETA DE ARTÍCULO
                 </button>
              ) : (
                <div style={{ display: 'flex', gap: '32px', fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>
                  {['TODO', 'LEFT', 'CENTER', 'RIGHT'].map(f => {
                    const n = f === 'TODO' ? allArticles.length : allArticles.filter(a => a._bucket === f).length;
                    const label = f === 'LEFT' ? 'IZQUIERDA' : f === 'CENTER' ? 'CENTRO' : f === 'RIGHT' ? 'DERECHA' : 'TODO';
                    return (
                      <span key={f} onClick={() => setActiveFilter(f)} style={{ cursor: 'pointer', opacity: activeFilter === f ? 1 : 0.25, letterSpacing: '1px' }}>
                        {label}{n > 0 ? <span style={{ opacity: 0.5, marginLeft: '6px' }}>{n}</span> : ''}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {filteredArticles.map((art, i) => (
                <div 
                  key={i} 
                  onClick={() => {
                    if (!isEditing) {
                      onSelectArticle(art);
                      navigate(`/article/${i}`);
                    }
                  }}
                  style={{ 
                    padding: '40px', 
                    border: 'var(--border-thin)', 
                    borderRadius: '12px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '24px', 
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    cursor: isEditing ? 'default' : 'pointer',
                    background: 'white',
                    boxShadow: !isEditing ? '0 4px 24px rgba(0,0,0,0.02)' : 'none'
                  }}
                  onMouseEnter={(e) => { if(!isEditing) { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'black'; } }}
                  onMouseLeave={(e) => { if(!isEditing) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border-thin)'; } }}
                >
                  {isEditing && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const newArts = [...editedStory.articles];
                        newArts.splice(i, 1);
                        updateStory('articles', newArts);
                      }}
                      style={{ position: 'absolute', top: '24px', right: '24px', background: '#d32f2f', color: 'white', border: 'none', padding: '6px 12px', fontSize: '10px', fontWeight: 900, borderRadius: '100px', cursor: 'pointer', zIndex: 10 }}
                    >
                      X BORRAR ESTA TARJETA
                    </button>
                  )}
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {isEditing
                        ? <div style={{ width: '22px', height: '22px', background: 'black', borderRadius: '4px' }} />
                        : <SourceLogo source={art} size={26} />}
                      <span style={{ fontWeight: 800, fontSize: '14px', fontFamily: 'var(--font-mono)' }}>
                        <InlineEdit text={art.source} onChange={v => { const a = [...editedStory.articles]; a[i].source = v; updateStory('articles', a); }} isEditing={isEditing} placeholder="Medio (Ej. El País)..." />
                      </span>
                      <span style={{ fontSize: '11px', opacity: 0.4, fontWeight: 700 }}>
                        • <InlineEdit text={art.time} onChange={v => { const a = [...editedStory.articles]; a[i].time = v; updateStory('articles', a); }} isEditing={isEditing} placeholder="Tiempo..." /> 
                        (<InlineEdit text={art.origin} onChange={v => { const a = [...editedStory.articles]; a[i].origin = v; updateStory('articles', a); }} isEditing={isEditing} placeholder="Ubicación/Origen..." />)
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <span style={{ fontSize: '10px', fontWeight: 800, opacity: 0.3, letterSpacing: '1px' }}>
                         <InlineEdit text={art.type} onChange={v => { const a = [...editedStory.articles]; a[i].type = v; updateStory('articles', a); }} isEditing={isEditing} placeholder="Tipo (ej. OPINIÓN)..." />
                      </span>
                      {isEditing ? (
                        <span style={{ fontSize: '10px', padding: '4px 10px', background: 'black', color: 'white', fontWeight: 800 }}>
                           <InlineSelect text={art.bias} options={['LEFT', 'CENTER', 'RIGHT']} onChange={v => { const a = [...editedStory.articles]; a[i].bias = v; updateStory('articles', a); }} isEditing={isEditing} />
                        </span>
                      ) : (
                        <>
                          <SourceTag kind="bias" value={art.biasRating} />
                          {art.factuality && <SourceTag kind="factuality" value={art.factuality} />}
                          {art.ownershipCategory && <SourceTag kind="ownership" value={art.ownershipCategory} />}
                        </>
                      )}
                    </div>
                  </div>

                  <h4 style={{ fontSize: '32px', fontWeight: 800, margin: 0, letterSpacing: '-1.5px', lineHeight: '1.1' }}>
                    <InlineEdit text={art.title || story.title} onChange={v => { const a = [...editedStory.articles]; a[i].title = v; updateStory('articles', a); }} isEditing={isEditing} multiline placeholder="Titular del artículo..." />
                  </h4>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 800, opacity: 0.4 }}>
                    <span>AUTOR: <InlineEdit text={art.author} onChange={v => { const a = [...editedStory.articles]; a[i].author = v; updateStory('articles', a); }} isEditing={isEditing} placeholder="..." /></span>
                    <span>TONO: <InlineEdit text={art.tone} onChange={v => { const a = [...editedStory.articles]; a[i].tone = v; updateStory('articles', a); }} isEditing={isEditing} placeholder="..." /></span>
                    <span>ÁNGULO: <InlineEdit text={art.angle} onChange={v => { const a = [...editedStory.articles]; a[i].angle = v; updateStory('articles', a); }} isEditing={isEditing} placeholder="..." /></span>
                  </div>

                  <div style={{ fontSize: '15px', lineHeight: '1.6', fontWeight: 600 }}>
                    <span style={{ opacity: 0.3, marginRight: '12px', letterSpacing: '1px', fontSize: '11px' }}>ENFOQUE:</span>
                    <span><InlineEdit text={art.diff} onChange={v => { const a = [...editedStory.articles]; a[i].diff = v; updateStory('articles', a); }} isEditing={isEditing} placeholder="Escribe el enfoque detectado..." /></span>
                  </div>

                  <div style={{ fontSize: '14px', lineHeight: '1.5', opacity: 0.7, paddingLeft: '24px', borderLeft: '1px solid #eee' }}>
                    <InlineEdit text={art.summary} onChange={v => { const a = [...editedStory.articles]; a[i].summary = v; updateStory('articles', a); }} isEditing={isEditing} multiline placeholder="Resumen exclusivo del artículo..." />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f9f9f9', paddingTop: '24px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-primary)' }}>
                      CLAVE: <InlineEdit text={art.whyOpened || 'Análisis profundo'} onChange={v => { const a = [...editedStory.articles]; a[i].whyOpened = v; updateStory('articles', a); }} isEditing={isEditing} placeholder="Clave que explora..." />
                    </div>
                    <div style={{ display: 'flex', gap: '24px', fontSize: '11px', fontWeight: 800 }}>
                      <span style={{ opacity: 0.4 }}>COMPARAR DIFERENCIAS</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* SIDEBAR AREA (Sticky Navigation) */}
        <div className="sidebar" style={{ 
          flex: '0 0 30%', borderLeft: isTablet ? 'none' : 'var(--border-thin)', paddingLeft: isTablet ? 0 : '40px', paddingTop: isTablet ? '12px' : 0, position: 'sticky', top: isMobile ? '16px' : '40px', alignSelf: 'flex-start', height: 'fit-content'
        }}>
          
          {/* CONSENSO (Dynamic) */}
          <div style={{ marginBottom: '56px', padding: '24px', border: 'var(--border-thin)', borderRadius: '12px', background: isEditing ? '#fffcea' : 'transparent' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '1px', marginBottom: '16px', fontFamily: 'var(--font-mono)', opacity: 0.3 }}>CONSENSO NARRATIVO</h4>
            <div style={{ fontSize: '16px', fontWeight: 800, marginBottom: '8px' }}>
                CONSENSO <InlineSelect text={editedStory.consensus || 'MEDIO'} options={['ALTO', 'MEDIO', 'BAJO', 'POLARIZADO']} onChange={v => updateStory('consensus', v)} isEditing={isEditing} />
            </div>
            <InlineEdit 
              text={editedStory.consensoNarrativo} 
              onChange={v => updateStory('consensoNarrativo', v)} 
              isEditing={isEditing} multiline
              placeholder="Explicación del consenso normativo..." 
              style={{ fontSize: '14px', opacity: 0.5, lineHeight: '1.4' }}
            />
          </div>

          {/* PUNTO CIEGO (Dynamic) */}
          <div style={{ marginBottom: '56px', padding: '24px', background: 'black', color: 'white', borderRadius: '12px' }}>
            <h4 style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '2px', marginBottom: '12px', opacity: 0.4 }}>PUNTO CIEGO</h4>
            <div style={{ fontSize: '16px', fontWeight: 700, lineHeight: '1.4', margin: 0 }}>
              <InlineEdit 
                text={editedStory.blindSpot} 
                onChange={v => updateStory('blindSpot', v)} 
                isEditing={isEditing} multiline
                placeholder="Punto ciego principal de la noticia. Generalmente ignorado por alguno de los bandos." 
                style={{ color: 'white' }}
              />
            </div>
          </div>

          {/* BIAS DISTRIBUTION EDITOR (manager-only) — controla la barra de sesgo editorial */}
          {isEditing && (() => {
            const bias = editedStory.bias || { left: 0, center: 0, right: 0 };
            const setBias = (patch) => updateStory('bias', { ...(editedStory.bias || { left: 0, center: 0, right: 0 }), ...patch });
            const sum = (Number(bias.left) || 0) + (Number(bias.center) || 0) + (Number(bias.right) || 0);
            const fields = [
              { key: 'left', label: 'Izquierda' },
              { key: 'center', label: 'Centro' },
              { key: 'right', label: 'Derecha' }
            ];
            return (
              <div style={{ border: 'var(--border-thin)', padding: '24px', marginBottom: '56px', background: '#fffcea' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '1px', marginBottom: '20px', fontFamily: 'var(--font-mono)', opacity: 0.3 }}>
                  DISTRIBUCIÓN DE SESGO (EDITORIAL)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                  {fields.map(f => (
                    <label key={f.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', fontSize: '12px', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                      <span>{f.label}</span>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={bias?.[f.key] ?? 0}
                        onChange={e => setBias({ [f.key]: Number(e.target.value) })}
                        style={{
                          width: '72px', padding: '6px 8px', textAlign: 'right',
                          background: 'rgba(0,0,0,0.03)', border: '1px dashed #ccc', outline: 'none',
                          fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 800, color: 'inherit'
                        }}
                      />
                    </label>
                  ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  <MiniBiasBar distribution={editedStory.bias || { left: 0, center: 0, right: 0 }} width={200} height={12} />
                  <div style={{ fontSize: '11px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: sum === 100 ? 'inherit' : '#d32f2f', opacity: sum === 100 ? 0.5 : 1 }}>
                    Suma: {sum}%{sum !== 100 ? ' (recomendado 100)' : ''}
                  </div>
                </div>
                <p style={{ fontSize: '10px', lineHeight: '1.5', fontFamily: 'var(--font-mono)', opacity: 0.4, margin: 0 }}>
                  Controla la barra de sesgo que ven los lectores en la tarjeta y la ficha. Para noticias del pipeline se usa coverage_* automáticamente.
                </p>
              </div>
            );
          })()}

          {/* COVERAGE DETAILS — distribución de sesgo / factualidad / propiedad derivadas */}
          <div style={{ marginBottom: '56px' }}>
            <CoverageDetails story={coverageStory} sources={coverageSources} onSourceClick={handleCoverageSourceClick} />
          </div>

          {/* FACT CHECK (Dynamic) */}
          <div style={{ marginBottom: '56px', padding: '24px', background: '#f5f5f5', borderRadius: '4px' }}>
            <h4 style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '1px', marginBottom: '16px', color: '#666' }}>VERIFICACIÓN TNE Intelligence</h4>
            <div style={{ fontSize: '14px', fontWeight: 800, marginBottom: '8px' }}>[✓] Verificación de Datos</div>
            <div style={{ fontSize: '12px', opacity: 0.6, margin: 0, textAlign: 'justify', lineHeight: '1.4' }}>
              <InlineEdit
                text={editedStory.factCheck}
                onChange={v => updateStory('factCheck', v)}
                isEditing={isEditing} multiline
                placeholder="Explicación o resolución del Fact Check sobre las afirmaciones."
              />
            </div>
          </div>

          {/* SIMILAR NEWS TOPICS */}
          {!isEditing && (() => {
            const topics = Array.from(new Set([
              editedStory.category,
              editedStory.location,
              ...allArticles.map(a => a.origin)
            ].map(t => (t || '').toString().trim()).filter(t => t && t.toLowerCase() !== 'españa' && t.length > 1)));
            const list = topics.slice(0, 6);
            if (list.length === 0) return null;
            return (
              <div style={{ marginBottom: '56px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '1px', marginBottom: '20px', fontFamily: 'var(--font-mono)', opacity: 0.3 }}>TEMAS RELACIONADOS</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: '#eee', border: 'var(--border-thin)' }}>
                  {list.map((topic, idx) => (
                    <div
                      key={idx}
                      onClick={() => navigate(`/?topic=${encodeURIComponent(topic)}`)}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: '#fff', cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
                      onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                    >
                      <span style={{ fontSize: '14px', fontWeight: 700 }}>{topic}</span>
                      <span style={{ fontSize: '16px', fontWeight: 900, lineHeight: 1, opacity: 0.5 }}>+</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

        </div>
      </div>
      </div>
      {!isEditing && (editedStory.status || 'published') === 'published' && (
        <ToddyFloatingLauncher
          isMobile={isMobile}
          hidden={showToddy}
          onClick={() => setShowToddy(true)}
        />
      )}
      <ToddyChatPanel story={editedStory} open={showToddy} onClose={() => setShowToddy(false)} />
    </div>
  );
};

export default StoryDetail;
