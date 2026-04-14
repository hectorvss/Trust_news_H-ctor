import React, { useState } from 'react';
import BiasBar from './BiasBar';

const Plus = () => <span style={{ fontSize: '18px', opacity: 0.3, fontWeight: 700 }}>+</span>;

const StoryDetail = ({ story, onBack, activeFilter, setActiveFilter, activeTab, setActiveTab }) => {
  if (!story) return null;
  const [perspective, setPerspective] = useState('CENTER');


  // Unified metadata for the story
  const metadata = {
    status: "CONFIRMADA",
    published: "HACE 2 HORAS",
    updated: "HACE 14 MIN",
    region: "ESPAÑA / UE",
    theme: "VIVIENDA / ECONOMÍA",
    type: "ANÁLISIS GNE",
    factualidad: "ALTA",
    consenso: "MEDIO",
    impacto: "ALTO",
    fuentes: 86
  };

  const allArticles = [
    { 
      source: "EL PAÍS", bias: "CENTER", fact: "ALTA", time: "Hace 2h", origin: "Nacional", 
      type: "Análisis", tone: "Neutro", angle: "Económico", author: "M. Jiménez",
      summary: "Explica cómo el decreto intenta desvincular el IPC del precio del alquiler sin mermar la inversión.",
      whyOpened: "Aporta la visión técnica y regulatoria más completa.",
      diff: "Aporta contexto macroeconómico y regulatorio." 
    },
    { 
      source: "ABC", bias: "RIGHT", fact: "ALTA", time: "Hace 4h", origin: "Nacional", 
      type: "Noticia", tone: "Crítico", angle: "Jurídico", author: "L. Fernández",
      summary: "Critica la falta de blindaje para el pequeño propietario y el riesgo de retirada de oferta.",
      whyOpened: "Enfoque crítico desde la seguridad jurídica y el derecho a la propiedad.",
      diff: "Enfatiza la inseguridad jurídica del propietario." 
    },
    { 
      source: "EL DIARIO", bias: "LEFT", fact: "ALTA", time: "Hace 5h", origin: "Nacional", 
      type: "Reportaje", tone: "Interpretativo", angle: "Social", author: "I. Blanco",
      summary: "Centrado en el alivio que supone la medida para barrios con gentrificación acelerada.",
      whyOpened: "Ideal para entender el impacto social en el inquilino vulnerable.",
      diff: "Prioriza el acceso y derechos del inquilino." 
    },
    { 
      source: "EL MUNDO", bias: "RIGHT", fact: "ALTA", time: "Hace 7h", origin: "Nacional", 
      type: "Análisis", tone: "Crítico", angle: "Mercado", author: "J. Sánchez",
      summary: "Advierte de una posible contracción del 15% en la oferta de alquiler a corto plazo.",
      whyOpened: "Análisis de impacto directo en el mercado y la oferta inmobiliaria.",
      diff: "Analiza la posible contracción de la oferta." 
    },
  ];

  const filteredArticles = activeFilter === 'TODO' 
    ? allArticles 
    : allArticles.filter(art => art.bias === activeFilter);

  return (
    <div className="story-detail" style={{ background: '#fff', color: '#000' }}>
      
      {/* 1. PRIMARY INTELLIGENCE INDICATORS (TOP HEADER) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: 'var(--border-thin)', paddingBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span onClick={onBack} style={{ cursor: 'pointer', fontSize: '11px', fontWeight: 800, fontFamily: 'var(--font-mono)', marginRight: '12px' }}>← REGRESAR</span>
          {[
            { label: 'FACTUALIDAD', val: 'ALTA' },
            { label: 'COBERTURA', val: 'MIXTA' },
            { label: 'CONSENSO', val: 'MEDIO' },
            { label: 'FUENTES', val: '86' },
            { label: 'IMPACTO', val: 'ALTO' }
          ].map((pill, i) => (
            <div key={i} style={{ padding: '4px 12px', background: '#f5f5f5', borderRadius: '4px', fontSize: '10px', fontWeight: 800, fontFamily: 'var(--font-mono)', display: 'flex', gap: '6px' }}>
              <span style={{ opacity: 0.3 }}>{pill.label}:</span>
              <span>{pill.val}</span>
            </div>
          ))}
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <svg style={{ opacity: 0.4, cursor: 'pointer' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          <svg style={{ opacity: 0.4, cursor: 'pointer' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
          <svg style={{ opacity: 0.4, cursor: 'pointer' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
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
            {['RESUMEN', '+ INFO', 'CONTEXTO', 'IMPACTO', 'COBERTURA', 'DATOS', 'CRONOLOGÍA', 'FUENTES', 'CLAVES'].map(t => (
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
                  <div style={{ fontSize: '10px', fontWeight: 800, opacity: 0.3, marginBottom: '16px', letterSpacing: '1px' }}>QUÉ HA PASADO</div>
                  <div style={{ display: 'flex', gap: '24px', fontSize: '19px', lineHeight: '1.5' }}>
                    <Plus /> <p style={{ margin: 0 }}>El Gobierno aprueba el decreto que limita el incremento de los alquileres al 3% para zonas tensionadas durante 2024.</p>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 800, opacity: 0.3, marginBottom: '16px', letterSpacing: '1px' }}>QUÉ CAMBIA</div>
                  <div style={{ display: 'flex', gap: '24px', fontSize: '19px', lineHeight: '1.5' }}>
                    <Plus /> <p style={{ margin: 0 }}>Se elimina la vinculación directa al IPC, afectando a más de 2 millones de contratos vigentes en España.</p>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 800, opacity: 0.3, marginBottom: '16px', letterSpacing: '1px' }}>QUÉ NO ESTÁ CLARO SIN EMBARGO</div>
                  <div style={{ display: 'flex', gap: '24px', fontSize: '19px', lineHeight: '1.5' }}>
                    <Plus /> <p style={{ margin: 0 }}>La implementación en regiones que no han declarado zonas tensionadas y las sanciones por incumplimiento.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === '+ INFO' && (
              <div>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '40px' }}>
                  <div style={{ display: 'flex', border: '1px solid black', borderRadius: '100px', overflow: 'hidden' }}>
                    {['LEFT', 'CENTER', 'RIGHT'].map(p => (
                      <div 
                        key={p} 
                        onClick={() => setPerspective(p)}
                        style={{ 
                          padding: '8px 24px', 
                          fontSize: '11px', 
                          fontWeight: 800, 
                          fontFamily: 'var(--font-mono)', 
                          cursor: 'pointer',
                          background: perspective === p ? 'black' : 'transparent',
                          color: perspective === p ? 'white' : 'black',
                          borderRight: p !== 'RIGHT' ? '1px solid black' : 'none'
                        }}
                      >
                        {p}
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: '8px 24px', border: '1px solid black', borderRadius: '100px', fontSize: '11px', fontWeight: 800, fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>
                    COMPARAR COBERTURA
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', fontSize: '17px', lineHeight: '1.7', fontWeight: 400 }}>
                  <div style={{ display: 'flex', gap: '24px' }}>
                    <div style={{ minWidth: '8px', height: '8px', background: 'black', borderRadius: '50%', marginTop: '10px' }} />
                    <p style={{ margin: 0 }}>El Consejo de Ministros ha dado luz verde final a la Ley por el Derecho a la Vivienda, una de las normativas más complejas y debatidas de la actual legislatura. Tras meses de negociaciones internas en la coalición de Gobierno y un intenso trámite parlamentario, la ley introduce instrumentos jurídicos sin precedentes en España para tratar de contener los precios del mercado inmobiliario.</p>
                  </div>
                  <div style={{ display: 'flex', gap: '24px' }}>
                    <div style={{ minWidth: '8px', height: '8px', background: 'black', borderRadius: '50%', marginTop: '10px' }} />
                    <p style={{ margin: 0 }}>El núcleo de la ley es la capacidad otorgada a las comunidades autónomas para declarar "zonas tensionadas". En estas áreas, donde el coste de la vivienda supere el 30% del presupuesto medio de los hogares, se aplicarán sistemas de control de precios. Para los nuevos contratos en estas zonas, la renta no podrá exceder el precio del contrato anterior, más un pequeño incremento permitido por ley.</p>
                  </div>
                  <div style={{ display: 'flex', gap: '24px' }}>
                    <div style={{ minWidth: '8px', height: '8px', background: 'black', borderRadius: '50%', marginTop: '10px' }} />
                    <p style={{ margin: 0 }}>La normativa establece una distinción fundamental entre "pequeños tenedores" y "grandes tenedores". Estos últimos, definidos como aquellos propietarios con más de cinco o diez viviendas (según decida cada comunidad), tendrán restricciones adicionales basadas en un índice de precios de referencia. El objetivo declarado por el Ministerio de Agenda Urbana es "terminar con la burbuja del alquiler que expulsa a los jóvenes de las ciudades".</p>
                  </div>
                  <div style={{ display: 'flex', gap: '24px' }}>
                    <div style={{ minWidth: '8px', height: '8px', background: 'black', borderRadius: '50%', marginTop: '10px' }} />
                    <p style={{ margin: 0 }}>En cuanto a los incentivos, la ley contempla una serie de bonificaciones fiscales en el IRPF para aquellos propietarios que rebajen el precio del alquiler en zonas tensionadas, busquen alquilar a jóvenes de entre 18 y 35 años o pongan su vivienda en alquiler social. Se estima que estas rebajas fiscales podrían llegar hasta el 90% en casos específicos.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'CONTEXTO' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 800, opacity: 0.3, marginBottom: '16px', letterSpacing: '1px' }}>EL ORIGEN DEL PROBLEMA</div>
                  <div style={{ display: 'flex', gap: '24px', fontSize: '17px', lineHeight: '1.6', fontWeight: 500 }}>
                    <Plus /> 
                    <p style={{ margin: 0 }}>Desde 2018, los precios del alquiler en las grandes capitales españolas han crecido un 45% más que el SMI promedio, creando una brecha de accesibilidad histórica.</p>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 800, opacity: 0.3, marginBottom: '16px', letterSpacing: '1px' }}>PRECEDENTES LEGISLATIVOS</div>
                  <div style={{ display: 'flex', gap: '24px', fontSize: '17px', lineHeight: '1.6', fontWeight: 500 }}>
                    <Plus /> 
                    <p style={{ margin: 0 }}>La Ley de Vivienda de 2023 sentó las bases, pero la inflación descontrolada de finales de año forzó al ejecutivo a buscar un mecanismo de control más agresivo y directo.</p>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 800, opacity: 0.3, marginBottom: '16px', letterSpacing: '1px' }}>SITUACIÓN ACTUAL</div>
                  <div style={{ display: 'flex', gap: '24px', fontSize: '17px', lineHeight: '1.6', fontWeight: 500 }}>
                    <Plus /> 
                    <p style={{ margin: 0 }}>España se sitúa como uno de los países de la UE con menor parque de vivienda pública (menos del 3%), lo que traslada toda la presión del mercado al sector privado.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'IMPACTO' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: 800, opacity: 0.3, marginBottom: '16px', letterSpacing: '1px' }}>IMPACTO SOCIAL DIRECTO</div>
                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      <li style={{ fontSize: '16px', lineHeight: '1.5', fontWeight: 600 }}><Plus /> Alivio inmediato para familias con rentas medias-bajas en Madrid, Barcelona y Málaga.</li>
                      <li style={{ fontSize: '16px', lineHeight: '1.5', fontWeight: 600 }}><Plus /> Aumento de la tasa de emancipación juvenil al reducirse la incertidumbre sobre renovaciones.</li>
                    </ul>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: 800, opacity: 0.3, marginBottom: '16px', letterSpacing: '1px' }}>RIESGOS DE MERCADO</div>
                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      <li style={{ fontSize: '16px', lineHeight: '1.5', fontWeight: 600 }}><Plus /> Posible fuga de capital inversor hacia el mercado de alquiler de temporada o locales.</li>
                      <li style={{ fontSize: '16px', lineHeight: '1.5', fontWeight: 600 }}><Plus /> Menor mantenimiento de inmuebles al reducirse el margen de beneficio de los propietarios.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'COBERTURA' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' }}>
                  {[
                    { label: 'IZQUIERDA', desc: 'Enfoque centrado en la protección del inquilino y el derecho a la vivienda como bien social.' },
                    { label: 'CENTRO', desc: 'Análisis de la estabilidad del mercado y el impacto en la inflación general.' },
                    { label: 'DERECHA', desc: 'Foco en el derecho a la propiedad y la posible contracción de la oferta de alquiler.' }
                  ].map((block, i) => (
                    <div key={i}>
                      <div style={{ fontSize: '10px', fontWeight: 800, marginBottom: '16px', opacity: 0.3 }}>{block.label}</div>
                      <div style={{ fontSize: '15px', lineHeight: '1.5', fontWeight: 500 }}>{block.desc}</div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '24px', border: '1px solid black', borderRadius: '12px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 800, marginBottom: '12px', opacity: 0.3 }}>CONSENSO NARRATIVO</div>
                  <div style={{ fontSize: '16px', fontWeight: 600 }}>Toda la prensa coincide en que la medida es de carácter urgente y electoralista, independientemente del juicio sobre su eficacia técnica.</div>
                </div>
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

            {activeTab === 'CRONOLOGÍA' && (
              <div style={{ paddingLeft: '20px', borderLeft: '2px solid black' }}>
                {[
                  { date: '12 ENE', title: 'Propuesta en el Consejo', desc: 'El Ministerio presenta el borrador inicial ante los socios de coalición.' },
                  { date: '24 FEB', title: 'Acuerdo Técnico', desc: 'Se cierran las excepciones para pequeños propietarios.' },
                  { date: '15 MAR', title: 'Aprobación Decreto', desc: 'Luz verde oficial en el Consejo de Ministros.' },
                  { date: '16 MAR', title: 'Entrada en Vigor', desc: 'Publicación en el BOE.' }
                ].map((e, i) => (
                  <div key={i} style={{ marginBottom: '40px', position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '-27px', top: '0', width: '12px', height: '12px', background: 'black', borderRadius: '50%' }} />
                    <div style={{ fontSize: '11px', fontWeight: 800, fontFamily: 'var(--font-mono)', opacity: 0.3, marginBottom: '8px' }}>{e.date}</div>
                    <div style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px' }}>{e.title}</div>
                    <div style={{ fontSize: '15px', opacity: 0.6, lineHeight: '1.4' }}>{e.desc}</div>
                  </div>
                ))}
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

          {/* CONSENSO (Enriched internally) */}
          <div style={{ marginBottom: '56px', padding: '24px', border: 'var(--border-thin)', borderRadius: '12px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '1px', marginBottom: '16px', fontFamily: 'var(--font-mono)', opacity: 0.3 }}>CONSENSO NARRATIVO</h4>
            <div style={{ fontSize: '16px', fontWeight: 800, marginBottom: '8px' }}>CONSENSO {metadata.consenso}</div>
            <div style={{ fontSize: '14px', opacity: 0.5, lineHeight: '1.4' }}>Fuerte consenso sobre el límite porcentual; desacuerdo alto en la definición de zonas tensionadas.</div>
            <div style={{ marginTop: '16px', fontSize: '12px', fontWeight: 800 }}>ÁNGULO: ECONÓMICO</div>
          </div>

          {/* PUNTO CIEGO (Kept minimal as requested) */}
          <div style={{ marginBottom: '56px', padding: '24px', background: 'black', color: 'white', borderRadius: '12px' }}>
            <h4 style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '2px', marginBottom: '12px', opacity: 0.4 }}>PUNTO CIEGO</h4>
            <p style={{ fontSize: '16px', fontWeight: 700, lineHeight: '1.4', margin: 0 }}>
              Escasa cobertura sobre el impacto de la ley en el mercado de herencias inmobiliarias.
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

          {/* TEMAS SIMILARES (Chips) */}
          <div style={{ marginBottom: '56px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '1px', marginBottom: '24px', fontFamily: 'var(--font-mono)', opacity: 0.3 }}>TEMAS SIMILARES</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {['Vivienda', 'IBEX 35', 'Fiscalidad', 'Regulación UE'].map(topic => (
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
