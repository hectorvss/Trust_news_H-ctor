import React, { useState, useEffect } from 'react';
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
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Detect Supabase recovery token in URL hash
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setIsResetMode(true);
    }
  }, []);

  // Redirect after OAuth callback (user lands at /auth already logged in)
  useEffect(() => {
    if (user && !isResetMode) {
      navigate('/');
    }
  }, [user, isResetMode, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error.message === 'Invalid login credentials'
          ? 'Credenciales incorrectas. Verifica tu email y contraseña.'
          : error.message);
      } else {
        navigate('/');
      }
    } else {
      if (!fullName.trim()) {
        setError('El nombre es obligatorio.');
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password, fullName);
      if (error) {
        setError(error.message);
      } else {
        setSuccess('Cuenta creada. Revisa tu email para confirmar tu dirección.');
      }
    }

    setLoading(false);
  };

  const handleResetRequest = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess('Revisa tu bandeja de entrada. Te hemos enviado un enlace para restablecer tu contraseña.');
    }
    setLoading(false);
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setError(error.message);
    } else {
      setSuccess('Contraseña actualizada correctamente. Ya puedes iniciar sesión.');
      window.history.replaceState(null, '', window.location.pathname);
      setIsResetMode(false);
    }
    setLoading(false);
  };

  // ── Reset mode: user arrived via email link ──────────────────────────
  if (isResetMode) {
    return (
      <div className="auth-page">
        <button onClick={onBack} className="tag" style={{ background: 'none', cursor: 'pointer', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          ← Volver al Inicio
        </button>

        <section style={{ padding: '0 0 60px 0', borderBottom: 'var(--border-thin)', marginBottom: '60px' }}>
          <h1 style={{ fontSize: isMobile ? '44px' : '80px', lineHeight: '0.9', letterSpacing: isMobile ? '-2px' : '-4px', marginBottom: '24px', color: 'var(--color-primary)' }}>
            Nueva<br/>Contraseña.
          </h1>
          <p style={{ fontSize: '24px', opacity: 0.6, maxWidth: '600px' }}>
            Introduce tu nueva contraseña. Debe tener al menos 6 caracteres.
          </p>
        </section>

        <div className="layout-split" style={{ alignItems: 'flex-start' }}>
          <div className="sidebar" />
          <div className="main-content">
            <div className="story-card" style={{ padding: '60px', minHeight: 'auto' }}>
              <form style={{ display: 'flex', flexDirection: 'column', gap: '40px' }} onSubmit={handlePasswordUpdate}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '1px', marginBottom: '12px', display: 'block' }}>NUEVA CONTRASEÑA</label>
                  <input type="password" placeholder="••••••••••••" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '1px', marginBottom: '12px', display: 'block' }}>CONFIRMAR CONTRASEÑA</label>
                  <input type="password" placeholder="••••••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={6} style={inputStyle} />
                </div>

                {error && <div style={{ padding: '16px', border: '2px solid black', background: '#fff5f5', fontSize: '13px', fontWeight: 700 }}>✕ {error}</div>}
                {success && <div style={{ padding: '16px', border: '2px solid black', background: '#f0fff0', fontSize: '13px', fontWeight: 700 }}>✓ {success}</div>}

                <button type="submit" disabled={loading} className="navbar__link" style={{ background: loading ? '#666' : 'black', color: 'white', border: 'none', padding: '24px', fontSize: '16px', fontWeight: 700, cursor: loading ? 'wait' : 'pointer', marginTop: '20px', opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'GUARDANDO...' : 'ACTUALIZAR CONTRASEÑA'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Reset request mode: user wants to recover password ───────────────
  if (isResetRequest) {
    return (
      <div className="auth-page">
        <button onClick={() => { setIsResetRequest(false); setError(null); setSuccess(null); }} className="tag" style={{ background: 'none', cursor: 'pointer', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          ← Volver al Login
        </button>

        <section style={{ padding: '0 0 60px 0', borderBottom: 'var(--border-thin)', marginBottom: '60px' }}>
          <h1 style={{ fontSize: isMobile ? '44px' : '80px', lineHeight: '0.9', letterSpacing: isMobile ? '-2px' : '-4px', marginBottom: '24px', color: 'var(--color-primary)' }}>
            Recuperar<br/>Acceso.
          </h1>
          <p style={{ fontSize: '24px', opacity: 0.6, maxWidth: '600px' }}>
            Introduce tu email y te enviaremos un enlace para restablecer tu contraseña.
          </p>
        </section>

        <div className="layout-split" style={{ alignItems: 'flex-start' }}>
          <div className="sidebar" />
          <div className="main-content">
            <div className="story-card" style={{ padding: '60px', minHeight: 'auto' }}>
              <form style={{ display: 'flex', flexDirection: 'column', gap: '40px' }} onSubmit={handleResetRequest}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '1px', marginBottom: '12px', display: 'block' }}>CORREO ELECTRÓNICO</label>
                  <input type="email" placeholder="usuario@dominio.com" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} />
                </div>

                {error && <div style={{ padding: '16px', border: '2px solid black', background: '#fff5f5', fontSize: '13px', fontWeight: 700 }}>✕ {error}</div>}
                {success && <div style={{ padding: '16px', border: '2px solid black', background: '#f0fff0', fontSize: '13px', fontWeight: 700 }}>✓ {success}</div>}

                <button type="submit" disabled={loading} className="navbar__link" style={{ background: loading ? '#666' : 'black', color: 'white', border: 'none', padding: '24px', fontSize: '16px', fontWeight: 700, cursor: loading ? 'wait' : 'pointer', marginTop: '20px', opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'ENVIANDO...' : 'ENVIAR ENLACE DE RECUPERACIÓN'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Normal login / register mode ─────────────────────────────────────
  return (
    <div className="auth-page">
      <button onClick={onBack} className="tag" style={{ background: 'none', cursor: 'pointer', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        ← Volver al Inicio
      </button>

      <section style={{ padding: '0 0 60px 0', borderBottom: 'var(--border-thin)', marginBottom: '60px' }}>
        <h1 style={{ fontSize: isMobile ? '44px' : '80px', lineHeight: '0.9', letterSpacing: isMobile ? '-2px' : '-4px', marginBottom: '24px', color: 'var(--color-primary)' }}>
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
            <span className="tag" onClick={() => { setIsLogin(true); setError(null); setSuccess(null); }} style={{ cursor: 'pointer', background: isLogin ? 'black' : 'none', color: isLogin ? 'white' : 'black', textAlign: 'center', padding: '12px' }}>
              INICIAR SESIÓN
            </span>
            <span className="tag" onClick={() => { setIsLogin(false); setError(null); setSuccess(null); }} style={{ cursor: 'pointer', background: !isLogin ? 'black' : 'none', color: !isLogin ? 'white' : 'black', textAlign: 'center', padding: '12px' }}>
              CREAR CUENTA
            </span>
          </div>
          <p style={{ marginTop: '40px', fontSize: '13px', opacity: 0.5, lineHeight: '1.4' }}>
            Al continuar, aceptas nuestros términos de servicio y política de privacidad de datos analíticos.
          </p>
        </div>

        <div className="main-content">
          <div className="story-card" style={{ padding: '60px', minHeight: 'auto' }}>
            {/* OAuth buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '40px' }}>
              <button
                type="button"
                onClick={() => signInWithOAuth('google')}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '16px 24px', border: 'var(--border-thin)', background: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: 700, fontFamily: 'inherit', letterSpacing: '1px', transition: '0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
                onMouseLeave={e => e.currentTarget.style.background = 'white'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                CONTINUAR CON GOOGLE
              </button>
              <button
                type="button"
                onClick={() => signInWithOAuth('github')}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '16px 24px', border: 'none', background: '#24292e', color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: 700, fontFamily: 'inherit', letterSpacing: '1px', transition: '0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#1a1e22'}
                onMouseLeave={e => e.currentTarget.style.background = '#24292e'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                CONTINUAR CON GITHUB
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--color-primary)', opacity: 0.2 }} />
              <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', opacity: 0.4 }}>O CON EMAIL</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--color-primary)', opacity: 0.2 }} />
            </div>

            <form style={{ display: 'flex', flexDirection: 'column', gap: '40px' }} onSubmit={handleSubmit}>
              {!isLogin && (
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '1px', marginBottom: '12px', display: 'block' }}>NOMBRE COMPLETO</label>
                  <input type="text" placeholder="Tu nombre aquí..." value={fullName} onChange={e => setFullName(e.target.value)} style={inputStyle} />
                </div>
              )}

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '1px', marginBottom: '12px', display: 'block' }}>CORREO ELECTRÓNICO</label>
                <input type="email" placeholder="usuario@dominio.com" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '1px', marginBottom: '12px', display: 'block' }}>CONTRASEÑA</label>
                <input type="password" placeholder="••••••••••••" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} style={inputStyle} />
              </div>

              {error && <div style={{ padding: '16px', border: '2px solid black', background: '#fff5f5', fontSize: '13px', fontWeight: 700 }}>✕ {error}</div>}
              {success && <div style={{ padding: '16px', border: '2px solid black', background: '#f0fff0', fontSize: '13px', fontWeight: 700 }}>✓ {success}</div>}

              <button type="submit" disabled={loading} className="navbar__link" style={{ background: loading ? '#666' : 'black', color: 'white', border: 'none', padding: '24px', fontSize: '16px', fontWeight: 700, cursor: loading ? 'wait' : 'pointer', marginTop: '20px', opacity: loading ? 0.7 : 1, transition: '0.2s' }}>
                {loading ? 'PROCESANDO...' : (isLogin ? 'ACCEDER A TNE' : 'CREAR MI CUENTA')}
              </button>
            </form>
          </div>

          <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between', opacity: 0.3, fontSize: '12px' }}>
            <span>ACCESO SEGURO AES-256</span>
            <span style={{ cursor: 'pointer' }} onClick={() => { setIsResetRequest(true); setError(null); setSuccess(null); }}>
              ¿OLVIDASTE TU CONTRASEÑA?
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
