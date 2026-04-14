import React, { useState } from 'react';
import BiasBar from './BiasBar';

const StoryDetail = ({ story, onBack }) => {
  if (!story) return null;
  const [activeFilter, setActiveFilter] = useState('TODO');

  // Safely get paragraphs
  const paragraphs = story.content || (story.fullContent ? story.fullContent.split('\n\n') : story.summary ? [story.summary] : []);

  // Extended mock articles with bias property
  const allArticles = [
    { source: "EL PAÍS", bias: "CENTER", fact: "HIGH", time: "Hace 2h", origin: "España" },
    { source: "ABC", bias: "RIGHT", fact: "HIGH", time: "Hace 4h", origin: "España" },
    { source: "EL DIARIO", bias: "LEFT", fact: "HIGH", time: "Hace 5h", origin: "España" },
    { source: "RTVE", bias: "CENTER", fact: "HIGH", time: "Hace 6h", origin: "España" },
    { source: "EL MUNDO", bias: "RIGHT", fact: "HIGH", time: "Hace 7h", origin: "España" },
    { source: "LA VANGUARDIA", bias: "CENTER", fact: "HIGH", time: "Hace 8h", origin: "España" },
    { source: "PUBLICO", bias: "LEFT", fact: "HIGH", time: "Hace 10h", origin: "España" },
    { source: "THE GUARDIAN", bias: "LEFT", fact: "HIGH", time: "Hace 12h", origin: "Reino Unido" },
  ];

  const filteredArticles = activeFilter === 'TODO' 
    ? allArticles 
    : allArticles.filter(art => art.bias === activeFilter);

  return (
    <div className="story-detail">
      {/* Top Metadata & Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: 'var(--border-thin)', paddingBottom: '12px' }}>
        <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'rgba(0,0,0,0.5)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
          <span onClick={onBack} style={{ cursor: 'pointer', color: 'black' }}>← REGRESAR</span>
          <span>•</span>
          <span>PUBLICADO HAY 2 HORAS</span>
          <span>•</span>
          <span style={{ color: 'black' }}>ESPAÑA</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>, label: "LINK" },
            { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path></svg>, label: "SAVE" },
            { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>, label: "SHARE" }
          ].map((btn, i) => (
            <button key={i} className="action-button" style={{ 
              backgroundColor: 'white', 
              border: '1px solid black', 
              borderRadius: '6px', 
              width: '42px', 
              height: '42px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative'
            }}>
              {btn.icon}
            </button>
          ))}
        </div>
      </div>

      <div className="layout-split" style={{ alignItems: 'flex-start', gap: '60px' }}>
        {/* Left Column: Content */}
        <div className="main-content" style={{ flex: '0 0 65%' }}>
          <h1 style={{ 
            fontSize: '56px', 
            lineHeight: '1.05', 
            letterSpacing: '-3px', 
            marginBottom: '32px',
            color: 'var(--color-primary)',
            fontWeight: 800
          }}>
            {story.title}
          </h1>

          {/* Bias Quick Indicators */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '40px', alignItems: 'center' }}>
            <div style={{ display: 'flex', border: '1px solid black', borderRadius: '100px', overflow: 'hidden' }}>
              <button 
                onClick={() => setActiveFilter('LEFT')}
                style={{ padding: '8px 20px', border: 'none', background: activeFilter === 'LEFT' ? 'black' : '#f5f5f5', color: activeFilter === 'LEFT' ? 'white' : 'black', fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-mono)', cursor: 'pointer' }}
              >LEFT</button>
              <button 
                onClick={() => setActiveFilter('CENTER')}
                style={{ padding: '8px 20px', border: 'none', background: activeFilter === 'CENTER' ? 'black' : '#f5f5f5', color: activeFilter === 'CENTER' ? 'white' : 'black', fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-mono)', cursor: 'pointer' }}
              >CENTER</button>
              <button 
                onClick={() => setActiveFilter('RIGHT')}
                style={{ padding: '8px 20px', border: 'none', background: activeFilter === 'RIGHT' ? 'black' : '#f5f5f5', color: activeFilter === 'RIGHT' ? 'white' : 'black', fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-mono)', cursor: 'pointer' }}
              >RIGHT</button>
            </div>
            <button className="tag" style={{ padding: '8px 20px', background: 'none', fontWeight: 700, fontSize: '11px' }}>COMPARAR COBERTURA</button>
          </div>

          {/* Bullet Point Summary (Ground News Style) */}
          <div style={{ marginBottom: '60px' }}>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {paragraphs.slice(0, 4).map((para, i) => (
                <li key={i} style={{ 
                  display: 'flex', 
                  gap: '20px', 
                  fontSize: '19px', 
                  lineHeight: '1.6',
                  textAlign: 'justify',
                  textJustify: 'inter-word',
                  hyphens: 'auto'
                }}>
                  <div style={{ flex: '0 0 8px', height: '8px', background: 'black', borderRadius: '50%', marginTop: '10px' }}></div>
                  {para}
                </li>
              ))}
            </ul>
          </div>

          {/* Articles Section */}
          <div style={{ marginTop: '80px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid black', paddingBottom: '16px', marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h3 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>{filteredArticles.length} ARTÍCULOS</h3>
                <span className="tag" style={{ padding: '2px 8px', fontSize: '10px' }}>ANÁLISIS GNE</span>
              </div>
              <div style={{ display: 'flex', gap: '32px', fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                {['TODO', 'LEFT', 'CENTER', 'RIGHT'].map(f => (
                  <span 
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    style={{ 
                      color: 'black', 
                      opacity: activeFilter === f ? 1 : 0.3, 
                      borderBottom: activeFilter === f ? '2px solid black' : 'none', 
                      paddingBottom: '16px', 
                      marginBottom: '-18px',
                      cursor: 'pointer',
                      transition: '0.2s'
                    }}
                  >{f === 'LEFT' ? 'IZQUIERDA' : f === 'CENTER' ? 'CENTRO' : f === 'RIGHT' ? 'DERECHA' : f}</span>
                ))}
              </div>
            </div>

            {/* Source Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {filteredArticles.map((item, i) => (
                <div key={i} className="story-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '28px', height: '28px', background: '#000', borderRadius: '4px' }}></div>
                      <span style={{ fontWeight: 800, fontSize: '14px', fontFamily: 'var(--font-mono)' }}>{item.source}</span>
                      <span style={{ opacity: 0.4, fontSize: '12px' }}>• {item.time} ({item.origin})</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span className="tag" style={{ fontSize: '10px', padding: '4px 10px' }}>FACTUALIDAD: {item.fact === 'HIGH' ? 'ALTA' : 'MEDIA'}</span>
                      <span className="tag" style={{ fontSize: '10px', padding: '4px 10px', background: 'black', color: 'white' }}>{item.bias === 'LEFT' ? 'IZQUIERDA' : item.bias === 'CENTER' ? 'CENTRO' : 'DERECHA'}</span>
                    </div>
                  </div>
                  <h4 style={{ fontSize: '22px', fontWeight: 700, margin: 0 }}>{story.title}</h4>
                  <p style={{ opacity: 0.6, fontSize: '15px', margin: 0, lineHeight: '1.5' }}>
                    Análisis en profundidad sobre cómo esta medida impactará a la economía de los ciudadanos españoles este trimestre...
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button style={{ background: 'none', border: 'none', borderBottom: '1px solid black', padding: '2px 0', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>LEER ARTÍCULO COMPLETO ↗</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Sidebar Stats */}
        <div className="sidebar" style={{ flex: '0 0 30%', borderLeft: 'var(--border-thin)', paddingLeft: '40px' }}>
          <div style={{ marginBottom: '48px' }}>
            <h4 style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '1px', color: 'black', marginBottom: '24px', fontFamily: 'var(--font-mono)' }}>COBERTURA</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Total Fuentes</span> <strong>{allArticles.length}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Izquierda</span> <strong style={{ opacity: 0.5 }}>{allArticles.filter(a => a.bias === 'LEFT').length}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Centro</span> <strong>{allArticles.filter(a => a.bias === 'CENTER').length}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Derecha</span> <strong style={{ opacity: 0.5 }}>{allArticles.filter(a => a.bias === 'RIGHT').length}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', paddingTop: '16px', borderTop: 'var(--border-thin)' }}><span>Punto Ciego</span> <strong style={{ color: 'black' }}>Nulo</strong></div>
            </div>
          </div>

          <div style={{ marginBottom: '48px' }}>
            <h4 style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '1px', color: 'black', marginBottom: '24px', fontFamily: 'var(--font-mono)' }}>DISTRIBUCIÓN DE SESGO</h4>
            <BiasBar bias={story.bias} />
            <p style={{ fontSize: '12px', opacity: 0.5, marginTop: '16px', lineHeight: '1.4' }}>El 58% de las fuentes analizadas mantienen una postura de Centro en esta noticia.</p>
          </div>

          <div style={{ marginBottom: '48px' }}>
            <h4 style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '1px', color: 'black', marginBottom: '24px', fontFamily: 'var(--font-mono)' }}>ORIGEN DE LAS FUENTES</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>España (Nacional)</span>
                <span className="tag" style={{ border: 'none', background: '#f0f0f0', padding: '2px 8px' }}>92%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Reino Unido</span>
                <span className="tag" style={{ border: 'none', background: '#f0f0f0', padding: '2px 8px' }}>8%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.3 }}>
                <span>Estados Unidos</span>
                <span className="tag" style={{ border: 'none', background: '#f0f0f0', padding: '2px 8px' }}>0%</span>
              </div>
            </div>
          </div>

          {/* Locked Premium Features */}
          <div style={{ marginBottom: '48px', opacity: 0.3 }}>
            <h4 style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '1px', color: 'black', marginBottom: '24px', fontFamily: 'var(--font-mono)' }}>PROPIEDAD 🔒</h4>
            <div style={{ height: '12px', background: '#e0e0e0', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ width: '40%', height: '100%', background: '#888' }}></div>
            </div>
            <p style={{ fontSize: '10px', marginTop: '10px' }}>Suscripción Premium requerida para ver datos de propiedad.</p>
          </div>

          <div style={{ marginBottom: '48px' }}>
            <h4 style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '1px', color: 'black', marginBottom: '24px', fontFamily: 'var(--font-mono)' }}>TEMAS SIMILARES</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {['Economía España', 'Ley Vivienda', 'IBEX 35', 'Política Fiscal'].map(topic => (
                <div key={topic} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '36px', height: '36px', background: '#000', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>GNE</div>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{topic}</span>
                  </div>
                  <span style={{ fontSize: '20px', opacity: 0.3, fontWeight: 300, cursor: 'pointer' }}>+</span>
                </div>
              ))}
            </div>
          </div>
          
          <button className="tag" style={{ width: '100%', padding: '12px', textAlign: 'center', marginTop: '20px' }}>VER TODOS LOS TEMAS</button>
        </div>
      </div>
    </div>
  );
};

export default StoryDetail;
