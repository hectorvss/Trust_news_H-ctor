import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useBreakpoint } from '../hooks/useBreakpoint';

const Pricing = ({ onBack }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isMobile, isTablet } = useBreakpoint();
  const [isAnnual, setIsAnnual] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (planSlug) => {
    if (planSlug === 'free') {
      onBack();
      return;
    }

    if (!user) {
      alert('Por favor inicia sesion o crea una cuenta primero.');
      navigate('/auth');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/stripe?type=checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_slug: isAnnual ? `${planSlug}_yearly` : `${planSlug}_monthly`,
          user_id: user.id,
          email: user.email,
          return_url: window.location.origin
        })
      });

      const session = await response.json();
      if (session.url) {
        window.location.href = session.url;
      } else {
        alert('Error al iniciar suscripcion.');
      }
    } catch (err) {
      console.error(err);
      alert('Error al conectar con el servidor de pagos.');
    } finally {
      setLoading(false);
    }
  };

  const plans = {
    free: {
      name: 'ESTANDAR',
      price: '0EUR',
      period: 'Gratis para siempre',
      features: [
        { text: '[+] Feed de noticias mundial', include: true },
        { text: '[+] Sesgo basico (3 fuentes)', include: true },
        { text: '[-] Noticias completas redactadas', include: false },
        { text: '[-] Analisis de blindspots ilimitado', include: false }
      ],
      buttonText: 'SEGUIR GRATIS',
      slug: 'free'
    },
    premium: {
      name: 'PREMIUM',
      price: isAnnual ? '40EUR' : '4EUR',
      period: isAnnual ? 'Al ano' : 'Al mes',
      features: [
        { text: '[+] Noticias completas y premium', include: true },
        { text: '[+] Blindspots de Espana ilimitados', include: true },
        { text: '[+] Graficos de sesgo avanzados', include: true },
        { text: '[+] Sin anuncios ni tracking', include: true }
      ],
      buttonText: 'SUSCRIBIRSE AHORA',
      slug: 'premium'
    },
    elite: {
      name: 'ELITE',
      price: isAnnual ? '80EUR' : '8EUR',
      period: isAnnual ? 'Al ano' : 'Al mes',
      features: [
        { text: '[+] Todo lo del plan Premium', include: true },
        { text: '[+] Acceso a API de datos TNE', include: true },
        { text: '[+] Reportes semanales de sesgo', include: true },
        { text: '[+] Soporte prioritario 24/7', include: true },
        { text: '[+] Exportacion de datos analiticos', include: true }
      ],
      buttonText: 'EMPEZAR ELITE',
      slug: 'elite'
    }
  };

  const Card = ({ plan, isDark, isGrey }) => (
    <div
      style={{
        background: isDark ? 'var(--color-primary)' : isGrey ? '#f5f5f5' : 'white',
        color: isDark ? 'white' : 'black',
        padding: isMobile ? '32px 20px' : isTablet ? '40px 28px' : '60px 40px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%'
      }}
    >
      <div>
        <span
          className="tag"
          style={{
            border: 'none',
            background: isDark ? '#333' : isGrey ? 'black' : '#eee',
            color: isDark || isGrey ? 'white' : 'black',
            marginBottom: '32px'
          }}
        >
          {plan.name}
        </span>
        <div
          style={{
            fontSize: isMobile ? '40px' : '60px',
            fontWeight: 600,
            letterSpacing: isMobile ? '-1px' : '-3px',
            lineHeight: '1'
          }}
        >
          {plan.price}
        </div>
        <div style={{ fontSize: '14px', opacity: 0.5, marginBottom: isMobile ? '32px' : '60px' }}>
          {plan.period}
        </div>

        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {plan.features.map((feature, index) => (
            <li
              key={index}
              style={{
                fontSize: '15px',
                borderBottom: isDark ? '0.5px solid rgba(255,255,255,0.1)' : '0.5px solid rgba(0,0,0,0.1)',
                paddingBottom: '12px',
                opacity: feature.include ? 1 : 0.2
              }}
            >
              {feature.text}
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={() => handleSubscribe(plan.slug)}
        disabled={loading}
        className="navbar__link"
        style={{
          width: '100%',
          marginTop: isMobile ? '32px' : '60px',
          background: isDark ? 'white' : isGrey ? 'black' : 'none',
          color: isDark ? 'black' : isGrey ? 'white' : 'black',
          border: isDark ? 'none' : '1px solid black',
          padding: isMobile ? '16px' : '20px',
          fontSize: '14px',
          fontWeight: 700,
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.5 : 1
        }}
      >
        {plan.buttonText}
      </button>
    </div>
  );

  return (
    <div className="pricing-page">
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
        {'<-'} Volver al Feed
      </button>

      <section style={{ padding: '0 0 60px 0', borderBottom: 'var(--border-thin)' }}>
        <h1
          style={{
            fontSize: isMobile ? '44px' : isTablet ? '60px' : '80px',
            lineHeight: '0.9',
            letterSpacing: isMobile ? '-2px' : '-4px',
            marginBottom: '24px',
            color: 'var(--color-primary)'
          }}
        >
          Nuestros Planes.
        </h1>
        <p style={{ fontSize: isMobile ? '18px' : '24px', opacity: 0.6, maxWidth: '800px', lineHeight: '1.3' }}>
          Elige el nivel de acceso que necesitas para dominar la informacion.
          <br />
          Desde lectura casual hasta analisis profesional de datos.
        </p>
      </section>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: isMobile ? '12px' : '20px',
          padding: isMobile ? '24px 0' : '40px 0',
          flexWrap: 'wrap',
          borderBottom: 'var(--border-thin)'
        }}
      >
        <span style={{ fontSize: '14px', fontWeight: isAnnual ? 400 : 700, opacity: isAnnual ? 0.5 : 1 }}>
          Mensual
        </span>
        <div
          onClick={() => setIsAnnual(!isAnnual)}
          style={{
            width: '60px',
            height: '30px',
            background: 'black',
            borderRadius: '15px',
            position: 'relative',
            cursor: 'pointer',
            border: '1px solid black'
          }}
        >
          <div
            style={{
              width: '24px',
              height: '24px',
              background: 'white',
              borderRadius: '50%',
              position: 'absolute',
              top: '2px',
              left: isAnnual ? '32px' : '2px',
              transition: '0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          />
        </div>
        <span style={{ fontSize: '14px', fontWeight: isAnnual ? 700 : 400, opacity: isAnnual ? 1 : 0.5 }}>
          Anual (Ahorra un 17%)
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : '1fr 1fr 1fr',
          gap: '1px',
          background: 'var(--color-primary)',
          borderBottom: 'var(--border-thin)'
        }}
      >
        <Card plan={plans.free} />
        <Card plan={plans.premium} isGrey />
        <Card plan={plans.elite} isDark />
      </div>

      <div
        style={{
          padding: isMobile ? '24px 20px' : '32px 40px',
          borderBottom: 'var(--border-thin)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          flexDirection: isMobile ? 'column' : 'row',
          background: 'white',
          gap: '24px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: '15px', fontWeight: 600, letterSpacing: '-0.3px', opacity: 0.8 }}>
            Si eres estudiante, solicita 3 meses gratuitos y un 20% de descuento permanente verificando tu estado
            academico.
          </span>
        </div>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 800,
            textDecoration: 'underline',
            cursor: 'pointer',
            fontFamily: 'var(--font-mono)',
            whiteSpace: isMobile ? 'normal' : 'nowrap'
          }}
        >
          VERIFICAR ACCESO {'->'}
        </span>
      </div>

      <section style={{ padding: '40px var(--page-padding)', opacity: 0.4, fontSize: '13px' }}>
        * Precios con IVA incluido. Los planes Elite incluyen acceso a la API experimental para desarrolladores.
      </section>
    </div>
  );
};

export default Pricing;
