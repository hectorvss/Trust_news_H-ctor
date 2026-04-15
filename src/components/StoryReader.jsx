import React, { useEffect } from 'react';

const Plus = () => <span style={{ fontSize: '18px', opacity: 0.3, fontWeight: 700 }}>+</span>;

const StoryReader = ({ article, onBack }) => {
  // Scroll to top when opening the reader
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!article) return null;

  return (
    <div className="story-reader" style={{ background: '#fff', color: '#000', minHeight: '100vh', paddingBottom: '120px' }}>
      {/* 1. TOP UTILITY BAR (Status & Metas) */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '60px', 
        borderBottom: 'var(--border-thin)', 
        paddingBottom: '24px',
        paddingTop: '20px'
      }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span 
            onClick={onBack} 
            style={{ 
              cursor: 'pointer', 
              fontSize: '11px', 
              fontWeight: 800, 
              fontFamily: 'var(--font-mono)', 
              padding: '8px 20px',
              border: '1px solid black',
              borderRadius: '100px'
            }}
          >
            ← VOLVER
          </span>
          <div style={{ padding: '4px 12px', background: '#f5f5f5', borderRadius: '4px', fontSize: '10px', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
            <span style={{ opacity: 0.3 }}>ID:</span> TNE-88293
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase' }}>{article.source}</div>
            <div style={{ fontSize: '10px', opacity: 0.4, fontWeight: 700 }}>VER ORIGINAL ↗</div>
          </div>
        </div>
      </div>

      {/* 2. EDITORIAL CONTEXT BLOCK (Discreet) */}
      <div style={{ 
        marginBottom: '60px', 
        paddingLeft: '32px', 
        borderLeft: '4px solid black',
        opacity: 0.8
      }}>
        <p style={{ fontSize: '14px', lineHeight: '1.6', fontWeight: 600, margin: 0, maxWidth: '800px' }}>
          Lectura estructurada basada en la cobertura original de <strong>{article.source}</strong>. 
          Este resumen ampliado ha sido procesado para facilitar el análisis, el contexto y la comparación de enfoques informativos.
        </p>
      </div>

      <div className="layout-split" style={{ alignItems: 'flex-start', gap: '80px' }}>
        
        {/* MAIN READING AREA */}
        <div style={{ flex: '0 0 65%' }}>
          {/* MEDIA INFO & METADATA GRID */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: '24px', 
            marginBottom: '48px',
            borderBottom: '0.5px solid #eee',
            paddingBottom: '32px'
          }}>
            <div>
              <div style={{ fontSize: '10px', fontWeight: 800, opacity: 0.3, marginBottom: '8px' }}>MEDIO</div>
              <div style={{ fontSize: '13px', fontWeight: 800 }}>{article.source}</div>
            </div>
            <div>
              <div style={{ fontSize: '10px', fontWeight: 800, opacity: 0.3, marginBottom: '8px' }}>AUTOR</div>
              <div style={{ fontSize: '13px', fontWeight: 800 }}>{article.author || 'Redacción Nacional'}</div>
            </div>
            <div>
              <div style={{ fontSize: '10px', fontWeight: 800, opacity: 0.3, marginBottom: '8px' }}>FECHA</div>
              <div style={{ fontSize: '13px', fontWeight: 800 }}>{article.time} (EST)</div>
            </div>
            <div>
              <div style={{ fontSize: '10px', fontWeight: 800, opacity: 0.3, marginBottom: '8px' }}>TIPO</div>
              <div style={{ fontSize: '13px', fontWeight: 800 }}>{article.type || 'NOTICIA'}</div>
            </div>
          </div>

          <h1 style={{ 
            fontSize: '64px', 
            fontWeight: 800, 
            letterSpacing: '-3.5px', 
            lineHeight: '0.95', 
            marginBottom: '40px' 
          }}>
            {article.title || 'El Gobierno aprueba una nueva ley de vivienda para limitar alquileres'}
          </h1>

          {/* SECONDARY METADATA BAR */}
          <div style={{ 
            display: 'flex', 
            gap: '32px', 
            marginBottom: '60px', 
            fontFamily: 'var(--font-mono)', 
            fontSize: '11px', 
            fontWeight: 800,
            opacity: 0.4
          }}>
            <span>TIEMPO: {article.readTime || '4 min'}</span>
            <span>FACTUALIDAD: {article.fact || 'ALTA'}</span>
            <span>SESGO: {article.bias}</span>
            <span>TONO: {article.tone || 'NEUTRO'}</span>
          </div>

          {/* ATTRIBUTION NOTE (Discreet, Editorial) */}
          <div style={{ 
            padding: '24px 32px', 
            background: '#fcfcfc', 
            border: 'var(--border-thin)', 
            borderRadius: '12px',
            marginBottom: '60px',
            fontSize: '13px',
            lineHeight: '1.5',
            color: '#444'
          }}>
            Este contenido es una versión estructurada y resumida basada en la noticia publicada por <strong>{article.source}</strong>. 
            El texto original y la propiedad intelectual del reportaje pertenecen íntegramente a su autor y editor. 
            Para consultar la pieza completa en su formato original, utiliza el enlace al final de esta página.
          </div>

          {/* STRUCTURED CONTENT SECTIONS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '60px' }}>
            <section>
              <h2 style={{ fontSize: '12px', fontWeight: 800, opacity: 0.3, marginBottom: '24px', letterSpacing: '1px' }}>QUÉ HA PASADO</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <p style={{ fontSize: '20px', lineHeight: '1.6', fontWeight: 600, margin: 0 }}>
                  En una sesión extraordinaria marcada por la urgencia legislativa, el Ejecutivo ha procedido a la ratificación definitiva del Real Decreto-Ley 12/2024. Esta normativa, que entra en vigor de forma inmediata tras su publicación en el BOE, despliega un blindaje jurídico sin precedentes sobre el mercado del alquiler. 
                </p>
                <p style={{ fontSize: '18px', lineHeight: '1.6', opacity: 0.7, margin: 0 }}>
                  El texto establece un cordón sanitario en las denominadas "zonas de alta demanda residencial", donde los precios han experimentado una deriva inflacionista que la administración califica de insostenible para el tejido social de las grandes capitales. El objetivo principal es la congelación efectiva de las rentas para evitar que la volatilidad de los indicadores macroeconómicos se traslade de forma directa al presupuesto de las familias con menores ingresos.
                </p>
              </div>
            </section>

            <section>
              <h2 style={{ fontSize: '12px', fontWeight: 800, opacity: 0.3, marginBottom: '24px', letterSpacing: '1px' }}>CONTEXTO Y NECESIDAD</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', gap: '24px' }}>
                  <Plus /> 
                  <p style={{ fontSize: '17px', lineHeight: '1.5', margin: 0 }}>
                    La anomalía del mercado español reside en su raquítico parque de vivienda pública, que apenas alcanza el 2.5% frente a la media europea del 15%. Esta carestía estructural arrastra a la práctica totalidad de la demanda hacia un mercado privado saturado y sin alternativas de gestión estatal.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '24px' }}>
                  <Plus /> 
                  <p style={{ fontSize: '17px', lineHeight: '1.5', margin: 0 }}>
                    Durante el último ciclo anual, la divergencia entre salarios y vivienda se ha agudizado de forma crítica. Mientras los sueldos medios han navegado en un estancamiento relativo, las rentas en nodos logísticos y turísticos como Madrid o Málaga han escalado un 14.5%, forzando el desplazamiento de miles de residentes hacia las periferias.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 style={{ fontSize: '12px', fontWeight: 800, opacity: 0.3, marginBottom: '24px', letterSpacing: '1px' }}>IMPLICACIONES DEL DECRETO</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                <div style={{ padding: '24px', border: '1px solid black', borderRadius: '12px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '16px' }}>PARA EL INQUILINO</h3>
                  <p style={{ fontSize: '15px', color: '#444', lineHeight: '1.5' }}>
                    Se instaura una era de predictibilidad financiera. La desvinculación total del IPC elimina el riesgo de incrementos sorpresa en las renovaciones, permitiendo a los hogares planificar sus gastos a largo plazo bajo un horizonte de rentas estabilizadas por ley.
                  </p>
                </div>
                <div style={{ padding: '24px', border: '1px solid black', borderRadius: '12px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '16px' }}>PARA EL PROPIETARIO</h3>
                  <p style={{ fontSize: '15px', color: '#444', lineHeight: '1.5' }}>
                    El sector privado afronta una compresión de márgenes operativos. Como contrapartida a la limitación de precios, el decreto habilita un nuevo catálogo de bonificaciones fiscales que entrarán en juego únicamente para aquellos arrendadores que acepten reducciones voluntarias de la renta.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 style={{ fontSize: '12px', fontWeight: 800, opacity: 0.3, marginBottom: '24px', letterSpacing: '1px' }}>CLAIMS CLAVE Y DATOS</h2>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <li style={{ fontSize: '18px', fontWeight: 700, display: 'flex', gap: '16px' }}>
                   <span style={{ minWidth: '8px', height: '8px', background: 'black', borderRadius: '50%', marginTop: '10px' }} />
                   "El tope del 3% no es una tregua temporal, sino un pilar de la nueva arquitectura del mercado residencial que perdurará hasta 2026."
                </li>
                <li style={{ fontSize: '18px', fontWeight: 700, display: 'flex', gap: '16px' }}>
                   <span style={{ minWidth: '8px', height: '8px', background: 'black', borderRadius: '50%', marginTop: '10px' }} />
                   El impacto estimado se cuantifica en una inyección indirecta de 1.400€ anuales de liquidez para las familias ubicadas en zonas de alta tensión.
                </li>
              </ul>
            </section>

            {/* PUNTO CIEGO DETECTADO */}
            <section style={{ padding: '40px', background: 'black', color: 'white', borderRadius: '24px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, opacity: 0.5, marginBottom: '16px', letterSpacing: '2px' }}>INTELIGENCIA TNE • PUNTO CIEGO</div>
              <h3 style={{ fontSize: '24px', fontWeight: 800, lineHeight: '1.3', marginBottom: '20px' }}>
                La cobertura de {article.source} omite el impacto en las pymes de gestión inmobiliaria y el mercado de proximidad.
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <p style={{ fontSize: '16px', opacity: 0.7, lineHeight: '1.6', margin: 0 }}>
                  Mientras el reportaje principal de {article.source} focaliza su atención en los "fondos buitre" y los grandes tenedores institucionales, el análisis de TNE detecta un vacío crítico: la omisión sistemática del impacto en los administradores de fincas locales y las micro-pymes del sector.
                </p>
                <p style={{ fontSize: '16px', opacity: 0.7, lineHeight: '1.6', margin: 0 }}>
                  Este segmento, que representa el 65% del ecosistema de servicios inmobiliarios en España, verá reducidos sus márgenes operativos sin acceso a las economías de escala de los grandes grupos. La narrativa del medio no contempla cómo esta asfixia regulatoria podría derivar en una degradación del mantenimiento del parque de vivienda antiguo, tradicionalmente gestionado por estos actores locales.
                </p>
              </div>
            </section>
          </div>

          {/* FINAL ATTRIBUTION & CTA */}
          <div style={{ marginTop: '100px', paddingTop: '60px', borderTop: '2px solid black' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px', marginBottom: '60px' }}>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 800, opacity: 0.3, marginBottom: '8px' }}>MEDIO ORIGINAL</div>
                <div style={{ fontSize: '15px', fontWeight: 800 }}>{article.source}</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 800, opacity: 0.3, marginBottom: '8px' }}>AUTORÍA</div>
                <div style={{ fontSize: '15px', fontWeight: 800 }}>{article.author || 'Equipo Editorial'}</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 800, opacity: 0.3, marginBottom: '8px' }}>PUBLICACIÓN</div>
                <div style={{ fontSize: '15px', fontWeight: 800 }}>{article.time}</div>
              </div>
            </div>

            <button 
              onClick={() => window.open('#', '_blank')}
              style={{ 
                width: '100%', 
                padding: '30px', 
                background: 'black', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                fontSize: '18px', 
                fontWeight: 800, 
                cursor: 'pointer',
                letterSpacing: '-0.5px'
              }}
            >
              LECTURA COMPLETA EN {article.source.toUpperCase()} ↗
            </button>
            <div onClick={onBack} style={{ textAlign: 'center', marginTop: '32px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', opacity: 0.4 }}>
              REGRESAR AL ANÁLISIS DE PERSPECTIVAS
            </div>
          </div>
        </div>

        {/* SIDEBAR (Sticky Metadata) */}
        <div style={{ 
          flex: '0 0 25%', 
          position: 'sticky', 
          top: '40px', 
          alignSelf: 'flex-start',
          borderLeft: 'var(--border-thin)',
          paddingLeft: '40px'
        }}>
          <h4 style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '1px', opacity: 0.3, marginBottom: '24px' }}>PERFIL DE LA FUENTE</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 800 }}>{article.source}</div>
              <div style={{ fontSize: '12px', opacity: 0.5, marginTop: '4px' }}>Medio de registro nacional</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, opacity: 0.3, marginBottom: '12px' }}>SESGO DE ESTA PIEZA</div>
              <div style={{ padding: '8px 16px', background: 'black', color: 'white', display: 'inline-block', fontSize: '11px', fontWeight: 800 }}>{article.bias}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, opacity: 0.3, marginBottom: '12px' }}>FACTUALIDAD</div>
              <div style={{ fontSize: '18px', fontWeight: 800 }}>{article.fact}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, opacity: 0.3, marginBottom: '12px' }}>ENFOQUE PRINCIPAL</div>
              <div style={{ fontSize: '15px', fontWeight: 700, lineHeight: '1.4' }}>{article.angle || 'Macroeconómico / Regulatorio'}</div>
            </div>
            <div style={{ paddingTop: '32px', borderTop: 'var(--border-thin)' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, opacity: 0.3, marginBottom: '16px' }}>COMPARAR CON:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}>ABC (OPUESTO) ↗</div>
                <div style={{ fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}>EL DIARIO (AFÍN) ↗</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryReader;
