import React, { useState } from 'react';

const Auth = ({ onBack }) => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="auth-page">
      <button 
        onClick={onBack}
        className="tag" 
        style={{ 
          background: 'none', 
          cursor: 'pointer', 
          marginBottom: '40px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        ← Volver al Inicio
      </button>

      <section style={{ padding: '0 0 60px 0', borderBottom: 'var(--border-thin)', marginBottom: '60px' }}>
        <h1 style={{ 
          fontSize: '80px', 
          lineHeight: '0.9', 
          letterSpacing: '-4px', 
          marginBottom: '24px',
          color: 'var(--color-primary)'
        }}>
          {isLogin ? 'Bienvenido de\nNuevo.' : 'Comienza tu\nContraste.'}
        </h1>
        <p style={{ fontSize: '24px', opacity: 0.6, maxWidth: '600px' }}>
          {isLogin 
            ? 'Accede a tu panel personalizado de noticias y blindspots.' 
            : 'Únete a la plataforma líder en análisis de sesgo mediático en España.'}
        </p>
      </section>

      <div className="layout-split" style={{ alignItems: 'flex-start' }}>
        <div className="sidebar">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <span 
              className="tag" 
              onClick={() => setIsLogin(true)}
              style={{ 
                cursor: 'pointer', 
                background: isLogin ? 'black' : 'none', 
                color: isLogin ? 'white' : 'black',
                textAlign: 'center',
                padding: '12px'
              }}
            >
              INICIAR SESIÓN
            </span>
            <span 
              className="tag" 
              onClick={() => setIsLogin(false)}
              style={{ 
                cursor: 'pointer', 
                background: !isLogin ? 'black' : 'none', 
                color: !isLogin ? 'white' : 'black',
                textAlign: 'center',
                padding: '12px'
              }}
            >
              CREAR CUENTA
            </span>
          </div>
          <p style={{ marginTop: '40px', fontSize: '13px', opacity: 0.5, lineHeight: '1.4' }}>
            Al continuar, aceptas nuestros términos de servicio y política de privacidad de datos analíticos.
          </p>
        </div>

        <div className="main-content">
          <div className="story-card" style={{ padding: '60px', minHeight: 'auto' }}>
            <form style={{ display: 'flex', flexDirection: 'column', gap: '40px' }} onSubmit={(e) => e.preventDefault()}>
              {!isLogin && (
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '1px', marginBottom: '12px', display: 'block' }}>NOMBRE COMPLETO</label>
                  <input 
                    type="text" 
                    placeholder="Tu nombre aquí..."
                    style={{ 
                      width: '100%', 
                      background: 'none', 
                      border: 'none', 
                      borderBottom: 'var(--border-thin)', 
                      padding: '12px 0',
                      fontSize: '18px',
                      fontFamily: 'inherit',
                      outline: 'none'
                    }}
                  />
                </div>
              )}
              
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '1px', marginBottom: '12px', display: 'block' }}>CORREO ELECTRÓNICO</label>
                <input 
                  type="email" 
                  placeholder="usuario@dominio.com"
                  style={{ 
                    width: '100%', 
                    background: 'none', 
                    border: 'none', 
                    borderBottom: 'var(--border-thin)', 
                    padding: '12px 0',
                    fontSize: '18px',
                    fontFamily: 'inherit',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '1px', marginBottom: '12px', display: 'block' }}>CONTRASEÑA</label>
                <input 
                  type="password" 
                  placeholder="••••••••••••"
                  style={{ 
                    width: '100%', 
                    background: 'none', 
                    border: 'none', 
                    borderBottom: 'var(--border-thin)', 
                    padding: '12px 0',
                    fontSize: '18px',
                    fontFamily: 'inherit',
                    outline: 'none'
                  }}
                />
              </div>

              <button 
                type="submit"
                className="navbar__link" 
                style={{ 
                  background: 'black', 
                  color: 'white', 
                  border: 'none', 
                  padding: '24px', 
                  fontSize: '16px', 
                  fontWeight: 700, 
                  cursor: 'pointer',
                  marginTop: '20px' 
                }}
              >
                {isLogin ? 'ACCEDER A TNE' : 'CREAR MI CUENTA'}
              </button>
            </form>
          </div>
          
          <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between', opacity: 0.3, fontSize: '12px' }}>
            <span>ACCESO SEGURO AES-256</span>
            <span>¿OLVIDASTE TU CONTRASEÑA?</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
