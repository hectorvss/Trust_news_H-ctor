import React, { useState } from 'react';

const Pricing = ({ onBack }) => {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = {
    free: {
      name: "ESTÁNDAR",
      price: "0€",
      period: "Gratis para siempre",
      features: [
        { text: "[+] Feed de noticias mundial", include: true },
        { text: "[+] Sesgo básico (3 fuentes)", include: true },
        { text: "[-] Noticias completas redactadas", include: false },
        { text: "[-] Análisis de blindspots ilimitado", include: false },
      ],
      buttonText: "SEGUIR GRATIS"
    },
    premium: {
      name: "PREMIUM",
      price: isAnnual ? "40€" : "4€",
      period: isAnnual ? "Al año" : "Al mes",
      features: [
        { text: "[+] Noticias completas y premium", include: true },
        { text: "[+] Blindspots de España ilimitados", include: true },
        { text: "[+] Gráficos de sesgo avanzados", include: true },
        { text: "[+] Sin anuncios ni tracking", include: true },
      ],
      buttonText: "SUSCRIBIRSE AHORA"
    },
    elite: {
      name: "ELITE",
      price: isAnnual ? "80€" : "8€",
      period: isAnnual ? "Al año" : "Al mes",
      features: [
        { text: "[+] Todo lo del plan Premium", include: true },
        { text: "[+] Acceso a API de datos TNE", include: true },
        { text: "[+] Reportes semanales de sesgo", include: true },
        { text: "[+] Soporte prioritario 24/7", include: true },
        { text: "[+] Exportación de datos analíticos", include: true },
      ],
      buttonText: "EMPEZAR ELITE"
    }
  };

  const Card = ({ plan, isDark, isGrey }) => (
    <div style={{ 
      background: isDark ? 'var(--color-primary)' : isGrey ? '#f5f5f5' : 'white', 
      color: isDark ? 'white' : 'black',
      padding: '60px 40px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between', // This aligns children
      height: '100%'
    }}>
      <div>
        <span className="tag" style={{ 
          border: 'none', 
          background: isDark ? '#333' : isGrey ? 'black' : '#eee', 
          color: (isDark || isGrey) ? 'white' : 'black', 
          marginBottom: '32px' 
        }}>
          {plan.name}
        </span>
        <div style={{ fontSize: '60px', fontWeight: 600, letterSpacing: '-3px', lineHeight: '1' }}>{plan.price}</div>
        <div style={{ fontSize: '14px', opacity: 0.5, marginBottom: '60px' }}>{plan.period}</div>
        
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {plan.features.map((f, i) => (
            <li key={i} style={{ 
              fontSize: '15px', 
              borderBottom: isDark ? '0.5px solid rgba(255,255,255,0.1)' : '0.5px solid rgba(0,0,0,0.1)', 
              paddingBottom: '12px',
              opacity: f.include ? 1 : 0.2 
            }}>
              {f.text}
            </li>
          ))}
        </ul>
      </div>
      
      <button className="navbar__link" style={{ 
        width: '100%', 
        marginTop: '60px', 
        background: isDark ? 'white' : isGrey ? 'black' : 'none', 
        color: isDark ? 'black' : isGrey ? 'white' : 'black', 
        border: isDark ? 'none' : '1px solid black', 
        padding: '20px', 
        fontSize: '14px',
        fontWeight: 700,
        cursor: 'pointer'
      }}>
        {plan.buttonText}
      </button>
    </div>
  );

  return (
    <div className="pricing-page">
      {/* Back Button */}
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
        ← Volver al Feed
      </button>

      {/* Header Section */}
      <section style={{ padding: '0 0 60px 0', borderBottom: 'var(--border-thin)' }}>
        <h1 style={{ 
          fontSize: '80px', 
          lineHeight: '0.9', 
          letterSpacing: '-4px', 
          marginBottom: '24px',
          color: 'var(--color-primary)'
        }}>
          Nuestros Planes.
        </h1>
        <p style={{ fontSize: '24px', opacity: 0.6, maxWidth: '800px', lineHeight: '1.2' }}>
          Elige el nivel de acceso que necesitas para dominar la información. <br />
          Desde lectura casual hasta análisis profesional de datos.
        </p>
      </section>

      {/* Toggle Selector */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        gap: '20px', 
        padding: '40px 0',
        borderBottom: 'var(--border-thin)' 
      }}>
        <span style={{ fontSize: '14px', fontWeight: isAnnual ? 400 : 700, opacity: isAnnual ? 0.5 : 1 }}>Mensual</span>
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
          <div style={{ 
            width: '24px', 
            height: '24px', 
            background: 'white', 
            borderRadius: '50%', 
            position: 'absolute', 
            top: '2px', 
            left: isAnnual ? '32px' : '2px',
            transition: '0.2s cubic-bezier(0.4, 0, 0.2, 1)'
          }} />
        </div>
        <span style={{ fontSize: '14px', fontWeight: isAnnual ? 700 : 400, opacity: isAnnual ? 1 : 0.5 }}>Anual (Ahorra un 17%)</span>
      </div>

      {/* 3-Column Cards Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1px', background: 'var(--color-primary)', borderBottom: 'var(--border-thin)' }}>
        <Card plan={plans.free} />
        <Card plan={plans.premium} isGrey={true} />
        <Card plan={plans.elite} isDark={true} />
      </div>

      <section style={{ padding: '40px var(--page-padding)', opacity: 0.4, fontSize: '13px' }}>
        * Precios con IVA incluido. Los planes Elite incluyen acceso a la API experimental para desarrolladores.
      </section>
    </div>
  );
};

export default Pricing;
