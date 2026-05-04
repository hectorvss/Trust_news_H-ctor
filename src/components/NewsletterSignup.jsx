import React, { useState } from 'react';
import { subscribeToNewsletter } from '../supabaseService';
import { useAuth } from '../context/AuthContext';

const NewsletterSignup = ({ source = 'footer', variant = 'dark' }) => {
  const { user, profile } = useAuth();
  const [email, setEmail] = useState('');
  const [frequency, setFrequency] = useState('weekly');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ kind: null, msg: '' }); // success | error

  const isDark = variant === 'dark';
  const fg = isDark ? 'white' : 'black';
  const bg = isDark ? 'transparent' : '#fafafa';
  const borderColor = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ kind: null, msg: '' });
    if (!email.trim() || !email.includes('@')) {
      setStatus({ kind: 'error', msg: 'Introduce un email válido.' });
      return;
    }
    setLoading(true);
    const { error } = await subscribeToNewsletter({
      email: email.trim(),
      fullName: profile?.full_name || null,
      frequency,
      userId: user?.id || null,
      source
    });
    setLoading(false);
    if (error) {
      setStatus({ kind: 'error', msg: error });
    } else {
      setStatus({ kind: 'success', msg: 'Suscripción confirmada. Revisa tu bandeja.' });
      setEmail('');
    }
  };

  return (
    <div style={{ background: bg, color: fg, padding: '40px', border: `1px solid ${borderColor}`, fontFamily: 'var(--font-heading)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.4fr)', gap: '40px', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.5, letterSpacing: '2px', marginBottom: '12px' }}>NEWSLETTER TNE</div>
          <h3 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-1px', lineHeight: 1.05, margin: 0 }}>
            La actualidad sin sesgo,<br/>directa a tu bandeja.
          </h3>
          <p style={{ fontSize: '13px', opacity: 0.6, marginTop: '12px', lineHeight: 1.5, maxWidth: '420px' }}>
            Resumen editorial diario o semanal con análisis de cobertura, blindspots y datos de factualidad. Sin spam.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Frequency selector */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { v: 'daily', label: 'DIARIA' },
              { v: 'weekly', label: 'SEMANAL' },
              { v: 'breaking', label: 'SOLO URGENTE' }
            ].map(opt => {
              const active = frequency === opt.v;
              return (
                <button
                  type="button"
                  key={opt.v}
                  onClick={() => setFrequency(opt.v)}
                  style={{
                    flex: 1,
                    padding: '10px 8px',
                    border: `1px solid ${active ? fg : borderColor}`,
                    background: active ? fg : 'transparent',
                    color: active ? (isDark ? 'black' : 'white') : fg,
                    fontSize: '10px',
                    fontWeight: 900,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-mono)',
                    letterSpacing: '1px',
                    transition: '0.2s'
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Email input + submit */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="usuario@dominio.com"
              style={{
                flex: 1,
                padding: '14px 16px',
                background: 'transparent',
                color: fg,
                border: `1px solid ${borderColor}`,
                fontSize: '13px',
                fontFamily: 'inherit',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '14px 24px',
                background: fg,
                color: isDark ? 'black' : 'white',
                border: 'none',
                fontWeight: 900,
                fontSize: '11px',
                cursor: loading ? 'wait' : 'pointer',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '1px',
                opacity: loading ? 0.6 : 1,
                whiteSpace: 'nowrap'
              }}
            >
              {loading ? 'ENVIANDO...' : 'SUSCRIBIRME ↗'}
            </button>
          </div>

          {status.kind && (
            <div style={{
              padding: '10px 14px',
              border: `1px solid ${status.kind === 'success' ? '#10b981' : '#ef4444'}`,
              background: status.kind === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
              fontSize: '11px',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.5px'
            }}>
              {status.kind === 'success' ? '✓' : '✕'} {status.msg}
            </div>
          )}

          <div style={{ fontSize: '10px', opacity: 0.4, fontFamily: 'var(--font-mono)', letterSpacing: '0.5px' }}>
            AL SUSCRIBIRTE ACEPTAS NUESTRA POLÍTICA DE PRIVACIDAD. CANCELA EN UN CLIC.
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewsletterSignup;
