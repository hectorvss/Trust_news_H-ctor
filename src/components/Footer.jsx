import React from 'react';

const Footer = () => {
  return (
    <footer style={{ 
      background: 'black', 
      color: 'white', 
      padding: '80px var(--page-padding) 40px var(--page-padding)',
      fontFamily: 'var(--font-heading)',
      borderTop: '1px solid #333'
    }}>
      <div className="container">
        {/* Top Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(5, 1fr)', 
          gap: '40px',
          marginBottom: '80px'
        }}>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '24px' }}>Noticias</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px', opacity: 0.6 }}>
              <li>Página de inicio</li>
              <li>Noticias locales</li>
              <li>Feed Blindspot</li>
              <li>Internacional</li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '24px' }}>Internacional</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px', opacity: 0.6 }}>
              <li>América del Norte</li>
              <li>América del Sur</li>
              <li>Europa</li>
              <li>Asia</li>
              <li>África</li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '24px' }}>Tendencia Int.</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px', opacity: 0.6 }}>
              <li>Coachella</li>
              <li>WNBA</li>
              <li>Papa Francisco</li>
              <li>IA Generativa</li>
              <li>Guerra en Gaza</li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '24px' }}>Tendencia EE.UU.</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px', opacity: 0.6 }}>
              <li>WNBA</li>
              <li>Baseball</li>
              <li>Donald Trump</li>
              <li>Joe Biden</li>
              <li>NASA</li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '24px' }}>Tendencia U.K.</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px', opacity: 0.6 }}>
              <li>Premier League</li>
              <li>Arsenal FC</li>
              <li>Manchester United</li>
              <li>Brexit Update</li>
              <li>Royal Family</li>
            </ul>
          </div>
        </div>

        <div style={{ width: '100%', height: '1px', background: '#222', marginBottom: '60px' }} />

        {/* Bottom Section */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1.5fr 1fr 1fr 1fr', 
          gap: '40px',
          alignItems: 'start'
        }}>
          <div>
            <div style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-1px' }}>TNE.</div>
            <div style={{ fontSize: '10px', fontWeight: 800, fontFamily: 'var(--font-mono)', opacity: 0.4, letterSpacing: '2px', marginTop: '4px' }}>TRUST NEWS ESPAÑA</div>
          </div>
          <div>
            <h4 style={{ fontSize: '12px', fontWeight: 800, marginBottom: '24px', textTransform: 'uppercase' }}>Compañía</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px', opacity: 0.6 }}>
              <li key="c1"><a href="/company?section=sobre-nosotros" style={{ color: 'inherit', textDecoration: 'none' }}>Sobre nosotros</a></li>
              <li key="c2"><a href="/company?section=mision" style={{ color: 'inherit', textDecoration: 'none' }}>Misión</a></li>
              <li key="c3"><a href="/company?section=blog" style={{ color: 'inherit', textDecoration: 'none' }}>Blog</a></li>
              <li key="c4"><a href="/company?section=suscripciones" style={{ color: 'inherit', textDecoration: 'none' }}>Suscripciones</a></li>
              <li key="c5"><a href="/company?section=carreras" style={{ color: 'inherit', textDecoration: 'none' }}>Carreras</a></li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: '12px', fontWeight: 800, marginBottom: '24px', textTransform: 'uppercase' }}>Ayuda</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px', opacity: 0.6 }}>
              <li key="a1"><a href="/help?section=centro-ayuda" style={{ color: 'inherit', textDecoration: 'none' }}>Centro de ayuda</a></li>
              <li key="a2"><a href="/help?section=faq" style={{ color: 'inherit', textDecoration: 'none' }}>FAQ</a></li>
              <li key="a3"><a href="/help?section=contacto" style={{ color: 'inherit', textDecoration: 'none' }}>Contacto</a></li>
              <li key="a4"><a href="/help?section=ratings" style={{ color: 'inherit', textDecoration: 'none' }}>Ratings de Sesgo</a></li>
              <li key="a5"><a href="/help?section=fuentes" style={{ color: 'inherit', textDecoration: 'none' }}>Fuentes de noticias</a></li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: '12px', fontWeight: 800, marginBottom: '24px', textTransform: 'uppercase' }}>Herramientas</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px', opacity: 0.6 }}>
              <li>App móvil</li>
              <li>Extensión de navegador</li>
              <li>Newsletter diaria</li>
              <li>Timelines</li>
              <li>API de datos</li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginTop: '100px', 
          fontSize: '10px', 
          fontWeight: 700, 
          fontFamily: 'var(--font-mono)',
          opacity: 0.3
        }}>
          <div>© 2026 TRUST NEWS ESPAÑA. TODOS LOS DERECHOS RESERVADOS.</div>
          <div style={{ display: 'flex', gap: '24px' }}>
            <span>TÉRMINOS</span>
            <span>PRIVACIDAD</span>
            <span>DISEÑO POR ANTIGRAVITY</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
