import React from 'react';
import { useBreakpoint } from '../hooks/useBreakpoint';

const Bullet = () => (
  <div style={{ width: '8px', height: '8px', background: 'black', marginRight: '16px', flexShrink: 0 }} />
);

const BlindspotExplainerModal = ({ onClose }) => {
  const { isMobile } = useBreakpoint();

  const steps = [
    {
      label: 'PASO 01',
      title: 'Qué es un Blindspot.',
      description: 'Una historia que un lado del espectro político cubre desproporcionadamente más o menos que el otro. Como si un grupo de medios enfatizara algo mientras otros lo ignoran.',
    },
    {
      label: 'PASO 02',
      title: 'Cómo los detectamos.',
      description: 'Analizamos la distribución de cobertura según el sesgo de cada fuente. Si hay un desequilibrio de 20% o más entre lados, la historia se clasifica como blindspot.',
    },
    {
      label: 'PASO 03',
      title: 'Por qué importa.',
      description: 'Los blindspots revelan los ángulos que tu lado político tiende a ignorar. Leerlos evita la burbuja informativa y amplía tu perspectiva.',
    },
    {
      label: 'PASO 04',
      title: 'Cómo usarlos.',
      description: 'Filtra por TODO, ESPAÑA o INTERNACIONAL. Lee un blindspot de tu lado opuesto cada semana. Nota qué temas evita tu espectro: ahí está la información que te falta.',
    },
  ];

  const concepts = [
    { key: 'FOR THE LEFT', value: 'La derecha cubre poco o nada. Te muestra lo que podrías estar ignorando si consumes medios de izquierda.' },
    { key: 'FOR THE RIGHT', value: 'La izquierda cubre poco o nada. Perspectivas menos visibles en tu burbuja si consumes medios de derecha.' },
    { key: 'IMBALANCE SCORE', value: 'Métrica de polarización de la cobertura. Cuanto más alto, más desequilibrada está la historia entre medios.' },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999999,
        padding: isMobile ? '16px' : '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          width: '100%',
          maxWidth: isMobile ? '100%' : '640px',
          maxHeight: 'min(90vh, 820px)',
          borderRadius: '0',
          border: '2px solid black',
          padding: isMobile ? '24px' : '40px',
          boxShadow: isMobile ? '8px 8px 0 rgba(0,0,0,1)' : '12px 12px 0 rgba(0,0,0,1)',
          position: 'relative',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: isMobile ? '10px' : '20px',
            right: isMobile ? '10px' : '20px',
            background: 'none',
            border: 'none',
            fontSize: isMobile ? '20px' : '24px',
            cursor: 'pointer',
            padding: '8px',
            fontWeight: 800,
          }}
        >
          X
        </button>

        {/* Label */}
        <div style={{ fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.4, letterSpacing: '3px', marginBottom: '16px' }}>
          TNE BLINDSPOT / GUÍA
        </div>

        {/* Title */}
        <h2 style={{ fontSize: isMobile ? '28px' : '42px', fontWeight: 800, letterSpacing: isMobile ? '-1.4px' : '-2.5px', marginBottom: '32px', lineHeight: '0.95', paddingRight: isMobile ? '28px' : '40px' }}>
          Cómo funciona el Blindspot.
        </h2>

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid black', marginBottom: '32px' }}>
          {steps.map((step, i) => (
            <div
              key={i}
              style={{
                padding: isMobile ? '20px 0' : '24px 0',
                borderBottom: '1px solid black',
                display: 'flex',
                gap: '16px',
                alignItems: 'flex-start',
              }}
            >
              <Bullet />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.4, letterSpacing: '2px' }}>
                  {step.label}
                </div>
                <div style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '2px' }}>
                  {step.title}
                </div>
                <div style={{ fontSize: '13px', lineHeight: 1.6, opacity: 0.65 }}>
                  {step.description}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Key Concepts */}
        <div style={{ padding: isMobile ? '16px' : '24px', border: '1px solid black', position: 'relative', marginBottom: '32px' }}>
          <div style={{ fontSize: '9px', fontWeight: 900, opacity: 0.4, marginBottom: '16px', letterSpacing: '2px', fontFamily: 'var(--font-mono)' }}>
            CONCEPTOS CLAVE
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {concepts.map((c, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px' }}>
                <span style={{ fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '0.5px', minWidth: isMobile ? '90px' : '110px', flexShrink: 0 }}>
                  {c.key}
                </span>
                <span style={{ fontSize: '13px', lineHeight: 1.55, opacity: 0.65 }}>
                  {c.value}
                </span>
              </div>
            ))}
          </div>
          <div style={{ position: 'absolute', right: '-4px', bottom: '-4px', width: '100%', height: '100%', background: 'rgba(0,0,0,0.05)', zIndex: -1 }} />
        </div>

        {/* Footer decorators */}
        <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.2 }}>
          <div style={{ border: '1px solid black', width: '20px', height: '20px' }} />
          <div style={{ border: '1px solid black', width: '20px', height: '20px' }} />
        </div>
      </div>
    </div>
  );
};

export default BlindspotExplainerModal;
