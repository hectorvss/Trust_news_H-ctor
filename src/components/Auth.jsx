import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { useBreakpoint } from '../hooks/useBreakpoint';

const inputStyle = {
  width: '100%',
  background: 'transparent',
  border: 'none',
  borderBottom: 'var(--border-thin)',
  padding: '10px 0 12px',
  fontSize: '17px',
  fontFamily: 'inherit',
  outline: 'none'
};

const labelStyle = {
  fontSize: '11px',
  fontWeight: 900,
  fontFamily: 'var(--font-mono)',
  letterSpacing: '1.2px',
  marginBottom: '7px',
  display: 'block'
};

const messageStyle = (background) => ({
  padding: '13px 14px',
  border: 'var(--border-thin)',
  borderRadius: '8px',
  background,
  fontSize: '13px',
  fontWeight: 700,
  lineHeight: 1.35
});

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const AppleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
    <path d="M16.67 13.13c-.01-2.08 1.7-3.08 1.78-3.13-.97-1.42-2.48-1.62-3.01-1.64-1.28-.13-2.5.75-3.15.75-.66 0-1.67-.73-2.74-.71-1.4.02-2.69.81-3.41 2.05-1.46 2.5-.37 6.2 1.05 8.24.7 1 1.53 2.11 2.61 2.07 1.04-.04 1.43-.67 2.69-.67 1.25 0 1.61.67 2.71.65 1.14-.02 1.86-1.02 2.55-2.02.8-1.14 1.13-2.25 1.15-2.31-.03-.01-2.21-.85-2.24-3.28Zm-2.06-6.09c.56-.68.94-1.62.84-2.56-.81.03-1.8.54-2.37 1.22-.51.6-.96 1.56-.84 2.48.91.07 1.83-.46 2.37-1.14Z" />
  </svg>
);

const OAuthButton = ({ provider, label, onClick, disabled = false }) => {
  const isApple = provider === 'apple';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        height: 50,
        width: '100%',
        border: 'var(--border-thin)',
        borderRadius: '8px',
        background: isApple ? '#000' : '#fff',
        color: isApple ? '#fff' : '#111',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        cursor: disabled ? 'wait' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        fontSize: '13px',
        fontWeight: 900,
        fontFamily: 'var(--font-mono)',
        letterSpacing: '0.2px'
      }}
    >
      {isApple ? <AppleIcon /> : <GoogleIcon />}
      {label}
    </button>
  );
};

const SegmentedControl = ({ isLogin, onLogin, onSignup }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      border: 'var(--border-thin)',
      borderRadius: '8px',
      overflow: 'hidden',
      background: '#fff'
    }}
  >
    {[
      ['INICIAR SESION', isLogin, onLogin],
      ['CREAR CUENTA', !isLogin, onSignup],
    ].map(([label, active, action]) => (
      <button
        key={label}
        type="button"
        onClick={action}
        style={{
          height: 44,
          border: 'none',
          borderRight: label === 'INICIAR SESION' ? 'var(--border-thin)' : 'none',
          background: active ? '#000' : '#fff',
          color: active ? '#fff' : '#111',
          cursor: 'pointer',
          fontSize: '11px',
          fontWeight: 900,
          fontFamily: 'var(--font-mono)',
          letterSpacing: '0.2px'
        }}
      >
        {label}
      </button>
    ))}
  </div>
);

const Auth = ({ onBack }) => {
  const navigate = useNavigate();
  const { signIn, signUp, signInWithOAuth, user } = useAuth();
  const { isMobile } = useBreakpoint();

  const [isLogin, setIsLogin] = useState(true);
  const [isResetRequest, setIsResetRequest] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (window.location.hash.includes('type=recovery')) setIsResetMode(true);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [isLogin, isResetMode, isResetRequest]);

  useEffect(() => {
    if (user && !isResetMode) navigate('/');
  }, [user, isResetMode, navigate]);

  const clearFeedback = () => {
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    clearFeedback();
    setLoading(true);

    if (isLogin) {
      const { error: signInError } = await signIn(email, password);
      if (signInError) {
        setError(
          signInError.message === 'Invalid login credentials'
            ? 'Credenciales incorrectas. Verifica tu email y contrasena.'
            : signInError.message
        );
      } else {
        navigate('/');
      }
    } else {
      if (!fullName.trim()) {
        setError('El nombre es obligatorio.');
        setLoading(false);
        return;
      }

      const { error: signUpError } = await signUp(email, password, fullName);
      if (signUpError) {
        setError(signUpError.message);
      } else {
        setSuccess('Cuenta creada. Revisa tu email para confirmar tu direccion.');
      }
    }

    setLoading(false);
  };

  const handleOAuth = async (provider) => {
    clearFeedback();
    setOauthLoading(provider);
    const { error: oauthError } = await signInWithOAuth(provider);
    if (oauthError) {
      setError(oauthError.message || `No se pudo iniciar sesion con ${provider}.`);
      setOauthLoading(null);
    }
  };

  const handleResetRequest = async (event) => {
    event.preventDefault();
    clearFeedback();
    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`
    });

    if (resetError) {
      setError(resetError.message);
    } else {
      setSuccess('Revisa tu bandeja de entrada. Te hemos enviado un enlace para restablecer tu contrasena.');
    }

    setLoading(false);
  };

  const handlePasswordUpdate = async (event) => {
    event.preventDefault();
    clearFeedback();

    if (newPassword.length < 6) {
      setError('La contrasena debe tener al menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contrasenas no coinciden.');
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess('Contrasena actualizada correctamente. Ya puedes iniciar sesion.');
      window.history.replaceState(null, '', window.location.pathname);
      setIsResetMode(false);
    }
    setLoading(false);
  };

  const switchMode = (nextIsLogin) => {
    setIsLogin(nextIsLogin);
    clearFeedback();
  };

  if (isResetMode || isResetRequest) {
    const isUpdate = isResetMode;

    return (
      <div className="auth-page" style={{ minHeight: 'calc(100vh - 160px)' }}>
        <button
          onClick={isUpdate ? onBack : () => { setIsResetRequest(false); clearFeedback(); }}
          className="tag"
          style={{ background: 'none', cursor: 'pointer', marginBottom: 24 }}
        >
          {'<-'} {isUpdate ? 'Volver al Inicio' : 'Volver al Login'}
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '0.9fr 1.1fr', gap: 28, alignItems: 'start' }}>
          <div>
            <h1 style={{ fontSize: isMobile ? 44 : 72, lineHeight: 0.95, letterSpacing: '-3px', marginBottom: 16 }}>
              {isUpdate ? 'Nueva\nContrasena.' : 'Recuperar\nAcceso.'}
            </h1>
            <p style={{ fontSize: 18, lineHeight: 1.45, opacity: 0.65, maxWidth: 440 }}>
              {isUpdate
                ? 'Introduce tu nueva contrasena. Debe tener al menos 6 caracteres.'
                : 'Introduce tu email y te enviaremos un enlace para restablecer tu contrasena.'}
            </p>
          </div>

          <div className="story-card" style={{ padding: isMobile ? 22 : 32, minHeight: 'auto', margin: 0, cursor: 'default', transform: 'none', borderRadius: 8 }}>
            <form style={{ display: 'grid', gap: 22 }} onSubmit={isUpdate ? handlePasswordUpdate : handleResetRequest}>
              {isUpdate ? (
                <>
                  <div>
                    <label style={labelStyle}>NUEVA CONTRASENA</label>
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>CONFIRMAR CONTRASENA</label>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} style={inputStyle} />
                  </div>
                </>
              ) : (
                <div>
                  <label style={labelStyle}>CORREO ELECTRONICO</label>
                  <input type="email" placeholder="usuario@dominio.com" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
                </div>
              )}

              {error && <div style={messageStyle('#fff5f5')}>X {error}</div>}
              {success && <div style={messageStyle('#f0fff0')}>OK {success}</div>}

              <button type="submit" disabled={loading} style={{ height: 54, border: 'none', borderRadius: 8, background: loading ? '#666' : '#000', color: '#fff', cursor: loading ? 'wait' : 'pointer', fontWeight: 900, fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                {loading ? 'PROCESANDO...' : isUpdate ? 'ACTUALIZAR CONTRASENA' : 'ENVIAR ENLACE'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page" style={{ minHeight: 'calc(100vh - 150px)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isMobile ? 24 : 34 }}>
        <button onClick={onBack} className="tag" style={{ background: 'none', cursor: 'pointer' }}>
          {'<-'} Volver al Inicio
        </button>
      </div>

      <section style={{ borderBottom: 'none', padding: 0 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'minmax(520px, 1fr) minmax(430px, 0.82fr)',
            gap: isMobile ? 24 : 36,
            alignItems: 'start'
          }}
        >
          <aside style={{ paddingTop: isMobile ? 0 : 12 }}>
            <div style={{ maxWidth: 650 }}>
              <div style={{ fontSize: 11, fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '1.5px', opacity: 0.35, marginBottom: 18 }}>
                TNE / ACCESO
              </div>
              <h1 style={{ fontSize: isMobile ? 46 : 76, lineHeight: 0.92, letterSpacing: '-3px', marginBottom: 18 }}>
                {isLogin ? 'Bienvenido de\nNuevo.' : 'Crear\nCuenta.'}
              </h1>
              <p style={{ fontSize: isMobile ? 17 : 21, lineHeight: 1.42, opacity: 0.68, marginBottom: 26, maxWidth: 560 }}>
                {isLogin
                  ? 'Accede a tu panel personalizado de noticias y blindspots.'
                  : 'Unete a la plataforma lider en analisis de sesgo mediatico en Espana.'}
              </p>

              <div style={{ border: 'var(--border-thin)', borderRadius: 8, padding: isMobile ? 18 : 24, background: '#fff', maxWidth: 600, minHeight: isMobile ? 'auto' : 540 }}>
                <div style={{ fontSize: 11, fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '1.4px', opacity: 0.42, marginBottom: 12 }}>
                  {isLogin ? 'ENTRAR RAPIDO' : 'EMPEZAR AHORA'}
                </div>
                <p style={{ fontSize: 18, lineHeight: 1.42, fontWeight: 800, marginBottom: 16, maxWidth: 500 }}>
                  {isLogin
                    ? 'Vuelve a tu feed, tus guardados, tu sesgo de lectura y Toddy desde una sola cuenta.'
                    : 'Crea tu cuenta para activar lectura personalizada, analisis completo y acceso a Toddy.'}
                </p>
                <div style={{ display: 'grid', gap: 12 }}>
                  {[
                    ['LECTURA PERSONALIZADA', isLogin ? 'Retoma tus noticias, filtros y guardados donde los dejaste.' : 'Construye un feed que aprende de tus intereses y tus temas clave.'],
                    ['ANALISIS Y SESGO', 'Consulta blindspots, distribucion ideologica y contexto editorial en cada noticia.'],
                    ['TODDY IA', 'Pregunta sobre una noticia y conserva la conversacion asociada a tu cuenta.'],
                  ].map(([title, text]) => (
                    <div key={title} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '150px 1fr', gap: isMobile ? 6 : 16, borderTop: '1px solid rgba(0,0,0,0.14)', paddingTop: 12 }}>
                      <div style={{ fontSize: 10, fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '1.2px', opacity: 0.42 }}>{title}</div>
                      <div style={{ fontSize: 14, lineHeight: 1.45, opacity: 0.7 }}>{text}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(0,0,0,0.14)', display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '1.2px', opacity: 0.48 }}>GOOGLE / APPLE / EMAIL</span>
                  <span style={{ fontSize: 13, opacity: 0.58 }}>Acceso seguro y recuperacion de contrasena incluida.</span>
                </div>
              </div>
            </div>
          </aside>

          <div
            className="story-card"
            style={{
              width: '100%',
              maxWidth: 620,
              justifySelf: isMobile ? 'stretch' : 'end',
              padding: isMobile ? 22 : 34,
              minHeight: isMobile ? 'auto' : 540,
              margin: isMobile ? 0 : '284px 0 0',
              cursor: 'default',
              transform: 'none',
              borderRadius: 8,
              background: '#fff'
            }}
          >
            <div style={{ display: 'grid', gap: 22 }}>
              <div style={{ display: 'grid', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '1.2px', opacity: 0.45 }}>
                      ACCESO SEGURO
                    </div>
                    <div style={{ marginTop: 4, fontSize: 24, lineHeight: 1.1, fontWeight: 800, letterSpacing: '-0.5px' }}>
                      {isLogin ? 'Inicia sesion' : 'Crea tu cuenta'}
                    </div>
                  </div>
                </div>

                <SegmentedControl
                  isLogin={isLogin}
                  onLogin={() => switchMode(true)}
                  onSignup={() => switchMode(false)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 10 }}>
                <OAuthButton provider="google" label="GOOGLE" onClick={() => handleOAuth('google')} disabled={!!oauthLoading} />
                <OAuthButton provider="apple" label="APPLE" onClick={() => handleOAuth('apple')} disabled={!!oauthLoading} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ height: 1, background: '#000', opacity: 0.16, flex: 1 }} />
                <span style={{ fontSize: 10, fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '1.4px', opacity: 0.38 }}>
                  O CON EMAIL
                </span>
                <div style={{ height: 1, background: '#000', opacity: 0.16, flex: 1 }} />
              </div>

              <form style={{ display: 'grid', gap: 18 }} onSubmit={handleSubmit}>
                {!isLogin && (
                  <div>
                    <label style={labelStyle}>NOMBRE COMPLETO</label>
                    <input type="text" placeholder="Tu nombre aqui..." value={fullName} onChange={(e) => setFullName(e.target.value)} style={inputStyle} />
                  </div>
                )}

                <div>
                  <label style={labelStyle}>CORREO ELECTRONICO</label>
                  <input type="email" placeholder="usuario@dominio.com" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
                </div>

                <div>
                  <label style={labelStyle}>CONTRASENA</label>
                  <input type="password" placeholder="************" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} style={inputStyle} />
                </div>

                {error && <div style={messageStyle('#fff5f5')}>X {error}</div>}
                {success && <div style={messageStyle('#f0fff0')}>OK {success}</div>}

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    height: 56,
                    border: 'none',
                    borderRadius: 8,
                    background: loading ? '#666' : '#000',
                    color: '#fff',
                    cursor: loading ? 'wait' : 'pointer',
                    fontWeight: 900,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                    letterSpacing: '0.2px'
                  }}
                >
                  {loading ? 'PROCESANDO...' : isLogin ? 'ACCEDER A TNE' : 'CREAR MI CUENTA'}
                </button>
              </form>

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, fontSize: 12, opacity: 0.52, flexDirection: isMobile ? 'column' : 'row' }}>
                <span
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setIsResetRequest(true);
                    clearFeedback();
                  }}
                >
                  OLVIDASTE TU CONTRASENA?
                </span>
                <span>Al continuar aceptas privacidad y terminos.</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Auth;
