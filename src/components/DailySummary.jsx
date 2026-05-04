import React from 'react';
import Plus from './ui/Plus';

const DailySummary = ({ onBack }) => {
  return (
    <div style={{ 
      background: 'var(--color-bg)', 
      color: 'var(--color-primary)', 
      minHeight: '100vh', 
      paddingBottom: '200px',
      fontFamily: 'var(--font-heading)'
    }}>
      {/* 0. PROGRESS BAR (Daily Completeness) */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '4px', background: '#eee', zIndex: 1000 }}>
        <div style={{ width: '100%', height: '100%', background: 'black' }}></div>
      </div>

      {/* 1. HEADER (Already Updated) */}
      <div style={{ 
        padding: '120px 60px 60px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'baseline',
          marginBottom: '80px',
          borderBottom: '4px solid black',
          paddingBottom: '40px'
        }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.4, letterSpacing: '2px', marginBottom: '16px', display: 'flex', gap: '20px' }}>
              <span>ÁMBITO: ESPAÑA / UE</span>
              <span>FUENTES ANALIZADAS: 1,420</span>
              <span>CIERRE: 08:30 CET</span>
            </div>
            <h1 style={{ fontSize: '110px', fontWeight: 800, letterSpacing: '-6px', lineHeight: '0.9', margin: '0 0 20px 0', textTransform: 'uppercase' }}>
              Resumen <br/>15.04.24
            </h1>
            <p style={{ fontSize: '16px', fontWeight: 600, opacity: 0.5, maxWidth: '600px' }}>
              Síntesis del ecosistema mediático del día: qué domina la conversación, cómo se cuenta y qué implica.
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span 
              onClick={onBack}
              style={{ 
                cursor: 'pointer', 
                fontSize: '12px', 
                fontWeight: 900, 
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                padding: '12px 30px',
                border: '2px solid black',
                borderRadius: 'var(--radius-pill)',
                transition: 'var(--transition)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'black'; e.currentTarget.style.color = 'white'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'black'; }}
            >
              [ Cerrar Reporte ]
            </span>
          </div>
        </div>

        {/* 2. EXECUTIVE SUMMARY BOX (STRUCTURED) */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '80px',
          marginBottom: '100px',
          marginTop: '60px'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 900, opacity: 0.3, fontFamily: 'var(--font-mono)', letterSpacing: '1px' }}>SÍNTESIS EDITORIAL</span>
              <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', gap: '24px', fontSize: '22px', lineHeight: '1.4', fontWeight: 600 }}>
                  <Plus /> <p style={{ margin: 0 }}>Hoy domina la conversación sobre la <strong>ratificación de la Ley de Vivienda</strong> y su implementación inmediata.</p>
                </div>
                <div style={{ display: 'flex', gap: '24px', fontSize: '20px', lineHeight: '1.5', opacity: 0.8 }}>
                  <Plus /> <p style={{ margin: 0 }}>Los medios de centro-izquierda enfatizan la <strong>protección social</strong>, mientras la prensa conservadora prioriza el riesgo de <strong>inseguridad jurídica</strong>.</p>
                </div>
                <div style={{ display: 'flex', gap: '24px', fontSize: '20px', lineHeight: '1.5', opacity: 0.8 }}>
                  <Plus /> <p style={{ margin: 0 }}>El consenso nacional sobre el PIB se mantiene sólido, permitiendo que la vivienda absorba el capital de <strong>polarización política</strong> del día.</p>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {[
              { label: 'POLARIZACIÓN MEDIA', val: '64%', var: '+8% VS AYER', status: 'CRECIENTE' },
              { label: 'CONSENSO NACIONAL', val: '84%', var: 'ESTABLE', status: 'SÓLIDO' },
              { label: 'FACTUALIDAD DOMINANTE', val: 'ALTA', var: 'GRADO A', status: 'DOCUMENTAL' },
              { label: 'FUENTES ANALIZADAS', val: '1,420', var: '+128 VS AYER', status: 'COMPLETO' }
            ].map((m, i) => (
              <div key={i} style={{ 
                background: i === 3 ? 'black' : '#f5f5f5', 
                color: i === 3 ? 'white' : 'black',
                padding: '30px', 
                borderRadius: '4px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '160px'
              }}>
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

        {/* 3. QUÉ HA CAMBIADO HOY (NARRATIVE DYNAMICS) */}
        <div style={{ 
          margin: '60px 0 100px', 
          padding: '40px', 
          border: 'var(--border-thin)', 
          borderRadius: '4px',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '40px'
        }}>
          {[
            { label: 'SUBE', val: 'INSEGURIDAD JURÍDICA', desc: 'Aumento del 25% en medios conservadores.' },
            { label: 'BAJA', val: 'ENFOQUE FISCAL', desc: 'Pierde tracción frente al debate social.' },
            { label: 'NUEVO', val: 'IMPACTO PEQUEÑOS PROPIETARIOS', desc: 'Emerge una nueva narrativa de vulnerabilidad.' },
            { label: 'CONSOLIDA', val: 'PRESIÓN ALQUILER', desc: 'Consenso sobre la gravedad del acceso.' }
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.4, letterSpacing: '1px' }}>{item.label}</div>
              <div style={{ fontSize: '14px', fontWeight: 800, lineHeight: '1.2' }}>{item.val}</div>
              <div style={{ fontSize: '11px', opacity: 0.5, lineHeight: '1.4' }}>{item.desc}</div>
            </div>
          ))}
        </div>

        {/* 4. KEY TOPICS ANALYSIS (ENRICHED) */}
        <div style={{ borderTop: '1px solid #eee', paddingTop: '80px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 900, opacity: 0.4, fontFamily: 'var(--font-mono)', letterSpacing: '2px', marginBottom: '60px', textAlign: 'center' }}>
            ANÁLISIS DE EJES TEMÁTICOS TRONCALES
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1.5fr 2fr 1fr 1fr', 
              padding: '0 0 20px 0', 
              borderBottom: '2px solid black',
              fontSize: '10px',
              fontWeight: 900,
              fontFamily: 'var(--font-mono)',
              opacity: 0.3,
              letterSpacing: '1px'
            }}>
              <span>TEMA</span>
              <span>SÍNTESIS EDITORIAL</span>
              <span style={{ textAlign: 'right' }}>COBERTURA</span>
              <span style={{ textAlign: 'right' }}>INTENSIDAD</span>
            </div>

            {[
              { 
                topic: "Regulación de Vivienda", 
                consensus: "BAJO", 
                impact: "Crítico",
                desc: "Choque frontal entre urgencia social e inseguridad jurídica. Máxima actividad en prensa regional.",
                coverage: "+22%",
                intensity: "ALTA",
                color: "#000"
              },
              { 
                topic: "Previsiones Económicas", 
                consensus: "ALTO", 
                impact: "Estructural",
                desc: "Optimismo técnico compartido, con matices sobre la sostenibilidad de la deuda pública y déficit.",
                coverage: "-5%",
                intensity: "MEDIA",
                color: "#000"
              },
              { 
                topic: "Transición Energética Hub", 
                consensus: "ALTO", 
                impact: "Inversión",
                desc: "Unanimidad sobre los beneficios industriales del hub de hidrógeno verde en Puertollano.",
                coverage: "+8%",
                intensity: "BAJA",
                color: "#000"
              }
            ].map((item, idx) => (
              <div key={idx} style={{ 
                padding: '40px 0', 
                borderBottom: '1px solid #eee',
                display: 'grid',
                gridTemplateColumns: '1.5fr 2fr 1fr 1fr',
                alignItems: 'center',
                gap: '40px'
              }}>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-1px', marginBottom: '8px' }}>{item.topic}</div>
                  <div style={{ fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.3 }}>CONSENSO: {item.consensus}</div>
                </div>
                <div style={{ fontSize: '15px', lineHeight: '1.5', opacity: 0.7, paddingRight: '40px' }}>{item.desc}</div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '20px', fontWeight: 800 }}>{item.coverage}</div>
                  <div style={{ fontSize: '9px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.3 }}>VS AYER</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '20px', fontWeight: 800 }}>{item.intensity}</div>
                  <div style={{ fontSize: '9px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.3 }}>RUIDO</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. CONSENSO Y DESACUERDO (NEW SECTION) */}
        <div style={{ 
          marginTop: '100px', 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '80px',
          borderTop: 'var(--border-thin)',
          paddingTop: '60px'
        }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 900, opacity: 0.3, fontFamily: 'var(--font-mono)', letterSpacing: '1px', marginBottom: '32px' }}>ALTO CONSENSO NACIONAL</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {['Gravedad de la crisis del alquiler', 'Necesidad de mayor oferta pública', 'Presión en grandes áreas urbanas'].map((txt, i) => (
                <div key={i} style={{ display: 'flex', gap: '20px', fontSize: '16px', fontWeight: 600 }}>
                  <Plus /> <span>{txt}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 900, opacity: 0.3, fontFamily: 'var(--font-mono)', letterSpacing: '1px', marginBottom: '32px' }}>FUERTE DESACUERDO / POLARIZACIÓN</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {['Control de precios en zonas tensionadas', 'Efectos colaterales en la inversión privada', 'Garantía de seguridad para propietarios'].map((txt, i) => (
                <div key={i} style={{ display: 'flex', gap: '20px', fontSize: '16px', fontWeight: 600 }}>
                  <Plus /> <span>{txt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 6. GRAN INSIGHT DEL DÍA (ENHANCED BIAS SHIFT) */}
        <div style={{ 
          marginTop: '120px', 
          background: 'black', 
          color: 'white', 
          padding: '80px',
          borderRadius: '4px'
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', fontWeight: 900, opacity: 0.5, fontFamily: 'var(--font-mono)', letterSpacing: '2px', marginBottom: '20px' }}>EL GRAN DESPLAZAMIENTO NARRATIVO</div>
            <h2 style={{ fontSize: '48px', fontWeight: 800, letterSpacing: '-2px', marginBottom: '32px', lineHeight: '1.1' }}>
              Hoy la prensa se ha desplazado un 15% hacia el ángulo de "Inseguridad Jurídica".
            </h2>
            <p style={{ fontSize: '20px', opacity: 0.7, lineHeight: '1.6', marginBottom: '40px' }}>
              Nuestro análisis detecta una coordinación del 80% en los marcos léxicos de medios nacionales conservadores. El término "seguridad jurídica" aparece en el 62% de las editoriales, frente al 12% de ayer.
            </p>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '32px', textAlign: 'left' }}>
              <span style={{ fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.5, display: 'block', marginBottom: '8px' }}>POR QUÉ IMPORTA</span>
              <p style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>Este cambio sugiere una preparación de la opinión pública para una posible resistencia institucional o judicial ante la nueva normativa.</p>
            </div>
          </div>
        </div>

        {/* 7. PUNTOS CIEGOS DEL DÍA (NEW SECTION) */}
        <div style={{ marginTop: '100px' }}>
          <div style={{ fontSize: '12px', fontWeight: 900, opacity: 0.3, fontFamily: 'var(--font-mono)', letterSpacing: '1px', marginBottom: '40px' }}>PUNTOS CIEGOS DETECTADOS</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' }}>
            {[
              { title: 'Infrarreproducibilidad Territorial', desc: 'Escasa cobertura de la respuesta de comunidades autónomas fuera de Madrid y Cataluña.' },
              { title: 'Impacto en Micro-Propietarios', desc: 'Ausencia casi total de análisis sobre el impacto en jubilados que dependen del alquiler como complemento.' },
              { title: 'Comparativa Europea', desc: 'Falta de contexto sobre el fracaso o éxito de medidas similares en Berlín o París.' }
            ].map((spot, i) => (
              <div key={i} style={{ borderLeft: '1px solid black', paddingLeft: '24px' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, marginBottom: '8px' }}>{spot.title}</div>
                <div style={{ fontSize: '13px', opacity: 0.6, lineHeight: '1.4' }}>{spot.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 8. QUICK BRIEF LIST (ENRICHED) */}
        <div style={{ marginTop: '120px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 900, opacity: 0.4, fontFamily: 'var(--font-mono)', letterSpacing: '2px', marginBottom: '60px' }}>
            SÍNTESIS DE ÚLTIMA HORA (ALTA FACTUALIDAD)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' }}>
            {[
              { t: "El IPC se modera al 3.2% en marzo.", c: "ECONOMÍA", f: "ALTA", i: "MEDIA" },
              { t: "Acuerdo bilateral España-Francia sobre energía.", c: "INTERNACIONAL", f: "ALTA", i: "ALTA" },
              { t: "Nuevas patentes registradas en el sector salud.", c: "CIENCIA", f: "MEDIA", i: "BAJA" },
              { t: "Subasta de deuda pública con demanda récord.", c: "FINANZAS", f: "ALTA", i: "ALTA" },
              { t: "Bolsa de Madrid sube un 1.2% liderada por banca.", c: "MERCADOS", f: "ALTA", i: "MEDIA" },
              { t: "Aprobada la nueva ley de IA en la UE.", c: "TECNOLOGÍA", f: "ALTA", i: "CRÍTICA" }
            ].map((tip, i) => (
              <div key={i} style={{ borderLeft: '3px solid black', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <p style={{ fontSize: '15px', fontWeight: 700, lineHeight: '1.3', margin: 0 }}>{tip.t}</p>
                <div style={{ display: 'flex', gap: '10px', fontSize: '9px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.4 }}>
                  <span>{tip.c}</span>
                  <span>•</span>
                  <span>FACT: {tip.f}</span>
                  <span>•</span>
                  <span>IMP: {tip.i}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 9. QUÉ VIGILAR MAÑANA (PROSPECTIVE) */}
        <div style={{ 
          marginTop: '100px', 
          padding: '60px', 
          background: '#f8f8f8', 
          borderRadius: '4px',
          borderLeft: '4px solid black' 
        }}>
          <div style={{ fontSize: '12px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.4, letterSpacing: '2px', marginBottom: '24px' }}>ANÁLISIS PROSPECTIVO: PRÓXIMAS 24H</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '60px' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 900, marginBottom: '8px' }}>ESCALADA NARRATIVA</div>
              <p style={{ fontSize: '14px', lineHeight: '1.5', margin: 0 }}>Vigilar la respuesta de las patronales inmobiliarias; se espera un aumento del marco "fuga de capitales".</p>
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 900, marginBottom: '8px' }}>HITO INSTITUCIONAL</div>
              <p style={{ fontSize: '14px', lineHeight: '1.5', margin: 0 }}>Reunión del Consejo de Ministros: posibles medidas complementarias tras el Briefing de hoy.</p>
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 900, marginBottom: '8px' }}>SECTORIAL</div>
              <p style={{ fontSize: '14px', lineHeight: '1.5', margin: 0 }}>Seguimiento de la cotización de las SOCIMIs tras la consolidación del marco regulatorio.</p>
            </div>
          </div>
        </div>

        {/* 10. TRANSPARENCIA METODOLÓGICA */}
        <div style={{ marginTop: '140px', borderTop: '1px solid #eee', paddingTop: '40px', fontSize: '10px', fontFamily: 'var(--font-mono)', opacity: 0.3, textAlign: 'justify', lineHeight: '1.6' }}>
          Este reporte ha sido generado analizando 1,420 fuentes de noticias en tiempo real. La ventana temporal cubre desde las 08:30 CET de ayer hasta las 08:30 CET de hoy. 
          Los indicadores de sesgo miden el enfoque y encuadre narrativo ("framing"), no la veracidad de los hechos reportados. 
          El consenso, la polarización y la factualidad son métricas propietarias del sistema de análisis de TNE basadas en procesamiento de lenguaje natural (NLP).
        </div>

        {/* 11. FINAL CTA TO GO BACK */}
        <div style={{ marginTop: '100px', textAlign: 'center' }}>
          <div 
            onClick={onBack}
            style={{ 
              display: 'inline-block',
              cursor: 'pointer',
              padding: '20px 0',
              transition: 'var(--transition)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.6'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            <span style={{ 
              fontSize: '42px', 
              fontWeight: 800, 
              letterSpacing: '-2px', 
              textTransform: 'uppercase',
              color: 'black',
              borderBottom: '4px solid black',
              paddingBottom: '4px',
              fontFamily: 'var(--font-heading)',
              display: 'inline-block',
              lineHeight: '1'
            }}>
              Cerrar Reporte y Volver ↗
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailySummary;
