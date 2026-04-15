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
              <p style={{ fontSize: '20px', lineHeight: '1.6', fontWeight: 600, margin: 0 }}>
                El Gobierno de España ha ratificado formalmente el Real Decreto-Ley 12/2024, una pieza legislativa de calado que establece por primera vez un marco regulatorio estricto para los precios del alquiler en zonas de alta demanda residencial. Según el texto aprobado en el Consejo de Ministros, esta medida busca amortiguar el impacto de la inflación inmobiliaria en las familias con menos ingresos, desvinculando de forma permanente las subidas de renta del Índice de Precios al Consumo (IPC).
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '12px', fontWeight: 800, opacity: 0.3, marginBottom: '24px', letterSpacing: '1px' }}>CONTEXTO Y NECESIDAD</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <p style={{ fontSize: '17px', lineHeight: '1.6', margin: 0 }}>
                  La decisión gubernamental responde a una realidad estructural: España registra actualmente uno de los parques de vivienda pública más bajos de toda la OCDE, apenas un 2.5%, lo que deja al mercado privado como la única opción viable para la inmensa mayoría de la población. En los últimos doce meses, el precio del alquiler en capitales como Madrid, Málaga o Valencia ha escalado un 14.5%, un ritmo de crecimiento que triplica la subida del salario medio en los sectores más dinámicos de la economía.
                </p>
                <p style={{ fontSize: '17px', lineHeight: '1.6', margin: 0 }}>
                  Fuentes expertas citadas por los medios señalan que esta intervención era "inevitable" dada la presión social, aunque el sector promotor advierte que la verdadera solución pasaría por un aumento masivo de la oferta en lugar de una restricción de los precios por decreto.
                </p>
              </div>
            </section>

            <section>
              <h2 style={{ fontSize: '12px', fontWeight: 800, opacity: 0.3, marginBottom: '24px', letterSpacing: '1px' }}>IMPLICACIONES DEL DECRETO</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                <div style={{ padding: '30px', border: '1px solid black', borderRadius: '12px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '20px' }}>PARA EL INQUILINO</h3>
                  <p style={{ fontSize: '15px', color: '#444', lineHeight: '1.6' }}>
                    La normativa garantiza una mayor seguridad contractual y una previsibilidad de los gastos mensuales sin precedentes. Se eliminan las subidas sorpresa ligadas a la volatilidad del IPC, estableciendo un tope máximo del 3% que actuará como un "cortafuegos" financiero para los arrendatarios en zonas tensionadas. Esta estabilidad busca frenar la expulsión de familias de los centros urbanos debido a encarecimientos inasumibles de su renta mensual.
                  </p>
                </div>
                <div style={{ padding: '30px', border: '1px solid black', borderRadius: '12px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '20px' }}>PARA EL PROPIETARIO</h3>
                  <p style={{ fontSize: '15px', color: '#444', lineHeight: '1.6' }}>
                    Los arrendadores se enfrentan a una reducción del margen de beneficio neto en las zonas declaradas de alta demanda, aunque el decreto incluye una serie de bonificaciones fiscales progresivas. Aquellos propietarios que decidan voluntariamente reducir la renta de sus inmuebles tendrán acceso a desgravaciones de hasta el 90% en el IRPF, una medida con la que el Ejecutivo espera incentivar la bajada de precios de forma "no traumática" para los pequeños tenedores de vivienda.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 style={{ fontSize: '12px', fontWeight: 800, opacity: 0.3, marginBottom: '24px', letterSpacing: '1px' }}>CLAIMS CLAVE Y DATOS</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                <div style={{ borderBottom: '1px solid #eee', paddingBottom: '24px' }}>
                  <p style={{ fontSize: '19px', fontWeight: 700, lineHeight: '1.4', margin: 0 }}>
                    "El tope del 3% se aplicará de forma indefinida hasta 2026 en todas aquellas regiones que hayan solicitado formalmente la declaración de zona tensionada."
                  </p>
                  <p style={{ fontSize: '14px', opacity: 0.5, marginTop: '8px' }}>— Declaración institucional recogida en el BOE y analizada por fuentes jurídicas.</p>
                </div>
                <div>
                  <p style={{ fontSize: '19px', fontWeight: 700, lineHeight: '1.4', margin: 0 }}>
                    "Se estima que la medida supondrá un ahorro directo acumulado de aproximadamente 1.400€ anuales para una familia tipo residente en ciudades con alta presión como Barcelona o Madrid."
                  </p>
                  <p style={{ fontSize: '14px', opacity: 0.5, marginTop: '8px' }}>— Informe de impacto socioeconómico del Ministerio de Vivienda.</p>
                </div>
              </div>
            </section>

            {/* PUNTO CIEGO DETECTADO */}
            <section style={{ padding: '40px', background: 'black', color: 'white', borderRadius: '24px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, opacity: 0.5, marginBottom: '16px', letterSpacing: '2px' }}>INTELIGENCIA TNE • PUNTO CIEGO</div>
              <h3 style={{ fontSize: '24px', fontWeight: 800, lineHeight: '1.3', marginBottom: '16px' }}>La cobertura de {article.source} omite el impacto en las pymes de gestión inmobiliaria.</h3>
              <p style={{ fontSize: '16px', opacity: 0.7, lineHeight: '1.5', margin: 0 }}>
                Mientras el reportaje se centra en los grandes tenedores y fondos buitre, no analiza cómo la reducción de márgenes afectará a los administradores de fincas locales, que representan el 65% del sector servicios inmobiliarios en España.
              </p>
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
