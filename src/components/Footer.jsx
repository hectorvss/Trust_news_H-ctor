import React from 'react';
import { Link } from 'react-router-dom';

const Footer = ({ links }) => {
  const topCols = [
    links?.col1 || {
      title: "Noticias",
      links: [
        {label: "Página de inicio", url: "/"},
        {label: "Noticias locales", url: "/?city=locales"},
        {label: "Feed Blindspot", url: "/bias"},
        {label: "Internacional", url: "/?cat=INTERNACIONAL"}
      ]
    },
    links?.col2 || {
      title: "Internacional",
      links: [
        {label: "América del Norte", url: "/?cat=INTERNACIONAL"},
        {label: "América del Sur", url: "/?cat=INTERNACIONAL"},
        {label: "Europa", url: "/?cat=INTERNACIONAL"},
        {label: "Asia", url: "/?cat=INTERNACIONAL"},
        {label: "África", url: "/?cat=INTERNACIONAL"}
      ]
    },
    links?.col3 || {
      title: "Tendencia Int.",
      links: [
        {label: "Coachella", url: "/?topic=Coachella"},
        {label: "WNBA", url: "/?topic=WNBA"},
        {label: "Papa Francisco", url: "/?topic=Papa Francisco"},
        {label: "IA Generativa", url: "/?topic=IA Generativa"},
        {label: "Guerra en Gaza", url: "/?topic=Guerra en Gaza"}
      ]
    },
    links?.col4 || {
      title: "Tendencia EE.UU.",
      links: [
        {label: "WNBA", url: "/?topic=WNBA"},
        {label: "Baseball", url: "/?topic=Baseball"},
        {label: "Donald Trump", url: "/?topic=Donald Trump"},
        {label: "Joe Biden", url: "/?topic=Joe Biden"},
        {label: "NASA", url: "/?topic=NASA"}
      ]
    },
    links?.col5 || {
      title: "Tendencia U.K.",
      links: [
        {label: "Premier League", url: "/?topic=Premier League"},
        {label: "Arsenal FC", url: "/?topic=Arsenal FC"},
        {label: "Manchester United", url: "/?topic=Manchester United"},
        {label: "Brexit Update", url: "/?topic=Brexit Update"},
        {label: "Royal Family", url: "/?topic=Royal Family"}
      ]
    }
  ];

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
          {topCols.map((col, idx) => (
            <div key={idx}>
              <h4 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '24px' }}>{col.title}</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px', opacity: 0.6 }}>
                {col.links.map((link, j) => (
                  <li key={j}><Link to={link.url} style={{ color: 'inherit', textDecoration: 'none' }}>{link.label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
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
            <h4 style={{ fontSize: '12px', fontWeight: 800, marginBottom: '24px', textTransform: 'uppercase' }}>
              <Link to="/company" style={{ color: 'inherit', textDecoration: 'none' }}>Compañía</Link>
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px', opacity: 0.6 }}>
              <li key="c1"><Link to="/company?section=sobre-nosotros" style={{ color: 'inherit', textDecoration: 'none' }}>Sobre nosotros</Link></li>
              <li key="c2"><Link to="/company?section=mision" style={{ color: 'inherit', textDecoration: 'none' }}>Misión</Link></li>
              <li key="c3"><Link to="/company?section=blog" style={{ color: 'inherit', textDecoration: 'none' }}>Blog</Link></li>
              <li key="c4"><Link to="/company?section=suscripciones" style={{ color: 'inherit', textDecoration: 'none' }}>Suscripciones</Link></li>
              <li key="c5"><Link to="/company?section=carreras" style={{ color: 'inherit', textDecoration: 'none' }}>Carreras</Link></li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: '12px', fontWeight: 800, marginBottom: '24px', textTransform: 'uppercase' }}>
              <Link to="/help" style={{ color: 'inherit', textDecoration: 'none' }}>Ayuda</Link>
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px', opacity: 0.6 }}>
              <li key="a1"><Link to="/help?section=centro-ayuda" style={{ color: 'inherit', textDecoration: 'none' }}>Centro de ayuda</Link></li>
              <li key="a2"><Link to="/help?section=faq" style={{ color: 'inherit', textDecoration: 'none' }}>FAQ</Link></li>
              <li key="a3"><Link to="/help?section=contacto" style={{ color: 'inherit', textDecoration: 'none' }}>Contacto</Link></li>
              <li key="a4"><Link to="/help?section=ratings" style={{ color: 'inherit', textDecoration: 'none' }}>Ratings de Sesgo</Link></li>
              <li key="a5"><Link to="/help?section=fuentes" style={{ color: 'inherit', textDecoration: 'none' }}>Fuentes de noticias</Link></li>
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
