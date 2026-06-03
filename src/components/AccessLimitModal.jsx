import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBreakpoint } from '../hooks/useBreakpoint';

const AccessLimitModal = ({ isOpen, onClose, currentPlan = 'FREE', mode = 'LIMIT' }) => {
  const navigate = useNavigate();
  const { isMobile } = useBreakpoint();
  const [showExitConfirm, setShowExitConfirm] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) setShowExitConfirm(false);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleExitClick = () => {
    if (mode === 'AUTH' && !showExitConfirm) setShowExitConfirm(true);
    else onClose(true);
  };

  const shellStyle = {
    background: 'white',
    width: '100%',
    maxWidth: '500px',
    maxHeight: 'min(88vh, 760px)',
    borderRadius: '0',
    border: '2px solid black',
    padding: isMobile ? '24px' : '40px',
    boxShadow: isMobile ? '8px 8px 0 rgba(0,0,0,1)' : '12px 12px 0 rgba(0,0,0,1)',
    position: 'relative',
    overflowY: 'auto',
  };

  const primaryButton = {
    width: '100%',
    padding: isMobile ? '18px 16px' : '24px',
    background: 'black',
    color: 'white',
    border: '2px solid black',
    fontSize: isMobile ? '14px' : '16px',
    fontWeight: 900,
    cursor: 'pointer',
    letterSpacing: '1px',
    transition: '0.2s',
  };

  const secondaryButton = {
    width: '100%',
    padding: isMobile ? '18px 16px' : '24px',
    background: 'white',
    color: 'black',
    border: '2px solid black',
    fontSize: '13px',
    fontWeight: 800,
    cursor: 'pointer',
    letterSpacing: '0.5px',
  };

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
    >
      <div style={shellStyle} onClick={(e) => e.stopPropagation()}>
        <button
          onClick={handleExitClick}
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

        {!showExitConfirm ? (
          <>
            <div style={{ fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.4, letterSpacing: '3px', marginBottom: '16px' }}>
              TNE INTELLIGENCE / CONTROL DE ACCESO
            </div>

            <h2 style={{ fontSize: isMobile ? '28px' : '42px', fontWeight: 800, letterSpacing: isMobile ? '-1.4px' : '-2.5px', marginBottom: '24px', lineHeight: '0.95', paddingRight: isMobile ? '28px' : '40px' }}>
              {mode === 'AUTH' ? 'Acceso restringido.' : 'Limite de lectura superado.'}
            </h2>

            <p style={{ fontSize: isMobile ? '14px' : '16px', lineHeight: '1.5', fontWeight: 500, color: '#444', marginBottom: '32px' }}>
              {mode === 'AUTH'
                ? 'Para poder leer noticias e informes en profundidad, necesitas crear una cuenta gratuita en TNE o iniciar sesion en tu cuenta existente.'
                : `Has alcanzado el limite de uso de tu version actual (${currentPlan}). Para seguir utilizando el periodico digital y acceder a contenido premium sin restricciones, mejora tu plan de suscripcion.`}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
              <button
                onClick={() => {
                  navigate(mode === 'AUTH' ? '/auth' : '/pricing');
                  onClose(false);
                }}
                style={primaryButton}
              >
                {mode === 'AUTH' ? 'INICIAR SESION O CREAR CUENTA ->' : 'VER PLANES Y MEJORAR ACCESO ->'}
              </button>

              <button onClick={handleExitClick} style={secondaryButton}>
                VOLVER AL INICIO
              </button>
            </div>
          </>
        ) : (
          <div style={{ animation: 'fadeIn 0.4s ease' }}>
            <div style={{ fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#d32f2f', letterSpacing: '3px', marginBottom: '16px' }}>
              UN ULTIMO INTENTO...
            </div>

            <h2 style={{ fontSize: isMobile ? '26px' : '38px', fontWeight: 800, letterSpacing: isMobile ? '-1px' : '-2px', marginBottom: '24px', lineHeight: '0.95', paddingRight: isMobile ? '28px' : '40px' }}>
              Vaya. Parece que te sobran excusas y te falta curiosidad.
            </h2>

            <p style={{ fontSize: isMobile ? '14px' : '16px', lineHeight: '1.5', fontWeight: 500, color: '#444', marginBottom: '32px' }}>
              Crear una cuenta en TNE lleva exactamente <strong style={{ color: 'black' }}>12 segundos</strong>. Literalmente menos de lo que acabas de tardar en leer este texto.
              <br />
              <br />
              ¿De verdad prefieres seguir viendo el mundo a traves de un muro por ahorrarte tres clics?
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
              <button
                onClick={() => {
                  navigate('/auth');
                  onClose(false);
                }}
                style={primaryButton}
              >
                {'VALE, ME REGISTRO (12 SEC) ->'}
              </button>

              <button
                onClick={() => onClose(true)}
                style={{
                  ...secondaryButton,
                  background: '#fff0f0',
                  color: '#d32f2f',
                  border: '2px solid #d32f2f',
                  fontSize: '12px',
                  fontWeight: 900,
                }}
              >
                SI, PREFIERO SEGUIR DESINFORMADO X
              </button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', opacity: 0.2 }}>
          <div style={{ border: '1px solid black', width: '20px', height: '20px' }} />
          <div style={{ border: '1px solid black', width: '20px', height: '20px' }} />
        </div>
      </div>
    </div>
  );
};

export default AccessLimitModal;
