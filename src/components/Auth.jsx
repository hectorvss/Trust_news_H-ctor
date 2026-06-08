import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { useBreakpoint } from '../hooks/useBreakpoint';

const inputStyle = {
  width: '100%',
  background: 'none',
  border: 'none',
  borderBottom: 'var(--border-thin)',
  padding: '12px 0',
  fontSize: '18px',
  fontFamily: 'inherit',
  outline: 'none'
};

const sectionTitleStyle = (isMobile) => ({
  fontSize: isMobile ? '44px' : '80px',
  lineHeight: '0.9',
  letterSpacing: isMobile ? '-2px' : '-4px',
  marginBottom: '24px',
  color: 'var(--color-primary)',
  whiteSpace: 'pre-line'
});

const cardStyle = (isMobile) => ({
  padding: isMobile ? '28px 20px' : '60px',
  minHeight: 'auto'
});

const layoutStyle = (isMobile) => ({
  alignItems: 'flex-start',
  gap: isMobile ? '24px' : undefined
});

const messageStyle = (background) => ({
  padding: '16px',
  border: '2px solid black',
  background,
  fontSize: '13px',
  fontWeight: 700
});

const providerButtonBase = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
  width: '100%',
  padding: '15px 18px',
  border: 'var(--border-thin)',
  borderRadius: 'var(--radius-sm)',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 800,
  fontFamily: 'inherit',
  letterSpacing: '0.8px',
  transition: '0.2s',
  minHeight: '52px'
};

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
    <path d="M16.67 13.13c-.01-2.08 1.7-3.08 1.78-3.13-0.97-1.42-2.48-1.62-3.01-1.64-1.28-.13-2.5.75-3.15.75-.66 0-1.67-.73-2.74-.71-1.4.02-2.69.81-3.41 2.05-1.46 2.5-.37 6.2 1.05 8.24.7 1 1.53 2.11 2.61 2.07 1.04-.04 1.43-.67 2.69-.67 1.25 0 1.61.67 2.71.65 1.14-.02 1.86-1.02 2.55-2.02.8-1.14 1.13-2.25 1.15-2.31-.03-.01-2.21-.85-2.24-3.28Zm-2.06-6.09c.56-.68.94-1.62.84-2.56-.81.03-1.8.54-2.37 1.22-.51.6-.96 1.56-.84 2.48.91.07 1.83-.46 2.37-1.14Z" />
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
        ...providerButtonBase,
        background: isApple ? '#000' : '#fff',
        color: isApple ? '#fff' : '#111',
        borderColor: isApple ? '#000' : '#111',
        opacity: disabled ? 0.55 : 1,
        cursor: disabled ? 'wait' : 'pointer'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = isApple ? '#111' : '#f5f5f5';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = isApple ? '#000' : '#fff';
      }}
    >
      {isApple ? <AppleIcon /> : <GoogleIcon />}
      <span>{label}</span>
    </button>
  );
};

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
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setIsResetMode(true);
    }
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [isLogin, isResetMode, isResetRequest]);

  useEffect(() => {
    if (user && !isResetMode) {
      navigate('/');
    }
  }, [user, isResetMode, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
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
    setError(null);
    setSuccess(null);
    setOauthLoading(provider);
    const { error: oauthError } = await signInWithOAuth(provider);
    if (oauthError) {
      setError(oauthError.message || `No se pudo iniciar sesion con ${provider}.`);
      setOauthLoading(null);
    }
  };

  const handleResetRequest = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
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
    setError(null);
    setSuccess(null);

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

  if (isResetMode) {
    return (
      <div className="auth-page">
        <button
          onClick={onBack}
          className="tag"
          style={{ background: 'none', cursor: 'pointer', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          {'<-'} Volver al Inicio
        </button>

        <section style={{ padding: '0 0 60px 0', borderBottom: 'var(--border-thin)', marginBottom: '60px' }}>
          <h1 style={sectionTitleStyle(isMobile)}>{'Nueva\nContrasena.'}</h1>
          <p style={{ fontSize: isMobile ? '18px' : '24px', opacity: 0.6, maxWidth: '600px' }}>
            Introduce tu nueva contrasena. Debe tener al menos 6 caracteres.
          </p>
        </section>

        <div className="layout-split" style={layoutStyle(isMobile)}>
          {!isMobile && <div className="sidebar" />}
          <div className="main-content">
            <div className="story-card" style={cardStyle(isMobile)}>
              <form style={{ display: 'flex', flexDirection: 'column', gap: '32px' }} onSubmit={handlePasswordUpdate}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '1px', marginBottom: '12px', display: 'block' }}>
                    NUEVA CONTRASENA
                  </label>
                  <input type="password" placeholder="************" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '1px', marginBottom: '12px', display: 'block' }}>
                    CONFIRMAR CONTRASENA
                  </label>
                  <input type="password" placeholder="************" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} style={inputStyle} />
                </div>

                {error && <div style={messageStyle('#fff5f5')}>X {error}</div>}
                {success && <div style={messageStyle('#f0fff0')}>OK {success}</div>}

                <button
                  type="submit"
                  disabled={loading}
                  className="navbar__link"
                  style={{
                    background: loading ? '#666' : 'black',
                    color: 'white',
                    border: 'none',
                    padding: isMobile ? '18px' : '24px',
                    fontSize: '16px',
                    fontWeight: 700,
                    cursor: loading ? 'wait' : 'pointer',
                    marginTop: '8px',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  {loading ? 'GUARDANDO...' : 'ACTUALIZAR CONTRASENA'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isResetRequest) {
    return (
      <div className="auth-page">
        <button
          onClick={() => {
            setIsResetRequest(false);
            setError(null);
            setSuccess(null);
          }}
          className="tag"
          style={{ background: 'none', cursor: 'pointer', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          {'<-'} Volver al Login
        </button>

        <section style={{ padding: '0 0 60px 0', borderBottom: 'var(--border-thin)', marginBottom: '60px' }}>
          <h1 style={sectionTitleStyle(isMobile)}>{'Recuperar\nAcceso.'}</h1>
          <p style={{ fontSize: isMobile ? '18px' : '24px', opacity: 0.6, maxWidth: '600px' }}>
            Introduce tu email y te enviaremos un enlace para restablecer tu contrasena.
          </p>
        </section>

        <div className="layout-split" style={layoutStyle(isMobile)}>
          {!isMobile && <div className="sidebar" />}
          <div className="main-content">
            <div className="story-card" style={cardStyle(isMobile)}>
              <form style={{ display: 'flex', flexDirection: 'column', gap: '32px' }} onSubmit={handleResetRequest}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '1px', marginBottom: '12px', display: 'block' }}>
                    CORREO ELECTRONICO
                  </label>
                  <input type="email" placeholder="usuario@dominio.com" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
                </div>

                {error && <div style={messageStyle('#fff5f5')}>X {error}</div>}
                {success && <div style={messageStyle('#f0fff0')}>OK {success}</div>}

                <button
                  type="submit"
                  disabled={loading}
                  className="navbar__link"
                  style={{
                    background: loading ? '#666' : 'black',
                    color: 'white',
                    border: 'none',
                    padding: isMobile ? '18px' : '24px',
                    fontSize: '16px',
                    fontWeight: 700,
                    cursor: loading ? 'wait' : 'pointer',
                    marginTop: '8px',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  {loading ? 'ENVIANDO...' : 'ENVIAR ENLACE DE RECUPERACION'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page" style={{ paddingTop: isMobile ? '18px' : '24px', paddingBottom: isMobile ? '18px' : '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMobile ? '20px' : '28px', gap: '16px' }}>
        <button
          onClick={onBack}
          className="tag"
          style={{ background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          {'<-'} Volver al Inicio
        </button>
        <span style={{ fontSize: '11px', fontWeight: 800, fontFamily: 'var(--font-mono)', letterSpacing: '1.8px', opacity: 0.45, whiteSpace: 'nowrap' }}>
          ACCESO SEGURO AES-256
        </span>
      </div>

      <section style={{ padding: '0 0 18px 0', borderBottom: 'var(--border-thin)', marginBottom: '18px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1.05fr', gap: isMobile ? '14px' : '24px', alignItems: 'start' }}>
          <div>
            <h1 style={{ ...sectionTitleStyle(isMobile), fontSize: isMobile ? '38px' : '58px', marginBottom: '8px' }}>
              {isLogin ? 'Bienvenido de\nNuevo.' : 'Comienza tu\nContraste.'}
            </h1>
            <p style={{ fontSize: isMobile ? '16px' : '17px', opacity: 0.68, maxWidth: '520px', lineHeight: 1.45, marginBottom: '12px' }}>
              {isLogin
                ? 'Accede a tu panel personalizado de noticias y blindspots.'
                : 'Unete a la plataforma lider en analisis de sesgo mediatico en Espana.'}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
              {[
                'Feed personalizado',
                'Blindspot y analisis',
                'Lectura completa',
              ].map((item) => (
                <span key={item} className="tag" style={{ padding: '5px 11px', opacity: 0.85 }}>
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: isMobile ? 'flex-start' : 'flex-end', alignItems: 'flex-start' }}>
            <div className="story-card" style={{ ...cardStyle(isMobile), minHeight: 'auto', marginBottom: 0, position: 'relative', top: 0, width: '100%', maxWidth: isMobile ? '100%' : '620px', padding: isMobile ? '24px 18px' : '32px 28px' }}>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end', marginBottom: '18px' }}>
                <span
                  className="tag"
                  onClick={() => {
                    setIsLogin(true);
                    setError(null);
                    setSuccess(null);
                  }}
                  style={{
                    cursor: 'pointer',
                    background: isLogin ? 'black' : 'none',
                    color: isLogin ? 'white' : 'black',
                    padding: '9px 13px'
                  }}
                >
                  INICIAR SESION
                </span>
                <span
                  className="tag"
                  onClick={() => {
                    setIsLogin(false);
                    setError(null);
                    setSuccess(null);
                  }}
                  style={{
                    cursor: 'pointer',
                    background: !isLogin ? 'black' : 'none',
                    color: !isLogin ? 'white' : 'black',
                    padding: '9px 13px'
                  }}
                >
                  CREAR CUENTA
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '18px' }}>
                <OAuthButton provider="google" label="CONTINUAR CON GOOGLE" onClick={() => handleOAuth('google')} disabled={!!oauthLoading} />
                <OAuthButton provider="apple" label="CONTINUAR CON APPLE" onClick={() => handleOAuth('apple')} disabled={!!oauthLoading} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '18px' }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--color-primary)', opacity: 0.2 }} />
                <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', opacity: 0.4 }}>O CON EMAIL</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--color-primary)', opacity: 0.2 }} />
              </div>

              <form style={{ display: 'flex', flexDirection: 'column', gap: '18px' }} onSubmit={handleSubmit}>
                {!isLogin && (
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>
                      NOMBRE COMPLETO
                    </label>
                    <input type="text" placeholder="Tu nombre aqui..." value={fullName} onChange={(e) => setFullName(e.target.value)} style={inputStyle} />
                  </div>
                )}

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>
                    CORREO ELECTRONICO
                  </label>
                  <input type="email" placeholder="usuario@dominio.com" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>
                    CONTRASENA
                  </label>
                  <input type="password" placeholder="************" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} style={inputStyle} />
                </div>

                {error && <div style={messageStyle('#fff5f5')}>X {error}</div>}
                {success && <div style={messageStyle('#f0fff0')}>OK {success}</div>}

                <button
                  type="submit"
                  disabled={loading}
                  className="navbar__link"
                  style={{
                    background: loading ? '#666' : 'black',
                    color: 'white',
                    border: 'none',
                    padding: isMobile ? '16px' : '18px',
                    fontSize: '15px',
                    fontWeight: 800,
                    cursor: loading ? 'wait' : 'pointer',
                    marginTop: '4px',
                    opacity: loading ? 0.7 : 1,
                    transition: '0.2s',
                    width: '100%',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  {loading ? 'PROCESANDO...' : isLogin ? 'ACCEDER A TNE' : 'CREAR MI CUENTA'}
                </button>
              </form>

              <div
                style={{
                  marginTop: '14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '16px',
                  flexDirection: isMobile ? 'column' : 'row',
                  opacity: 0.45,
                  fontSize: '12px'
                }}
              >
                <span
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setIsResetRequest(true);
                    setError(null);
                    setSuccess(null);
                  }}
                >
                  OLVIDASTE TU CONTRASENA?
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Auth;
