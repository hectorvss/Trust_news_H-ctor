import React from 'react';
import { useBreakpoint } from '../hooks/useBreakpoint';

const BlindspotExplainerModal = ({ onClose }) => {
  const { isMobile } = useBreakpoint();

  const sections = [
    {
      number: '1',
      title: 'Qué es un Blindspot',
      description: 'Una historia que un lado del espectro político cubre desproporcionadamente más (o menos) que el otro. Es como si un grupo de medios enfatizara una noticia mientras otros la ignoran.',
      example: 'Ejemplo: Una reforma legislativa cubierta por 10 medios de izquierda, pero solo 2 de derecha = blindspot para la derecha.'
    },
    {
      number: '2',
      title: 'Cómo los Detectamos',
      description: 'Analizamos la distribución de cobertura de cada historia según el sesgo político de sus fuentes. Si hay un desequilibrio significativo (20%+ de diferencia entre lados), la marcamos como blindspot.',
      example: 'Si una noticia tiene 70% de cobertura en izquierda vs 30% en derecha = blindspot "For the Right"'
    },
    {
      number: '3',
      title: 'Por Qué Importa',
      description: 'Los blindspots te muestran los ángulos que tu lado político tiende a ignorar. Al leerlos, evitas estar en una "burbuja informativa" y entiende perspectivas diferentes.',
      example: 'Si lees principalmente medios de izquierda, los "For the Right" te exponen a historias que ese sector considera críticas.'
    },
    {
      number: '4',
      title: 'Cómo Usarlos',
      description: 'Usa los filtros TODO/ESPAÑA/INTERNACIONAL y los temas para navegar. Cuando veas un blindspot, léelo con curiosidad: ¿por qué mi lado no cubre esto? ¿qué me estoy perdiendo?',
      example: 'Filtra por ESPAÑA para ver solo blindspots locales, o por TEMAS para explorar áreas donde el consenso es débil.'
    }
  ];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: isMobile ? '16px' : '0'
    }} onClick={onClose}>
      <div
        style={{
          background: 'white',
          borderRadius: isMobile ? '16px' : '0',
          maxWidth: isMobile ? '100%' : '900px',
          maxHeight: '90vh',
          overflowY: 'auto',
          width: '100%'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: isMobile ? '24px 18px' : '40px 48px',
          borderBottom: '1px solid #eee',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '20px'
        }}>
          <div>
            <div style={{
              fontSize: '11px',
              fontWeight: 900,
              fontFamily: 'var(--font-mono)',
              opacity: 0.4,
              letterSpacing: '2px',
              marginBottom: '12px'
            }}>
              GUÍA COMPLETA
            </div>
            <h1 style={{
              margin: 0,
              fontSize: isMobile ? '32px' : '48px',
              letterSpacing: '-1.5px',
              lineHeight: 1.05,
              fontWeight: 800
            }}>
              Cómo Funciona Blindspot
            </h1>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              opacity: 0.5,
              lineHeight: 1,
              minWidth: '32px',
              textAlign: 'center'
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{
          padding: isMobile ? '32px 18px' : '48px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: isMobile ? '28px' : '40px'
          }}>
            {sections.map((section, i) => (
              <div key={i} style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                {/* Number Badge */}
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '44px',
                  height: '44px',
                  borderRadius: '999px',
                  background: 'black',
                  color: 'white',
                  fontSize: '18px',
                  fontWeight: 900,
                  fontFamily: 'var(--font-mono)'
                }}>
                  {section.number}
                </div>

                {/* Title */}
                <h3 style={{
                  margin: 0,
                  fontSize: isMobile ? '22px' : '26px',
                  fontWeight: 800,
                  letterSpacing: '-0.8px',
                  lineHeight: 1.1
                }}>
                  {section.title}
                </h3>

                {/* Description */}
                <p style={{
                  margin: 0,
                  fontSize: '15px',
                  lineHeight: 1.65,
                  opacity: 0.75,
                  color: '#333'
                }}>
                  {section.description}
                </p>

                {/* Example Box */}
                <div style={{
                  borderLeft: '4px solid black',
                  paddingLeft: '16px',
                  paddingTop: '12px',
                  paddingBottom: '12px'
                }}>
                  <div style={{
                    fontSize: '10px',
                    fontWeight: 900,
                    fontFamily: 'var(--font-mono)',
                    opacity: 0.4,
                    letterSpacing: '1px',
                    marginBottom: '6px'
                  }}>
                    EJEMPLO
                  </div>
                  <p style={{
                    margin: 0,
                    fontSize: '13px',
                    lineHeight: 1.6,
                    opacity: 0.65,
                    fontStyle: 'italic'
                  }}>
                    {section.example}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Key Concepts */}
          <div style={{
            marginTop: isMobile ? '40px' : '60px',
            paddingTop: isMobile ? '32px' : '48px',
            borderTop: '2px solid black'
          }}>
            <h2 style={{
              margin: '0 0 24px 0',
              fontSize: isMobile ? '26px' : '32px',
              fontWeight: 800,
              letterSpacing: '-1px'
            }}>
              Conceptos Clave
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: '24px'
            }}>
              {[
                {
                  label: 'FOR THE LEFT',
                  description: 'Historias que la derecha cubre poco o nada, pero la izquierda sí. Te muestran lo que podrías estar ignorando.'
                },
                {
                  label: 'FOR THE RIGHT',
                  description: 'Historias que la izquierda cubre poco o nada, pero la derecha sí. Perspectivas menos visibles en tu burbuja.'
                },
                {
                  label: 'IMBALANCE SCORE',
                  description: 'Nuestra métrica de qué tan sesgada está una historia. Cuanto más alto, más polarizada la cobertura.'
                }
              ].map((concept, i) => (
                <div key={i} style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '12px',
                  padding: '20px',
                  background: '#fafafa'
                }}>
                  <div style={{
                    fontSize: '10px',
                    fontWeight: 900,
                    fontFamily: 'var(--font-mono)',
                    opacity: 0.5,
                    letterSpacing: '1px',
                    marginBottom: '8px'
                  }}>
                    {concept.label}
                  </div>
                  <p style={{
                    margin: 0,
                    fontSize: '14px',
                    lineHeight: 1.55,
                    opacity: 0.7
                  }}>
                    {concept.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Pro Tips */}
          <div style={{
            marginTop: isMobile ? '40px' : '48px',
            padding: isMobile ? '20px 16px' : '28px 32px',
            background: '#000',
            color: 'white',
            borderRadius: '12px'
          }}>
            <h3 style={{
              margin: '0 0 16px 0',
              fontSize: isMobile ? '18px' : '20px',
              fontWeight: 800
            }}>
              💡 Consejos para Mejor Blindspot
            </h3>
            <ul style={{
              margin: 0,
              paddingLeft: '20px',
              display: 'grid',
              gap: '10px'
            }}>
              <li style={{ fontSize: '14px', lineHeight: 1.55 }}>
                Lee un blindspot de tu lado opuesto cada semana. Expande tu perspectiva.
              </li>
              <li style={{ fontSize: '14px', lineHeight: 1.55 }}>
                Nota patrones: ¿qué temas evita tu lado? Eso es una oportunidad de aprender.
              </li>
              <li style={{ fontSize: '14px', lineHeight: 1.55 }}>
                Compara el ángulo de dos versiones del mismo blindspot. Ves cómo el contexto cambia.
              </li>
              <li style={{ fontSize: '14px', lineHeight: 1.55 }}>
                Usa los filtros ESPAÑA/INTERNACIONAL para ajustar a lo que te interesa.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: isMobile ? '24px 18px' : '32px 48px',
          borderTop: '1px solid #eee',
          textAlign: 'center'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '12px 28px',
              background: 'black',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 900,
              fontFamily: 'var(--font-mono)',
              letterSpacing: '1px'
            }}
          >
            ENTENDIDO
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlindspotExplainerModal;
