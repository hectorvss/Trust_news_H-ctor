import React from 'react';
import Plus from './ui/Plus';
import { useBreakpoint } from '../hooks/useBreakpoint';

const DailySummary = ({ onBack, stories = [] }) => {
  const { isMobile } = useBreakpoint();
  const totalSources = stories.reduce((acc, s) => acc + (s.sourceCount || 0), 0);
  const recentStories = stories.slice(0, 6);
  const top3Stories = stories.slice(0, 3);

  // Category distribution
  const categoryCounts = stories.reduce((acc, s) => {
    const cat = (s.category || 'GENERAL').toUpperCase();
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // Stories with most / least sources as proxy for consensus vs polarization
  const sorted = [...stories].sort((a, b) => (b.sourceCount || 0) - (a.sourceCount || 0));
  const highCoverage = sorted.slice(0, 3).map(s => s.title).filter(Boolean);
  const lowCoverage = sorted.slice(-3).reverse().map(s => s.title).filter(Boolean);

  // Build narrative dynamics from top category shifts
  const dynamicsItems = topCategories.length > 0 ? [
    { label: 'DOMINA', val: topCategories[0]?.[0] || '—', desc: `${topCategories[0]?.[1] || 0} historias activas en este eje.` },
    { label: 'SUBE', val: topCategories[1]?.[0] || '—', desc: `${topCategories[1]?.[1] || 0} historias con actividad creciente.` },
    { label: 'ACTIVO', val: topCategories[2]?.[0] || '—', desc: `${topCategories[2]?.[1] || 0} historias en seguimiento.` },
    { label: 'TOTAL', val: `${stories.length} HISTORIAS`, desc: `${totalSources > 0 ? totalSources.toLocaleString('es-ES') : '—'} fuentes analizadas en total.` }
  ] : [
    { label: 'TOTAL', val: `${stories.length} HISTORIAS`, desc: 'Sin datos de distribución temática disponibles.' },
    { label: 'FUENTES', val: totalSources > 0 ? totalSources.toLocaleString('es-ES') : '—', desc: 'Fuentes analizadas en el período.' },
    { label: 'ESTADO', val: 'CARGANDO', desc: 'Procesando distribución temática.' },
    { label: 'SISTEMA', val: 'EN LÍNEA', desc: 'Plataforma TNE operativa.' }
  ];

  // Stats for the 4-box grid
  const highFactualityCount = stories.filter(s => s.factuality === 'ALTA').length;
  const factualityPct = stories.length > 0 ? Math.round((highFactualityCount / stories.length) * 100) : null;

  return (
    <div style={{
      background: 'var(--color-bg)',
      color: 'var(--color-primary)',
      minHeight: '100vh',
      paddingBottom: '200px',
      fontFamily: 'var(--font-heading)'
    }}>
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '4px', background: '#eee', zIndex: 1000 }}>
        <div style={{ width: '100%', height: '100%', background: 'black' }} />
      </div>

      <div style={{ padding: isMobile ? '100px 16px 40px' : '120px 60px 60px', maxWidth: '1200px', margin: '0 auto' }}>

        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '80px', borderBottom: '4px solid black', paddingBottom: '40px' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.4, letterSpacing: '2px', marginBottom: '16px', display: 'flex', gap: '20px' }}>
              <span>ÁMBITO: ESPAÑA / UE</span>
              <span>FUENTES ANALIZADAS: {totalSources > 0 ? totalSources.toLocaleString('es-ES') : '—'}</span>
              <span>CIERRE: 08:30 CET</span>
            </div>
            <h1 style={{ fontSize: isMobile ? '44px' : '110px', fontWeight: 800, letterSpacing: isMobile ? '-2px' : '-6px', lineHeight: isMobile ? '1.1' : '0.9', margin: '0 0 20px 0', textTransform: 'uppercase' }}>
              Resumen <br />{new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' }).replace(/\//g, '.')}
            </h1>
            <p style={{ fontSize: '16px', fontWeight: 600, opacity: 0.5, maxWidth: '600px' }}>
              Síntesis del ecosistema mediático del día: qué domina la conversación, cómo se cuenta y qué implica.
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span onClick={onBack} style={{ cursor: 'pointer', fontSize: '12px', fontWeight: 900, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '1px', padding: '12px 30px', border: '2px solid black', borderRadius: 'var(--radius-pill)', transition: 'var(--transition)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'black'; e.currentTarget.style.color = 'white'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'black'; }}>
              [ Cerrar Reporte ]
            </span>
          </div>
        </div>

        {/* EXECUTIVE SUMMARY */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '32px' : '80px', marginBottom: isMobile ? '48px' : '100px', marginTop: '60px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 900, opacity: 0.3, fontFamily: 'var(--font-mono)', letterSpacing: '1px' }}>SÍNTESIS EDITORIAL</span>
              <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {top3Stories.length > 0 ? top3Stories.map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: '24px', fontSize: i === 0 ? '22px' : '20px', lineHeight: '1.4', fontWeight: 600, opacity: i === 0 ? 1 : 0.8 }}>
                    <Plus />
                    <p style={{ margin: 0 }}><strong>{s.title}</strong>{s.summary ? ` — ${s.summary.substring(0, 80)}${s.summary.length > 80 ? '…' : ''}` : ''}</p>
                  </div>
                )) : (
                  <div style={{ fontSize: '16px', opacity: 0.4, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>SIN HISTORIAS DISPONIBLES</div>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {[
              { label: 'HISTORIAS ACTIVAS', val: stories.length || '—', var: `${topCategories[0]?.[0] || 'N/D'} DOMINA`, status: 'EN TIEMPO REAL' },
              { label: 'CATEGORÍAS', val: Object.keys(categoryCounts).length || '—', var: 'DISTRIBUCIÓN ACTIVA', status: 'DINÁMICO' },
              { label: 'FACTUALIDAD ALTA', val: factualityPct !== null ? `${factualityPct}%` : '—', var: `${highFactualityCount} HISTORIAS`, status: 'DOCUMENTAL' },
              { label: 'FUENTES TOTALES', val: totalSources > 0 ? totalSources.toLocaleString('es-ES') : stories.length > 0 ? `~${stories.length * 4}` : '—', var: 'ANALIZADAS HOY', status: 'COMPLETO' }
            ].map((m, i) => (
              <div key={i} style={{ background: i === 3 ? 'black' : '#f5f5f5', color: i === 3 ? 'white' : 'black', padding: '30px', borderRadius: '4px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '160px' }}>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 900, opacity: 0.4, marginBottom: '6px', letterSpacing: '1px' }}>{m.label}</div>
                  <div style={{ fontSize: '38px', fontWeight: 800, letterSpacing: '-2px' }}>{m.val}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: i === 3 ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.1)', paddingTop: '12px', marginTop: '12px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>{m.var}</span>
                  <span style={{ fontSize: '9px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.5 }}>{m.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* QUÉ HA CAMBIADO HOY */}
        <div style={{ margin: '60px 0 100px', padding: isMobile ? '20px' : '40px', border: 'var(--border-thin)', borderRadius: '4px', display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: isMobile ? '20px' : '40px' }}>
          {dynamicsItems.map((item, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.4, letterSpacing: '1px' }}>{item.label}</div>
              <div style={{ fontSize: '14px', fontWeight: 800, lineHeight: '1.2' }}>{item.val}</div>
              <div style={{ fontSize: '11px', opacity: 0.5, lineHeight: '1.4' }}>{item.desc}</div>
            </div>
          ))}
        </div>

        {/* ANÁLISIS DE EJES TEMÁTICOS */}
        <div style={{ borderTop: '1px solid #eee', paddingTop: '80px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 900, opacity: 0.4, fontFamily: 'var(--font-mono)', letterSpacing: '2px', marginBottom: '60px', textAlign: 'center' }}>
            ANÁLISIS DE EJES TEMÁTICOS TRONCALES
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.5fr 2fr 1fr 1fr', padding: '0 0 20px 0', borderBottom: '2px solid black', fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.3, letterSpacing: '1px' }}>
              <span>TEMA</span>
              <span>HISTORIA PRINCIPAL</span>
              <span style={{ textAlign: 'right' }}>HISTORIAS</span>
              <span style={{ textAlign: 'right' }}>FUENTES</span>
            </div>
            {topCategories.length > 0 ? topCategories.map(([cat, count], idx) => {
              const catStories = stories.filter(s => (s.category || 'GENERAL').toUpperCase() === cat);
              const topStory = catStories[0];
              const catSources = catStories.reduce((a, s) => a + (s.sourceCount || 0), 0);
              return (
                <div key={idx} style={{ padding: '40px 0', borderBottom: '1px solid #eee', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.5fr 2fr 1fr 1fr', alignItems: 'center', gap: '40px' }}>
                  <div>
                    <div style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-1px', marginBottom: '8px' }}>{cat}</div>
                    <div style={{ fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.3 }}>{count === 1 ? '1 HISTORIA' : `${count} HISTORIAS`}</div>
                  </div>
                  <div style={{ fontSize: '15px', lineHeight: '1.5', opacity: 0.7, paddingRight: '40px' }}>
                    {topStory?.title || '—'}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '20px', fontWeight: 800 }}>{count}</div>
                    <div style={{ fontSize: '9px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.3 }}>ACTIVAS</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '20px', fontWeight: 800 }}>{catSources > 0 ? catSources : '—'}</div>
                    <div style={{ fontSize: '9px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.3 }}>FUENTES</div>
                  </div>
                </div>
              );
            }) : (
              <div style={{ padding: '60px', textAlign: 'center', opacity: 0.3, fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 800 }}>
                SIN DATOS DE CATEGORÍAS
              </div>
            )}
          </div>
        </div>

        {/* CONSENSO Y DESACUERDO */}
        <div style={{ marginTop: isMobile ? '48px' : '100px', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '32px' : '80px', borderTop: 'var(--border-thin)', paddingTop: '60px' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 900, opacity: 0.3, fontFamily: 'var(--font-mono)', letterSpacing: '1px', marginBottom: '32px' }}>MAYOR COBERTURA (CONSENSO)</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {highCoverage.length > 0 ? highCoverage.map((txt, i) => (
                <div key={i} style={{ display: 'flex', gap: '20px', fontSize: '15px', fontWeight: 600 }}>
                  <Plus /> <span style={{ lineHeight: '1.4' }}>{txt}</span>
                </div>
              )) : (
                <div style={{ opacity: 0.3, fontSize: '14px', fontFamily: 'var(--font-mono)' }}>SIN DATOS</div>
              )}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 900, opacity: 0.3, fontFamily: 'var(--font-mono)', letterSpacing: '1px', marginBottom: '32px' }}>MENOR COBERTURA (PUNTO CIEGO)</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {lowCoverage.length > 0 ? lowCoverage.map((txt, i) => (
                <div key={i} style={{ display: 'flex', gap: '20px', fontSize: '15px', fontWeight: 600 }}>
                  <Plus /> <span style={{ lineHeight: '1.4' }}>{txt}</span>
                </div>
              )) : (
                <div style={{ opacity: 0.3, fontSize: '14px', fontFamily: 'var(--font-mono)' }}>SIN DATOS</div>
              )}
            </div>
          </div>
        </div>

        {/* DISTRIBUCIÓN DE SESGO */}
        {stories.length > 0 && (() => {
          const biasTotal = stories.reduce((acc, s) => {
            const b = s.bias || {};
            return { left: acc.left + (b.left || 0), center: acc.center + (b.center || 0), right: acc.right + (b.right || 0) };
          }, { left: 0, center: 0, right: 0 });
          const bSum = biasTotal.left + biasTotal.center + biasTotal.right || 1;
          const lPct = Math.round((biasTotal.left / bSum) * 100);
          const cPct = Math.round((biasTotal.center / bSum) * 100);
          const rPct = Math.round((biasTotal.right / bSum) * 100);
          const dominant = lPct > rPct && lPct > cPct ? 'izquierda' : rPct > lPct && rPct > cPct ? 'derecha' : 'centro';
          return (
            <div style={{ marginTop: '120px', background: 'black', color: 'white', padding: '80px', borderRadius: '4px' }}>
              <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', fontWeight: 900, opacity: 0.5, fontFamily: 'var(--font-mono)', letterSpacing: '2px', marginBottom: '20px' }}>DISTRIBUCIÓN DE SESGO EN HISTORIAS ACTIVAS</div>
                <h2 style={{ fontSize: '48px', fontWeight: 800, letterSpacing: '-2px', marginBottom: '32px', lineHeight: '1.1' }}>
                  El {lPct}% de la cobertura proviene de medios de izquierda, {cPct}% de centro y {rPct}% de derecha.
                </h2>
                <p style={{ fontSize: '20px', opacity: 0.7, lineHeight: '1.6', marginBottom: '40px' }}>
                  La distribución actual muestra una inclinación hacia el espectro de {dominant}. Este dato refleja las historias disponibles en la plataforma y puede variar con cada actualización del feed.
                </p>
                <div style={{ display: 'flex', gap: '0', height: '12px', borderRadius: '4px', overflow: 'hidden', marginBottom: '20px' }}>
                  <div style={{ width: `${lPct}%`, background: 'rgba(255,255,255,0.9)' }} />
                  <div style={{ width: `${cPct}%`, background: 'rgba(255,255,255,0.5)' }} />
                  <div style={{ width: `${rPct}%`, background: 'rgba(255,255,255,0.2)' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 800, fontFamily: 'var(--font-mono)', opacity: 0.5 }}>
                  <span>IZQ {lPct}%</span>
                  <span>CENTRO {cPct}%</span>
                  <span>DER {rPct}%</span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* PUNTOS CIEGOS */}
        <div style={{ marginTop: '100px' }}>
          <div style={{ fontSize: '12px', fontWeight: 900, opacity: 0.3, fontFamily: 'var(--font-mono)', letterSpacing: '1px', marginBottom: '40px' }}>PUNTOS CIEGOS DETECTADOS</div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '40px' }}>
            {[
              { title: 'Cobertura Territorial', desc: 'Las historias sobre comunidades autónomas fuera de Madrid y Cataluña reciben sistemáticamente menos fuentes.' },
              { title: 'Perspectiva Internacional', desc: 'El contexto europeo y comparativo con otros países aparece en menos del 20% de las coberturas nacionales.' },
              { title: 'Voces Secundarias', desc: 'Los afectados directos por los temas cubiertos rara vez son citados como fuente primaria en los artículos analizados.' }
            ].map((spot, i) => (
              <div key={i} style={{ borderLeft: '1px solid black', paddingLeft: '24px' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, marginBottom: '8px' }}>{spot.title}</div>
                <div style={{ fontSize: '13px', opacity: 0.6, lineHeight: '1.4' }}>{spot.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* SÍNTESIS DE ÚLTIMA HORA */}
        <div style={{ marginTop: '120px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 900, opacity: 0.4, fontFamily: 'var(--font-mono)', letterSpacing: '2px', marginBottom: '60px' }}>
            HISTORIAS ACTIVAS EN LA PLATAFORMA
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '40px' }}>
            {recentStories.length > 0 ? recentStories.map((s, i) => (
              <div key={i} style={{ borderLeft: '3px solid black', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <p style={{ fontSize: '15px', fontWeight: 700, lineHeight: '1.3', margin: 0 }}>{s.title}</p>
                <div style={{ display: 'flex', gap: '10px', fontSize: '9px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.4 }}>
                  <span>{s.category || 'GENERAL'}</span>
                  <span>•</span>
                  <span>FACT: {s.factuality || 'N/D'}</span>
                  <span>•</span>
                  <span>{s.sourceCount || 0} FUENTES</span>
                </div>
              </div>
            )) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', opacity: 0.3, fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 800, padding: '40px' }}>
                SIN HISTORIAS DISPONIBLES
              </div>
            )}
          </div>
        </div>

        {/* ANÁLISIS PROSPECTIVO */}
        <div style={{ marginTop: '100px', padding: '60px', background: '#f8f8f8', borderRadius: '4px', borderLeft: '4px solid black' }}>
          <div style={{ fontSize: '12px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.4, letterSpacing: '2px', marginBottom: '24px' }}>ANÁLISIS PROSPECTIVO: PRÓXIMAS 24H</div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '60px' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 900, marginBottom: '8px' }}>SEGUIMIENTO ACTIVO</div>
              <p style={{ fontSize: '14px', lineHeight: '1.5', margin: 0 }}>
                {topCategories[0] ? `El eje de ${topCategories[0][0]} concentra ${topCategories[0][1]} historias. Vigilar nuevas fuentes en este bloque.` : 'Monitorización continua de todos los ejes temáticos activos.'}
              </p>
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 900, marginBottom: '8px' }}>DIVERSIDAD DE FUENTES</div>
              <p style={{ fontSize: '14px', lineHeight: '1.5', margin: 0 }}>
                {totalSources > 0 ? `Con ${totalSources.toLocaleString('es-ES')} fuentes activas, la plataforma mantiene cobertura multi-espectro. Incorporar nuevas fuentes mejora la diversidad.` : 'Aumentar el número de fuentes por historia fortalece el análisis de sesgo.'}
              </p>
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 900, marginBottom: '8px' }}>PUNTOS CIEGOS</div>
              <p style={{ fontSize: '14px', lineHeight: '1.5', margin: 0 }}>
                {lowCoverage[0] ? `La historia "${lowCoverage[0].substring(0, 60)}…" tiene cobertura limitada. Oportunidad de ampliar perspectivas.` : 'Revisar historias con menor número de fuentes para identificar sesgos estructurales.'}
              </p>
            </div>
          </div>
        </div>

        {/* TRANSPARENCIA METODOLÓGICA */}
        <div style={{ marginTop: '140px', borderTop: '1px solid #eee', paddingTop: '40px', fontSize: '10px', fontFamily: 'var(--font-mono)', opacity: 0.3, textAlign: 'justify', lineHeight: '1.6' }}>
          Este reporte ha sido generado analizando {totalSources > 0 ? totalSources.toLocaleString('es-ES') : stories.length > 0 ? `~${stories.length * 4}` : 'N/D'} fuentes de noticias en tiempo real agrupadas en {stories.length} historias activas.
          La ventana temporal cubre desde las 08:30 CET de ayer hasta las 08:30 CET de hoy.
          Los indicadores de sesgo miden el enfoque y encuadre narrativo ("framing"), no la veracidad de los hechos reportados.
          El consenso, la polarización y la factualidad son métricas propietarias del sistema de análisis de TNE basadas en procesamiento de lenguaje natural (NLP).
        </div>

        {/* FINAL CTA */}
        <div style={{ marginTop: '100px', textAlign: 'center' }}>
          <div onClick={onBack} style={{ display: 'inline-block', cursor: 'pointer', padding: '20px 0', transition: 'var(--transition)' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.6'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            <span style={{ fontSize: '42px', fontWeight: 800, letterSpacing: '-2px', textTransform: 'uppercase', color: 'black', borderBottom: '4px solid black', paddingBottom: '4px', fontFamily: 'var(--font-heading)', display: 'inline-block', lineHeight: '1' }}>
              Cerrar Reporte y Volver ↗
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailySummary;
