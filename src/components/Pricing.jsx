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
  const [creditLoading, setCreditLoading] = useState(null);

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

  const handleBuyCredits = async (packSlug) => {
    if (!user) {
      alert('Por favor inicia sesion o crea una cuenta primero.');
      navigate('/auth');
      return;
    }

    setCreditLoading(packSlug);
    try {
      const response = await fetch('/api/stripe?type=ai_credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pack: packSlug,
          user_id: user.id,
          email: user.email
        })
      });

      const session = await response.json();
      if (session.url) {
        window.location.href = session.url;
      } else {
        alert('Error al iniciar la compra de creditos IA.');
      }
    } catch (err) {
      console.error(err);
      alert('Error al conectar con el servidor de pagos.');
    } finally {
      setCreditLoading(null);
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
        { text: '[+] Toddy: 1 pregunta IA por noticia', include: true },
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
        { text: '[+] 50 creditos IA/mes para Toddy', include: true },
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
        { text: '[+] 200 creditos IA/mes para Toddy', include: true },
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

  const creditPacks = [
    {
      slug: 'small',
      name: 'TODDY START',
      price: '4.90EUR',
      credits: 60,
      bestFor: 'Para lectores que quieren preguntar en varias noticias.',
      savings: 'Coste ajustado por tokens reales',
      unit: '0.082EUR por credito'
    },
    {
      slug: 'medium',
      name: 'TODDY PLUS',
      price: '11.90EUR',
      credits: 180,
      bestFor: 'El pack mas rentable para uso semanal.',
      savings: 'Mejor coste por credito para uso frecuente',
      unit: '0.066EUR por credito',
      featured: true
    },
    {
      slug: 'large',
      name: 'TODDY PRO',
      price: '24.90EUR',
      credits: 500,
      bestFor: 'Para seguir noticias vivas y hacer auditoria de fuentes.',
      savings: 'Maxima autonomia para noticias vivas',
      unit: '0.050EUR por credito'
    }
  ];

  const CreditPackCard = ({ pack }) => (
    <div
      style={{
        background: pack.featured ? 'black' : 'white',
        color: pack.featured ? 'white' : 'black',
        padding: isMobile ? '28px 20px' : '36px 30px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '360px'
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '28px' }}>
          <span className="tag" style={{ border: 'none', background: pack.featured ? '#fff' : '#eee', color: pack.featured ? '#000' : '#111' }}>
            {pack.name}
          </span>
          {pack.featured && (
            <span style={{ fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.65 }}>
              MEJOR VALOR
            </span>
          )}
        </div>
        <div style={{ fontSize: isMobile ? '44px' : '56px', fontWeight: 800, letterSpacing: '-2px', lineHeight: 1 }}>
          {pack.credits}
        </div>
        <div style={{ fontSize: '12px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.5, marginTop: '6px', marginBottom: '28px' }}>
          CREDITOS IA
        </div>
        <div style={{ fontSize: '34px', fontWeight: 800, letterSpacing: '-1px', lineHeight: 1, marginBottom: '8px' }}>
          {pack.price}
        </div>
        <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', opacity: 0.5, marginBottom: '24px' }}>
          {pack.unit}
        </div>
        <div style={{ borderTop: pack.featured ? '1px solid rgba(255,255,255,0.2)' : '1px solid #ddd', paddingTop: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <p style={{ fontSize: '14px', lineHeight: 1.45, margin: 0, opacity: 0.78 }}>{pack.bestFor}</p>
          <p style={{ fontSize: '12px', lineHeight: 1.45, margin: 0, fontFamily: 'var(--font-mono)', opacity: 0.55 }}>{pack.savings}</p>
        </div>
      </div>
      <button
        onClick={() => handleBuyCredits(pack.slug)}
        disabled={creditLoading === pack.slug}
        className="navbar__link"
        style={{
          width: '100%',
          marginTop: '34px',
          background: pack.featured ? 'white' : 'black',
          color: pack.featured ? 'black' : 'white',
          border: pack.featured ? 'none' : '1px solid black',
          padding: '16px',
          fontSize: '13px',
          fontWeight: 900,
          cursor: creditLoading ? 'not-allowed' : 'pointer',
          opacity: creditLoading === pack.slug ? 0.55 : 1
        }}
      >
        {creditLoading === pack.slug ? 'ABRIENDO STRIPE...' : 'COMPRAR CREDITOS'}
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

      <section id="ai-credits" style={{ padding: isMobile ? '52px 0 0' : '72px 0 0', borderBottom: 'var(--border-thin)' }}>
        <div style={{ paddingBottom: isMobile ? '28px' : '40px' }}>
          <span className="tag" style={{ background: '#111', color: '#fff', border: 'none', marginBottom: '24px' }}>TODDY IA</span>
          <h2
            style={{
              fontSize: isMobile ? '40px' : isTablet ? '54px' : '68px',
              lineHeight: '0.95',
              letterSpacing: isMobile ? '-1.5px' : '-3px',
              margin: '0 0 18px',
              color: 'var(--color-primary)'
            }}
          >
            Compra creditos IA cuando quieras.
          </h2>
          <p style={{ fontSize: isMobile ? '16px' : '21px', opacity: 0.62, maxWidth: '900px', lineHeight: '1.35', margin: 0 }}>
            Toddy estima el coste segun la profundidad que elijas, pero el cargo final se ajusta con decimales al uso real de tokens: contexto leido, evidencia consultada y longitud de la respuesta.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : '1fr 1fr 1fr',
            gap: '1px',
            background: 'var(--color-primary)',
            borderTop: 'var(--border-thin)'
          }}
        >
          {creditPacks.map(pack => <CreditPackCard key={pack.slug} pack={pack} />)}
        </div>

        <div style={{ padding: isMobile ? '22px 20px' : '28px 40px', background: '#f5f5f5', borderTop: 'var(--border-thin)', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '18px' }}>
          {[
            ['KPI consumo IA', 'Cada respuesta guarda tokens, creditos, modelo, fuentes usadas y coste estimado.'],
            ['Free protegido', 'El plan gratis mantiene 1 pregunta por noticia sin consumir creditos.'],
            ['Pago flexible', 'Los packs son one-time y se suman al balance de tu cuenta via Stripe.']
          ].map(([title, text]) => (
            <div key={title}>
              <div style={{ fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.45, marginBottom: '8px' }}>{title}</div>
              <div style={{ fontSize: '14px', lineHeight: 1.45, opacity: 0.72 }}>{text}</div>
            </div>
          ))}
        </div>
      </section>

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
