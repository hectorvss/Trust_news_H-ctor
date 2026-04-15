import React, { useState } from 'react';
import BiasBar from './BiasBar';

const Plus = () => <span style={{ fontSize: '18px', opacity: 0.3, fontWeight: 700 }}>+</span>;

const StoryDetail = ({ story, onBack, activeFilter, setActiveFilter, activeTab, setActiveTab, isFavorite, onToggleFavorite }) => {
  if (!story) return null;
  const [perspective, setPerspective] = useState('CENTER');


  // Unified metadata for the story
  const metadata = {
    status: "CONFIRMADA",
    published: story.time.toUpperCase(),
    updated: "HACE 14 MIN",
    region: story.location.toUpperCase() || "ESPAÑA / UE",
    theme: story.category || "GENERAL",
    type: "ANÁLISIS TNE",
    factualidad: story.factuality?.toUpperCase() || "ALTA",
    consenso: "MEDIO",
    impacto: "ALTO",
    fuentes: story.sourceCount || 86
  };

  const allArticles = (story.articles || []).map(art => ({
    ...art,
    readerContent: art.readerContent,
    title: story.title
  }));


  const [infoSubTab, setInfoSubTab] = useState('GENERAL');

  const filteredArticles = activeFilter === 'TODO' 
    ? allArticles 
    : allArticles.filter(art => art.bias === activeFilter);

  return (
    <div className="story-detail" style={{ background: '#fff', color: '#000' }}>
      
      {/* 1. PRIMARY INTELLIGENCE INDICATORS (TOP HEADER) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: 'var(--border-thin)', paddingBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span onClick={onBack} style={{ cursor: 'pointer', fontSize: '13px', fontWeight: 900, fontFamily: 'var(--font-mono)', marginRight: '24px' }}>← REGRESAR</span>
          {[
            { label: 'FACTUALIDAD', val: 'ALTA' },
            { label: 'COBERTURA', val: 'MIXTA' },
            { label: 'CONSENSO', val: 'MEDIO' },
            { label: 'FUENTES', val: '86' },
            { label: 'IMPACTO', val: 'ALTO' }
          ].map((pill, i) => (
            <div key={i} style={{ padding: '8px 20px', background: '#f5f5f5', borderRadius: '4px', fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', display: 'flex', gap: '8px' }}>
              <span style={{ opacity: 0.3 }}>{pill.label}:</span>
              <span>{pill.val}</span>
            </div>
          ))}

        </div>
        
        <div style={{ display: 'flex', gap: '24px' }}>
          <svg style={{ opacity: 0.7, cursor: 'pointer' }} width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          <svg 
            onClick={onToggleFavorite}
            style={{ 
              opacity: isFavorite ? 1 : 0.7, 
              cursor: 'pointer',
              color: isFavorite ? 'black' : 'inherit',
              transition: 'all 0.2s ease'
            }} 
            width="28" height="28" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
          </svg>
          <svg style={{ opacity: 0.7, cursor: 'pointer' }} width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
        </div>
      </div>

      <div className="layout-split" style={{ alignItems: 'flex-start', gap: '60px' }}>
        
        {/* MAIN CONTENT AREA */}
        <div className="main-content" style={{ flex: '0 0 65%' }}>
          <h1 style={{ fontSize: '56px', fontWeight: 800, letterSpacing: '-3.5px', lineHeight: '1.0', marginBottom: '32px' }}>
            {story.title}
          </h1>

          {/* MINIMAL TABS navigation (identical to original structure) */}
          <div style={{ display: 'flex', gap: '24px', borderBottom: 'var(--border-thin)', marginBottom: '40px' }}>
            {['RESUMEN', '+ INFO', 'CONTEXTO', 'IMPACTO', 'COBERTURA', 'DATOS', 'FUENTES', 'CLAVES'].map(t => (
              <div 
                key={t}
                onClick={() => setActiveTab(t)}
                style={{ 
                  padding: '16px 0', 
                  fontSize: '13px', 
                  fontWeight: 800, 
                  fontFamily: 'var(--font-mono)', 
                  cursor: 'pointer',
                  borderBottom: activeTab === t ? '2px solid black' : '1px solid transparent',
                  opacity: activeTab === t ? 1 : 0.4,
                  transition: '0.2s',
                  marginBottom: '-1px'
                }}
              >
                {t}
              </div>
            ))}
          </div>

          <div style={{ marginBottom: '60px' }}>
            {activeTab === 'RESUMEN' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 900, opacity: 0.3, marginBottom: '16px', letterSpacing: '1px' }}>RESUMEN EJECUTIVO</div>
                  <div style={{ display: 'flex', gap: '24px', fontSize: '22px', lineHeight: '1.4', fontWeight: 600 }}>
                    <Plus /> <p style={{ margin: 0 }}>{story.summary}</p>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 900, opacity: 0.3, marginBottom: '16px', letterSpacing: '1px' }}>DESGLOSE DE INTELIGENCIA</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {(story.desglose || [
                      "Análisis técnico de la narrativa mediática actual.",
                      "Seguimiento coordinado de fuentes nacionales e internacionales.",
                      "Detección de puntos ciegos ideológicos en tiempo real."
                    ]).map((item, i) => (
                      <div key={i} style={{ display: 'flex', gap: '24px', fontSize: '18px', lineHeight: '1.5', opacity: 0.8 }}>
                        <Plus /> <p style={{ margin: 0 }}>{item}</p>
                      </div>
                    ))}
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
                          padding: '8px 24px', 
                          fontSize: '11px', 
                          fontWeight: 900, 
                          fontFamily: 'var(--font-mono)', 
                          cursor: 'pointer',
                          background: infoSubTab === p ? 'black' : 'transparent',
                          color: infoSubTab === p ? 'white' : 'black',
                          borderRight: p !== 'PERSPECTIVAS' ? '1px solid black' : 'none'
                        }}
                      >
                        {p}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', fontSize: '19px', lineHeight: '1.8', fontWeight: 400, maxWidth: '900px' }}>
                  {((infoSubTab === 'GENERAL' ? story.fullContent : (infoSubTab === 'PERSPECTIVAS' ? story.perspectivasInfo : story.cronologiaInfo)) || "Cargando información adicional...").split('\n\n').map((para, idx) => (
                    para.trim() && (
                      <div key={idx} style={{ display: 'flex', gap: '32px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 900, opacity: 0.2, fontFamily: 'var(--font-mono)', marginTop: '8px' }}>{String(idx + 1).padStart(2, '0')}</div>
                        <p style={{ margin: 0, textAlign: 'justify' }}>{para.trim()}</p>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}


            {activeTab === 'CONTEXTO' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '60px' }}>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 900, opacity: 0.3, marginBottom: '24px', letterSpacing: '1px' }}>ANÁLISIS DE CONTEXTO ESTRUCTURAL</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', fontSize: '18px', lineHeight: '1.7', maxWidth: '850px' }}>
                    {(story.contexto || "Cargando análisis de contexto global...").split('\n\n').map((p, i) => (
                      <div key={i} style={{ display: 'flex', gap: '24px' }}>
                        <Plus />
                        <p style={{ margin: 0 }}>{p}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'IMPACTO' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: 900, opacity: 0.3, marginBottom: '24px', letterSpacing: '1px', color: 'black' }}>PROYECCIÓN SOCIAL</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                      {(story.impactoSocial || [story.impacto]).map((item, i) => (
                        <div key={i} style={{ fontSize: '17px', lineHeight: '1.6', fontWeight: 600 }}>
                          <span style={{ display: 'block', fontSize: '11px', fontWeight: 900, opacity: 0.4, marginBottom: '8px' }}>EJE {i + 1}</span>
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: 900, opacity: 0.3, marginBottom: '24px', letterSpacing: '1px' }}>IMPLICACIONES SISTÉMICAS</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                      {(story.impactoSistemico || ["Análisis de impacto en curso..."]).map((item, i) => (
                        <div key={i} style={{ fontSize: '17px', lineHeight: '1.6', fontWeight: 600, borderLeft: '3px solid black', paddingLeft: '24px' }}>
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'COBERTURA' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '60px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '60px' }}>
                  {[
                    { label: 'IZQUIERDA', desc: story.perspectives?.left?.title || 'Enfoque centrado en la protección del inquilino y el derecho a la vivienda como bien social.' },
                    { label: 'CENTRO', desc: 'Análisis de la estabilidad del mercado y el impacto en la inflación general.' },
                    { label: 'DERECHA', desc: story.perspectives?.right?.title || 'Foco en el derecho a la propiedad y la posible contracción de la oferta de alquiler.' }
                  ].map((block, i) => (
                    <div key={i}>
                      <div style={{ fontSize: '10px', fontWeight: 900, marginBottom: '16px', opacity: 0.3, letterSpacing: '1px' }}>NARRATIVA {block.label}</div>
                      <div style={{ fontSize: '17px', lineHeight: '1.5', fontWeight: 600 }}>{block.desc}</div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '40px', border: '1px solid black', borderRadius: '4px', background: '#f9f9f9' }}>
                  <div style={{ fontSize: '10px', fontWeight: 900, marginBottom: '16px', opacity: 0.3, letterSpacing: '1px' }}>SÍNTESIS DE TNE INTELLIGENCE</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.5px' }}>{story.consensoNarrativo || "Se detecta una fragmentación total de la narrativa, con una correlación del 0.85 entre la ideología editorial y el encuadre de la noticia."}</div>
                </div>
              </div>
            )}



            {activeTab === 'FUENTES' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '40px' }}>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 900, opacity: 0.3, marginBottom: '24px' }}>ORIGEN DE LA INFORMACIÓN</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {["Agencia EFE", "Reuters", "Europa Press", "Gabinete de Prensa Ministerial"].map((f, i) => (
                      <div key={i} style={{ padding: '16px', border: '1px solid #eee', borderRadius: '4px', fontSize: '14px', fontWeight: 600 }}>
                        {f} <span style={{ float: 'right', opacity: 0.3 }}>✓ VERIFICADO</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 900, opacity: 0.3, marginBottom: '24px' }}>DISTRIBUCIÓN DE SESGO</div>
                  <div style={{ padding: '32px', background: '#000', color: '#fff', borderRadius: '4px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 900, marginBottom: '20px' }}>ANÁLISIS DE NEUTRALIDAD</div>
                    <p style={{ fontSize: '14px', lineHeight: '1.6', opacity: 0.8 }}>Se han analizado {story.sourceCount} fuentes únicas. El {story.bias.left}% del volumen informativo proviene de medios con tendencia progresista, frente al {story.bias.right}% de tendencia conservadora.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'CLAVES' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
                {(story.desglose || ["Analizando claves de la noticia..."]).map((item, i) => (
                  <div key={i} style={{ padding: '32px', border: '1px solid black', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '-10px', left: '20px', background: '#fff', padding: '0 8px', fontSize: '10px', fontWeight: 900 }}>CLAVE {i + 1}</div>
                    <div style={{ fontSize: '16px', fontWeight: 800, lineHeight: '1.4' }}>{item}</div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'DATOS' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 800, opacity: 0.3, marginBottom: '24px' }}>CIFRAS CLAVE</div>
                  {[
                    { k: 'Límite de subida', v: '3.0%' },
                    { k: 'Contratos afectados', v: '2,400,000' },
                    { k: 'Vigencia inicial', v: '31 DIC 2024' },
                    { k: 'Ahorro promedio/mes', v: '142€' }
                  ].map((d, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #eee', fontSize: '14px' }}>
                      <span style={{ fontWeight: 500 }}>{d.k}</span>
                      <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{d.v}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 800, opacity: 0.3, marginBottom: '24px' }}>ESTADO DE VERIFICACIÓN</div>
                  <div style={{ padding: '24px', background: '#fcfcfc', border: 'var(--border-thin)', borderRadius: '12px' }}>
                    <div style={{ marginBottom: '16px', color: 'black', fontWeight: 800, fontSize: '12px' }}>[✓] CONFIRMADO OFICIALMENTE</div>
                    <p style={{ fontSize: '13px', margin: 0, opacity: 0.6, lineHeight: '1.4' }}>Los datos han sido extraídos directamente del RD-Ley publicado en el BOE y confirmados por el Ministerio de Vivienda y Agenda Urbana.</p>
                  </div>
                </div>
              </div>
            )}


            {activeTab === 'FUENTES' && (
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '60px' }}>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 800, opacity: 0.3, marginBottom: '24px' }}>MEDIOS ANALIZADOS</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    {['EL PAÍS', 'ABC', 'EL MUNDO', 'RTVE', 'EL DIARIO', 'LA VANGUARDIA', 'EFE', 'REUTERS'].map(f => (
                      <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', fontWeight: 700 }}>
                        <div style={{ width: '8px', height: '8px', background: 'black', borderRadius: '50%' }} />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 800, opacity: 0.3, marginBottom: '24px' }}>DOCUMENTOS</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, border: 'var(--border-thin)', padding: '12px', borderRadius: '8px', cursor: 'pointer' }}>RD-LEY 12/2024.PDF ↘</div>
                    <div style={{ fontSize: '12px', fontWeight: 700, border: 'var(--border-thin)', padding: '12px', borderRadius: '8px', cursor: 'pointer' }}>NOTA MINISTERIO.PDF ↘</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'CLAVES' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 800, opacity: 0.3, marginBottom: '24px' }}>PROTAGONISTAS</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 800, marginBottom: '4px' }}>Beneficiados</div>
                      <p style={{ fontSize: '14px', margin: 0, opacity: 0.6 }}>Inquilinos en zonas urbanas de alta demanda; familias vulnerables.</p>
                    </div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 800, marginBottom: '4px' }}>Afectados</div>
                      <p style={{ fontSize: '14px', margin: 0, opacity: 0.6 }}>Grandes tenedores de vivienda; agencias de gestión inmobiliaria.</p>
                    </div>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 800, opacity: 0.3, marginBottom: '24px' }}>PREGUNTAS ABIERTAS</div>
                  <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '14px', fontWeight: 500 }}>
                    <li style={{ display: 'flex', gap: '12px' }}><Plus /> ¿Habrá un efecto rebote en los precios de venta?</li>
                    <li style={{ display: 'flex', gap: '12px' }}><Plus /> ¿Cómo afectará a la inversión en rehabilitación?</li>
                    <li style={{ display: 'flex', gap: '12px' }}><Plus /> ¿Se aplicará por igual en todas las CC.AA.?</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* ARTICLE LIST (Original Card-based list) */}
          <div style={{ borderTop: '2px solid black', paddingTop: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <div style={{ fontSize: '20px', fontWeight: 800 }}>{filteredArticles.length} ARTÍCULOS</div>
              <div style={{ display: 'flex', gap: '32px', fontSize: '13px', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                {['TODO', 'LEFT', 'CENTER', 'RIGHT'].map(f => (
                  <span key={f} onClick={() => setActiveFilter(f)} style={{ cursor: 'pointer', opacity: activeFilter === f ? 1 : 0.3 }}>
                    {f === 'LEFT' ? 'IZQUIERDA' : f === 'CENTER' ? 'CENTRO' : f === 'RIGHT' ? 'DERECHA' : f}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {filteredArticles.map((art, i) => (
                <div 
                  key={i} 
                  className="story-card" 
                  onClick={() => story.onSelectArticle ? story.onSelectArticle(art) : null}
                  style={{ 
                    padding: '48px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '24px', 
                    cursor: 'pointer',
                    border: '1px solid black',
                    borderRadius: '32px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '22px', height: '22px', background: 'black', borderRadius: '4px' }} />
                      <span style={{ fontWeight: 800, fontSize: '14px', fontFamily: 'var(--font-mono)' }}>{art.source}</span>
                      <span style={{ fontSize: '11px', opacity: 0.4, fontWeight: 700 }}>• {art.time} ({art.origin})</span>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <span style={{ fontSize: '10px', fontWeight: 800, opacity: 0.3, letterSpacing: '1px' }}>{art.type.toUpperCase()}</span>
                      <span style={{ fontSize: '10px', padding: '4px 10px', background: 'black', color: 'white', fontWeight: 800 }}>{art.bias}</span>
                    </div>
                  </div>

                  <h4 style={{ fontSize: '32px', fontWeight: 800, margin: 0, letterSpacing: '-1.5px', lineHeight: '1.1' }}>
                    {story.title}
                  </h4>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 800, opacity: 0.4 }}>
                    <span>AUTOR: {art.author.toUpperCase()}</span>
                    <span>TONO: {art.tone.toUpperCase()}</span>
                    <span>ÁNGULO: {art.angle.toUpperCase()}</span>
                  </div>

                  <div style={{ fontSize: '15px', lineHeight: '1.6', fontWeight: 600 }}>
                    <span style={{ opacity: 0.3, marginRight: '12px', letterSpacing: '1px', fontSize: '11px' }}>ENFOQUE:</span>
                    <span>{art.diff}</span>
                  </div>

                  {art.summary && (
                    <div style={{ fontSize: '14px', lineHeight: '1.5', opacity: 0.7, paddingLeft: '24px', borderLeft: '1px solid #eee' }}>
                      {art.summary}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f9f9f9', paddingTop: '24px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-primary)' }}>
                      CLAVE: {art.whyOpened}
                    </div>
                    <div style={{ display: 'flex', gap: '24px', fontSize: '11px', fontWeight: 800 }}>
                      <span style={{ opacity: 0.4 }}>COMPARAR DIFERENCIAS</span>
                      <span>LEER DETALLE AMPLIADO ↗</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SIDEBAR AREA (Sticky Navigation) */}
        <div className="sidebar" style={{ 
          flex: '0 0 30%', 
          borderLeft: 'var(--border-thin)', 
          paddingLeft: '40px',
          position: 'sticky',
          top: '40px',
          alignSelf: 'flex-start',
          height: 'fit-content'
        }}>
          
          {/* COBERTURA (Existing styled module) */}
          <div style={{ marginBottom: '56px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '1px', marginBottom: '24px', fontFamily: 'var(--font-mono)', opacity: 0.3 }}>COBERTURA DETALLADA</h4>
            <div style={{ height: '4px', background: '#f5f5f5', borderRadius: '4px', marginBottom: '24px', display: 'flex', overflow: 'hidden' }}>
              <div style={{ width: '40%', background: 'black', opacity: 0.1 }}></div>
              <div style={{ width: '45%', background: 'black' }}></div>
              <div style={{ width: '15%', background: 'black', opacity: 0.1 }}></div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ opacity: 0.6 }}>Nacional</span> <strong>28</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ opacity: 0.6 }}>Regional / Local</span> <strong>12</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ opacity: 0.6 }}>Internacional</span> <strong>8</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ opacity: 0.6 }}>Agencias</span> <strong>4</strong></div>
            </div>
          </div>

          {/* CONSENSO (Dynamic) */}
          <div style={{ marginBottom: '56px', padding: '24px', border: 'var(--border-thin)', borderRadius: '12px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '1px', marginBottom: '16px', fontFamily: 'var(--font-mono)', opacity: 0.3 }}>CONSENSO NARRATIVO</h4>
            <div style={{ fontSize: '16px', fontWeight: 800, marginBottom: '8px' }}>CONSENSO {story.consenso || 'MEDIO'}</div>
            <div style={{ fontSize: '14px', opacity: 0.5, lineHeight: '1.4' }}>{story.consensoNarrativo}</div>
            <div style={{ marginTop: '16px', fontSize: '12px', fontWeight: 800 }}>ÁNGULO: {story.angle || 'GENERAL'}</div>
          </div>

          {/* PUNTO CIEGO (Dynamic) */}
          <div style={{ marginBottom: '56px', padding: '24px', background: 'black', color: 'white', borderRadius: '12px' }}>
            <h4 style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '2px', marginBottom: '12px', opacity: 0.4 }}>PUNTO CIEGO</h4>
            <p style={{ fontSize: '16px', fontWeight: 700, lineHeight: '1.4', margin: 0 }}>
              {story.blindSpot || "Identificando omisiones narrativas en la cobertura mediática..."}
            </p>
          </div>

          {/* DISTRIBUCIÓN DE SESGO (Original BiasBar with caveat) */}
          <div style={{ marginBottom: '56px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '1px', marginBottom: '24px', fontFamily: 'var(--font-mono)', opacity: 0.3 }}>DISTRIBUCIÓN DE SESGO</h4>
            <BiasBar bias="CENTER" />
            <p style={{ fontSize: '12px', opacity: 0.3, marginTop: '16px', lineHeight: '1.4' }}>
              El sesgo describe el enfoque de cobertura preponderante, no la veracidad de los hechos reportados.
            </p>
          </div>

          {/* CONCEPTOS (Dynamic) */}
          <div style={{ marginBottom: '56px' }}>
            <h4 style={{ fontSize: '12px', fontWeight: 900, letterSpacing: '2px', marginBottom: '24px', opacity: 0.3 }}>CONCEPTOS EN TENDENCIA</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {(story.tags || ['Análisis', 'Actualidad', 'Sociedad']).map(tag => (
                <span key={tag} style={{ padding: '6px 12px', border: '1px solid #eee', fontSize: '11px', fontWeight: 800, borderRadius: '4px' }}>{tag}</span>
              ))}
            </div>
          </div>

          {/* FACT CHECK (Dynamic) */}
          <div style={{ marginBottom: '56px', padding: '24px', background: '#f5f5f5', borderRadius: '4px' }}>
            <h4 style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '1px', marginBottom: '16px', color: '#666' }}>VERIFICACIÓN TNE Intelligence</h4>
            <div style={{ fontSize: '14px', fontWeight: 800, marginBottom: '8px' }}>[✓] Verificación de Datos</div>
            <p style={{ fontSize: '12px', opacity: 0.6, margin: 0, textAlign: 'justify', lineHeight: '1.4' }}>
              {story.factCheck || "Nuestros analistas han verificado los datos principales de esta historia con fuentes oficiales y organismos independientes."}
            </p>
          </div>


          {/* ORIGEN DE LAS FUENTES (Simple list with tiny bars) */}
          <div style={{ marginBottom: '40px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '1px', marginBottom: '24px', fontFamily: 'var(--font-mono)', opacity: 0.3 }}>ORIGEN DE LAS FUENTES</h4>
            {[
              { label: 'España Nacional', pct: 68 },
              { label: 'UE / Bruselas', pct: 14 },
              { label: 'Internacional', pct: 12 }
            ].map((o, i) => (
              <div key={i} style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 700 }}>
                  <span>{o.label}</span>
                  <span style={{ opacity: 0.4 }}>{o.pct}%</span>
                </div>
                <div style={{ height: '1px', background: '#f0f0f0', marginTop: '8px' }}>
                  <div style={{ height: '100%', background: 'black', width: `${o.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* PROPIEDAD (Micro bar) */}
          <div style={{ marginBottom: '56px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '1px', marginBottom: '16px', fontFamily: 'var(--font-mono)', opacity: 0.3 }}>PROPIEDAD DE MEDIOS</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 800, marginBottom: '8px' }}>
              <span>CONCENTRACIÓN</span>
              <span>ALTA (72%)</span>
            </div>
            <div style={{ height: '4px', background: '#f5f5f5', borderRadius: '4px' }}>
              <div style={{ width: '72%', height: '100%', background: 'black' }} />
            </div>
          </div>

          {/* TEMAS SIMILARES (Dynamic) */}
          <div style={{ marginBottom: '56px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '1px', marginBottom: '24px', fontFamily: 'var(--font-mono)', opacity: 0.3 }}>TEMAS SIMILARES</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {(story.similarTopics || ['Nacional', 'Política', 'Economía']).map(topic => (
                <div key={topic} style={{ padding: '6px 14px', border: 'var(--border-thin)', borderRadius: '100px', fontSize: '12px', fontWeight: 800 }}>
                  {topic}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px' }}>
            <Plus /> <Plus />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryDetail;
