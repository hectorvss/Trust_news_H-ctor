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

const AccessLine = ({ label, text }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: 18, padding: '18px 0', borderTop: '1px solid rgba(255,255,255,0.18)' }}>
    <div style={{ fontSize: 10, fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '1.2px', opacity: 0.5 }}>
      {label}
    </div>
    <div style={{ fontSize: 15, lineHeight: 1.45, opacity: 0.82 }}>
      {text}
    </div>
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
  const [mfaStep, setMfaStep] = useState(false);
  const [mfaCode, setMfaCode] = useState('');

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
        const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (aal && aal.nextLevel === 'aal2' && aal.currentLevel !== 'aal2') {
          setMfaStep(true);
          setLoading(false);
          return;
        }
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

  const handleMfaVerify = async (event) => {
    event.preventDefault();
    clearFeedback();
    setLoading(true);
    const { data: factorsData } = await supabase.auth.mfa.listFactors();
    const factor = factorsData?.totp?.[0];
    if (!factor) { setError('No hay 2FA configurado.'); setLoading(false); return; }
    const { data: ch, error: chErr } = await supabase.auth.mfa.challenge({ factorId: factor.id });
    if (chErr) { setError(chErr.message); setLoading(false); return; }
    const { error: vErr } = await supabase.auth.mfa.verify({ factorId: factor.id, challengeId: ch.id, code: mfaCode.trim() });
    setLoading(false);
    if (vErr) { setError('Codigo incorrecto.'); return; }
    setMfaStep(false); setMfaCode('');
    navigate('/');
  };

  const switchMode = (nextIsLogin) => {
    setIsLogin(nextIsLogin);
    clearFeedback();
  };

  if (mfaStep) {
    return (
      <div className="auth-page" style={{ minHeight: 'calc(100vh - 160px)' }}>
        <div style={{ maxWidth: 460, margin: '0 auto' }}>
          <h1 style={{ fontSize: 44, lineHeight: 0.95, letterSpacing: '-2px', marginBottom: 16 }}>Verificacion en dos pasos.</h1>
          <p style={{ fontSize: 16, opacity: 0.65, marginBottom: 24 }}>Introduce el codigo de 6 digitos de tu app de autenticacion.</p>
          <form onSubmit={handleMfaVerify} style={{ display: 'grid', gap: 18 }}>
            <input value={mfaCode} onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" inputMode="numeric" style={{ ...inputStyle, fontSize: 28, letterSpacing: '8px', textAlign: 'center' }} />
            {error && <div style={messageStyle('#fff5f5')}>X {error}</div>}
            <button type="submit" disabled={loading || mfaCode.length !== 6} style={{ height: 54, border: 'none', borderRadius: 8, background: (loading || mfaCode.length !== 6) ? '#666' : '#000', color: '#fff', cursor: 'pointer', fontWeight: 900, fontFamily: 'var(--font-mono)', fontSize: 12 }}>{loading ? 'VERIFICANDO...' : 'VERIFICAR'}</button>
            <span style={{ cursor: 'pointer', fontSize: 12, opacity: 0.5 }} onClick={async () => { await supabase.auth.signOut(); setMfaStep(false); setMfaCode(''); clearFeedback(); }}>Cancelar y salir</span>
          </form>
        </div>
      </div>
    );
  }

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
      <section style={{ borderBottom: 'none', padding: 0 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1fr) 520px',
          gap: isMobile ? 18 : 24,
          alignItems: 'stretch'
        }}>
          <aside
            className="story-card"
            style={{
              margin: 0,
              minHeight: isMobile ? 'auto' : 660,
              padding: isMobile ? 26 : 42,
              borderRadius: 8,
              cursor: 'default',
              transform: 'none',
              background: '#050505',
              color: '#fff',
              overflow: 'hidden'
            }}
          >
            <div>
              <button
                onClick={onBack}
                className="tag"
                style={{ background: 'transparent', color: '#fff', borderColor: 'rgba(255,255,255,0.55)', cursor: 'pointer', marginBottom: isMobile ? 36 : 54 }}
              >
                {'<-'} Volver al Inicio
              </button>

              <div style={{ fontSize: 11, fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '1.5px', opacity: 0.42, marginBottom: 18 }}>
                TNE / ACCESO
              </div>
              <h1 style={{ fontSize: isMobile ? 48 : 84, lineHeight: 0.9, letterSpacing: '-3px', marginBottom: 22, maxWidth: 720 }}>
                {isLogin ? 'Bienvenido de\nNuevo.' : 'Crear\nCuenta.'}
              </h1>
              <p style={{ fontSize: isMobile ? 17 : 22, lineHeight: 1.38, opacity: 0.72, maxWidth: 650, marginBottom: isMobile ? 30 : 44 }}>
                {isLogin
                  ? 'Accede a tu panel personalizado de noticias y blindspots.'
                  : 'Unete a la plataforma lider en analisis de sesgo mediatico en Espana.'}
              </p>

              <div style={{ maxWidth: 720 }}>
                <AccessLine
                  label={isLogin ? 'RETOMA' : 'ACTIVA'}
                  text={isLogin ? 'Tu feed, guardados, lectura por sesgo y conversaciones con Toddy vuelven contigo.' : 'Lectura personalizada, analisis completo y acceso a Toddy quedan vinculados a tu cuenta.'}
                />
                <AccessLine
                  label="CONTRASTE"
                  text="Cada noticia conecta fuentes, blindspots, distribucion ideologica y contexto editorial."
                />
                <AccessLine
                  label="SIN FRICCION"
                  text="Google y Apple son la entrada principal; email sigue disponible como alternativa segura."
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.18)', paddingTop: 18, marginTop: isMobile ? 32 : 48 }}>
              <span style={{ fontSize: 11, fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '1.2px', opacity: 0.5 }}>GOOGLE / APPLE / EMAIL</span>
              <span style={{ fontSize: 13, opacity: 0.62 }}>Acceso seguro y recuperacion de contrasena incluida.</span>
            </div>
          </aside>

          <div
            className="story-card"
            style={{
              margin: 0,
              minHeight: isMobile ? 'auto' : 660,
              padding: isMobile ? 22 : 34,
              borderRadius: 8,
              cursor: 'default',
              transform: 'none',
              background: '#fff'
            }}
          >
            <div style={{ display: 'grid', gap: 22 }}>
              <div style={{ display: 'grid', gap: 14 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '1.2px', opacity: 0.45 }}>
                    ACCESO SEGURO
                  </div>
                  <div style={{ marginTop: 6, fontSize: 28, lineHeight: 1.1, fontWeight: 850, letterSpacing: '-0.5px' }}>
                    {isLogin ? 'Inicia sesion' : 'Crea tu cuenta'}
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
