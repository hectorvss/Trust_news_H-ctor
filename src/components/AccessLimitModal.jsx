import React from 'react';
import { useNavigate } from 'react-router-dom';

const AccessLimitModal = ({ isOpen, onClose, currentPlan = 'FREE', mode = 'LIMIT' }) => {
  const navigate = useNavigate();
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(255,255,255,0.7)',
      backdropFilter: 'blur(3px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 999999,
      padding: '20px'
    }} onClick={onClose}>
      <div 
        style={{
          background: 'white',
          width: '100%',
          maxWidth: '500px',
          borderRadius: '0',
          border: '2px solid black',
          padding: '40px',
          boxShadow: '12px 12px 0px rgba(0,0,0,1)',
          position: 'relative'
        }}
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={() => onClose(true)}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '10px',
            fontWeight: 800
          }}
        >✕</button>

        <div style={{ fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.4, letterSpacing: '3px', marginBottom: '16px' }}>
          TNE INTELLIGENCE / CONTROL DE ACCESO
        </div>
        
        <h2 style={{ fontSize: '42px', fontWeight: 800, letterSpacing: '-2.5px', marginBottom: '24px', lineHeight: '0.9' }}>
          {mode === 'AUTH' ? 'Acceso restringido.' : 'Límite de lectura superado.'}
        </h2>
        
        <p style={{ fontSize: '16px', lineHeight: '1.5', fontWeight: 500, color: '#444', marginBottom: '40px' }}>
          {mode === 'AUTH' 
            ? 'Para poder leer noticias e informes en profundidad, necesitas crear una cuenta gratuita en TNE o iniciar sesión en tu cuenta existente.' 
            : `Has alcanzado el límite de uso de tu versión actual (${currentPlan}). Para seguir utilizando el periódico digital y acceder a contenido premium sin restricciones, mejora tu plan de suscripción.`
          }
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
          <button 
             onClick={() => { 
                if (mode === 'AUTH') {
                   navigate('/auth');
                } else {
                   navigate('/pricing'); 
                }
                onClose(false); 
             }}
             style={{ 
               width: '100%', 
               padding: '24px', 
               background: 'black', 
               color: 'white',
               border: '2px solid black', 
               fontSize: '16px', 
               fontWeight: 900, 
               cursor: 'pointer',
               letterSpacing: '1px',
               transition: '0.2s'
             }}
          >
            {mode === 'AUTH' ? 'INICIAR SESIÓN O CREAR CUENTA →' : 'VER PLANES Y MEJORAR ACCESO →'}
          </button>
          
          <button 
             onClick={() => onClose(true)}
             style={{ 
               width: '100%', 
               padding: '24px', 
               background: 'white', 
               color: 'black',
               border: '2px solid black', 
               fontSize: '13px', 
               fontWeight: 800, 
               cursor: 'pointer',
               letterSpacing: '0.5px'
             }}
          >
            VOLVER AL INICIO
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', opacity: 0.2 }}>
          <div style={{ border: '1px solid black', width: '20px', height: '20px' }} />
          <div style={{ border: '1px solid black', width: '20px', height: '20px' }} />
        </div>
      </div>
    </div>
  );
};

export default AccessLimitModal;
