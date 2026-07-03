import React from 'react';

/**
 * Ranura de anuncio reutilizable y agnóstica de red.
 *
 * HOY: renderiza una "house ad" (upsell a Premium), útil desde la primera
 * visita porque empuja conversiones a pago y no depende del tráfico.
 *
 * MAÑANA (con tráfico + cuenta de red + CMP de consentimiento RGPD):
 * sustituir el bloque HOUSE AD por el tag de la red, p.ej. AdSense:
 *   <ins className="adsbygoogle" style={{display:'block', width, height}}
 *        data-ad-client="ca-pub-XXXX" data-ad-slot="XXXX" />
 * y disparar (window.adsbygoogle = window.adsbygoogle || []).push({}).
 * El gating por suscripción y el layout no cambian.
 */
const AdSlot = ({ navigate, width = 160, height = 600 }) => {
  return (
    <div style={{ width, display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ fontSize: '9px', fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '2px', opacity: 0.3, textAlign: 'center' }}>
        PUBLICIDAD
      </div>

      {/* ── HOUSE AD: upsell Premium ── */}
      <div
        style={{
          width, height,
          border: '2px solid black',
          background: 'black',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '20px 16px',
          boxShadow: '6px 6px 0 rgba(0,0,0,1)',
        }}
      >
        <div style={{ fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '2px', opacity: 0.55 }}>
          TNE PREMIUM
        </div>
        <div style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-1.3px', lineHeight: 1.02 }}>
          Lee sin anuncios ni límites.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '12px', opacity: 0.7, lineHeight: 1.4 }}>
            Desde 1€/semana: cobertura completa, Toddy IA y cero distracciones.
          </div>
          <button
            onClick={() => navigate && navigate('/pricing')}
            style={{ padding: '12px', background: 'white', color: 'black', border: 'none', fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '1px', cursor: 'pointer' }}
          >
            QUITAR ANUNCIOS ↗
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdSlot;
