import React, { useState, useRef, useEffect } from 'react';
import NotificationBell from '../NotificationBell';
import { hasManagerAccess } from '../../utils/managerAccess';

// Header de 3 filas según el Figma (rejilla 1440w):
//   1) barra de utilidades oscura (~39px)  2) nav principal (~65px)  3) chips de temas (~43px)
// Altura total ≈147px — <main> en App reserva ese espacio.
export const HEADER_HEIGHT = 147;

const INK = 'var(--color-ink)';
const PAPER = 'var(--color-paper)';
const LINE = 'var(--color-line)';
const CHIP = 'var(--color-chip)';

const SearchIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
    <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const HamburgerIcon = ({ open }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
    {open ? (<><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>)
      : (<><line x1="3" y1="7" x2="21" y2="7" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="17" x2="21" y2="17" /></>)}
  </svg>
);
const Chevron = () => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 4.25L6 7.75l3.5-3.5" />
  </svg>
);
const PlusIcon = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <path d="M7 2.5v9M2.5 7h9" />
  </svg>
);

// ── Fila 1: utilidades ──
const UtilityBar = ({ goTo }) => {
  const [theme, setTheme] = useState('auto');
  const fecha = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const link = { fontSize: '11.8px', fontWeight: 500, color: PAPER, background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: '18px', fontFamily: 'var(--font-body)' };
  return (
    <div style={{ background: INK, borderBottom: '0.8px solid var(--color-line-soft)', padding: '5px 0 5.8px' }}>
      <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto', padding: '0 var(--page-padding)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <button style={link} onClick={() => goTo('/tools')}>Extensión de navegador</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9.6px' }}>
            <span style={{ ...link, opacity: 0.75, cursor: 'default' }}>Tema:</span>
            {['Claro', 'Oscuro', 'Auto'].map((t) => (
              <button key={t} onClick={() => setTheme(t)} style={{ ...link, opacity: theme === t ? 1 : 0.6, fontWeight: theme === t ? 700 : 500 }}>{t}</button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '41.6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9.6px' }}>
            <time style={{ ...link, opacity: 0.75, cursor: 'default', textTransform: 'capitalize' }}>{fecha}</time>
            <button style={link} onClick={() => goTo('/local')}>Definir ubicación</button>
          </div>
          <button style={{ ...link, display: 'flex', alignItems: 'center', gap: '9.6px' }}>
            <span aria-hidden="true">🇪🇸</span> Edición España <Chevron />
          </button>
        </div>
      </div>
    </div>
  );
};

const Navbar = ({ navigate, user, profile, signOut, activeCategory, setActiveCategory, setSelectedStory, showForYou, setShowForYou, categories }) => {
  const [searchValue, setSearchValue] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const headerRef = useRef(null);
  const canAccessManager = hasManagerAccess({ user, profile });

  useEffect(() => {
    const onDoc = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  // El header es fijo: publicamos su altura real en --header-h para que <main>
  // reserve exactamente ese espacio en cualquier viewport (sin huecos ni solapes).
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const apply = () => document.documentElement.style.setProperty('--header-h', `${Math.round(el.getBoundingClientRect().height)}px`);
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    window.addEventListener('resize', apply);
    return () => { ro.disconnect(); window.removeEventListener('resize', apply); };
  }, []);

  const goTo = (path, extra) => {
    setMenuOpen(false);
    setSelectedStory && setSelectedStory(null);
    navigate(path);
    if (extra) extra();
  };

  const isHome = typeof window !== 'undefined' && window.location.pathname === '/';
  const path = typeof window !== 'undefined' ? window.location.pathname : '/';

  const NAV = [
    { label: 'Inicio', on: isHome && !showForYou, go: () => { setShowForYou && setShowForYou(false); goTo('/'); } },
    { label: 'Para ti', on: !!showForYou, go: () => { goTo('/'); setShowForYou && setShowForYou(true); } },
    { label: 'Local', on: path === '/local', go: () => { setShowForYou && setShowForYou(false); goTo('/local'); } },
    { label: 'Blindspot', on: path === '/bias', go: () => { setShowForYou && setShowForYou(false); goTo('/bias'); } },
  ];

  const submitSearch = (e) => {
    e.preventDefault();
    if (searchValue.trim()) goTo('/search?q=' + encodeURIComponent(searchValue.trim()));
  };

  const btnBase = { height: '44.8px', borderRadius: 'var(--radius-sm)', fontSize: '15.6px', fontWeight: 700, fontFamily: 'var(--font-body)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 14px', whiteSpace: 'nowrap' };

  const menuItems = [
    ['Descubrir', '/discover'], ['Resumen diario', '/daily-summary'], ['Mi sesgo de lectura', '/mi-sesgo'],
    ['Guardadas', '/favorites'], ['Precios', '/pricing'], ['Funciones', '/features'],
    ...(canAccessManager ? [['Manager Studio', '/manager']] : []),
  ];

  return (
    <header ref={headerRef} style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, fontFamily: 'var(--font-body)' }}>
      <UtilityBar goTo={goTo} />

      {/* ── Fila 2: nav principal ── */}
      <div style={{ background: PAPER }}>
        <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto', padding: '0 var(--page-padding)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', minHeight: '65px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20.8px' }}>
            <button aria-label="Abrir menú" onClick={() => setMenuOpen((v) => !v)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: INK, display: 'flex', padding: 0 }}>
              <HamburgerIcon open={menuOpen} />
            </button>
            <button onClick={() => goTo('/')} aria-label="Trust News España — Inicio"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px 0', display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-1.4px', color: INK, lineHeight: 1 }}>TN.</span>
            </button>
            <nav style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', marginLeft: '12px' }} className="tne-nav-links">
              {NAV.map((n) => (
                <button key={n.label} onClick={n.go}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 5px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'stretch' }}>
                  <span style={{ fontSize: '15px', fontWeight: 700, lineHeight: '22.5px', color: INK, whiteSpace: 'nowrap' }}>{n.label}</span>
                  <span style={{ height: '4px', background: n.on ? INK : 'transparent', display: 'block' }} />
                </button>
              ))}
            </nav>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '9.4px' }}>
            <form onSubmit={submitSearch} className="tne-search"
              style={{ display: 'flex', alignItems: 'center', gap: '9.6px', border: `1px solid ${LINE}`, borderRadius: 'var(--radius-sm)', padding: '8px', width: '240px' }}>
              <span style={{ color: INK, display: 'flex' }}><SearchIcon /></span>
              <input value={searchValue} onChange={(e) => setSearchValue(e.target.value)} placeholder="Buscar" aria-label="Buscar"
                style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '16px', color: INK, width: '100%', fontFamily: 'var(--font-body)' }} />
            </form>
            {user && <NotificationBell user={user} navigate={navigate} />}
            {user ? (
              <>
                <button onClick={() => goTo('/account')} style={{ ...btnBase, background: INK, color: PAPER, border: 'none' }}>Mi cuenta</button>
                <button onClick={() => { signOut && signOut(); goTo('/'); }} style={{ ...btnBase, background: 'transparent', color: INK, border: `1px solid ${INK}` }}>Salir</button>
              </>
            ) : (
              <>
                <button onClick={() => goTo('/pricing')} style={{ ...btnBase, background: INK, color: PAPER, border: 'none', width: '140.8px' }}>Suscribirse</button>
                <button onClick={() => goTo('/auth')} style={{ ...btnBase, background: 'transparent', color: INK, border: `1px solid ${INK}`, width: '140.8px' }}>Entrar</button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Fila 3: chips de temas ── */}
      <div style={{ background: PAPER, borderTop: `0.8px solid ${LINE}`, borderBottom: `0.8px solid ${LINE}`, padding: '8px 0 8.8px' }}>
        <div className="tne-chips" style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto', padding: '0 var(--page-padding)', display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto' }}>
          {(categories || []).map((c) => {
            const label = typeof c === 'string' ? c : (c?.name || c?.label || '');
            if (!label) return null;
            const on = activeCategory === label;
            return (
              <button key={label} onClick={() => { setActiveCategory && setActiveCategory(on ? 'TODO' : label); goTo('/'); }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: on ? INK : CHIP, color: on ? PAPER : INK, border: 'none', borderRadius: 'var(--radius-pill)', padding: '4px 8px', fontSize: '11.8px', fontWeight: 600, lineHeight: '18px', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, fontFamily: 'var(--font-body)' }}>
                {label}
                <span style={{ display: 'flex', opacity: 0.7 }}><PlusIcon /></span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Menú desplegable */}
      {menuOpen && (
        <div ref={menuRef}
          style={{ position: 'absolute', top: '100%', left: 'var(--page-padding)', background: 'var(--color-surface)', border: `1px solid ${LINE}`, borderRadius: 'var(--radius-sm)', boxShadow: '0 10px 30px rgba(0,0,0,0.12)', padding: '8px', minWidth: '230px' }}>
          {menuItems.map(([l, p]) => (
            <button key={p} onClick={() => goTo(p)}
              style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: '10px 12px', fontSize: '14px', fontWeight: 600, color: INK, fontFamily: 'var(--font-body)' }}>
              {l}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};

export default Navbar;
