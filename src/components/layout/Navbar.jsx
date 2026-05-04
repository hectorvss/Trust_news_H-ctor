import React, { useState, useRef, useEffect } from 'react';
import NotificationBell from '../NotificationBell';

const SearchIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const HamburgerIcon = ({ open }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    {open ? (
      <>
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </>
    ) : (
      <>
        <line x1="3" y1="7" x2="21" y2="7"/>
        <line x1="3" y1="12" x2="21" y2="12"/>
        <line x1="3" y1="17" x2="21" y2="17"/>
      </>
    )}
  </svg>
);

const Navbar = ({ navigate, user, profile, signOut, activeCategory, setActiveCategory, setSelectedStory, showForYou, setShowForYou, categories }) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  // Close mobile menu on navigation
  const goTo = (path, extra) => {
    setMobileMenuOpen(false);
    setShowForYou(false);
    navigate(path);
    if (extra) extra();
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const term = searchValue.trim();
    if (!term) return;
    setSearchOpen(false);
    setSearchValue('');
    setMobileMenuOpen(false);
    navigate(`/search?q=${encodeURIComponent(term)}`);
  };

  const handleSearchKey = (e) => {
    if (e.key === 'Escape') { setSearchOpen(false); setSearchValue(''); }
  };

  return (
    <nav className="navbar">
      <div className="navbar__inner">
        <div className="navbar__logo" onClick={() => { navigate('/'); setActiveCategory('TODO'); setSelectedStory(null); setMobileMenuOpen(false); }} style={{ cursor: 'pointer' }}>TNE.</div>

        {searchOpen ? (
          <form onSubmit={handleSearchSubmit} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '24px' }}>
            <input
              ref={searchInputRef}
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              onKeyDown={handleSearchKey}
              placeholder="Buscar noticias..."
              style={{ flex: 1, border: 'none', borderBottom: '2px solid black', outline: 'none', fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-heading)', padding: '4px 0', background: 'transparent' }}
            />
            <button type="submit" style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 900, fontSize: '11px', fontFamily: 'var(--font-mono)', letterSpacing: '1px' }}>IR ↗</button>
            <button type="button" onClick={() => { setSearchOpen(false); setSearchValue(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.4, fontSize: '18px', lineHeight: 1 }}>✕</button>
          </form>
        ) : (
          <>
            {/* Desktop links */}
            <div className="navbar__links" style={{ display: 'flex', alignItems: 'center' }}>
              <a href="/" className="navbar__link" onClick={e => { e.preventDefault(); navigate('/'); setActiveCategory('TODO'); setSelectedStory(null); }}>INICIO</a>

              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <a href="#" className="navbar__link" onClick={e => { e.preventDefault(); setShowForYou(!showForYou); }} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  CATEGORÍAS {showForYou ? '▲' : '▼'}
                </a>
                {showForYou && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 1px)', left: '0', background: 'white', border: '1px solid black', padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', width: '300px', zIndex: 1000 }}>
                    {categories.map(cat => (
                      <span key={cat} onClick={() => { setActiveCategory(cat); setShowForYou(false); navigate('/'); setSelectedStory(null); }} style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', padding: '8px', cursor: 'pointer', borderBottom: activeCategory === cat ? '2px solid black' : '1px solid #eee', fontWeight: activeCategory === cat ? 800 : 400 }}>
                        {cat}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <a href="/pricing" className="navbar__link" onClick={e => { e.preventDefault(); navigate('/pricing'); }}>PRECIOS</a>
              <a href="/tools" className="navbar__link" onClick={e => { e.preventDefault(); navigate('/tools'); }}>HERRAMIENTAS</a>

              <button onClick={() => setSearchOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px 8px', opacity: 0.6 }} title="Buscar" onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0.6}>
                <SearchIcon />
              </button>

              {user ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {(profile?.role === 'manager' || profile?.role === 'admin_editor') && (
                    <a href="/manager" className="navbar__link" onClick={e => { e.preventDefault(); navigate('/manager'); }} style={{ fontWeight: 900, color: '#ff3333', fontFamily: 'var(--font-mono)' }}>MANAGER</a>
                  )}
                  <NotificationBell userId={user.id} navigate={navigate} />
                  <a href="/account" className="navbar__link" onClick={e => { e.preventDefault(); navigate('/account'); }} style={{ fontWeight: 800, color: 'black' }}>MI CUENTA</a>
                  <a href="#" className="navbar__link navbar__link--btn" onClick={e => { e.preventDefault(); signOut(); navigate('/'); }} style={{ background: '#333' }}>SALIR</a>
                </div>
              ) : (
                <a href="/auth" className="navbar__link navbar__link--btn" onClick={e => { e.preventDefault(); navigate('/auth'); }}>COMENZAR</a>
              )}
            </div>

            {/* Mobile: search + hamburger */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setSearchOpen(true)}
                className="navbar__mobile-menu-btn"
                style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: '6px', opacity: 0.7 }}
              >
                <SearchIcon />
              </button>
              <button
                onClick={() => setMobileMenuOpen(v => !v)}
                className="navbar__mobile-menu-btn"
                style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: '6px' }}
                aria-label="Menú"
              >
                <HamburgerIcon open={mobileMenuOpen} />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="navbar__mobile-menu">
          <span onClick={() => goTo('/', () => { setActiveCategory('TODO'); setSelectedStory(null); })}>INICIO</span>
          {categories.map(cat => (
            <span key={cat} onClick={() => goTo('/', () => { setActiveCategory(cat); setSelectedStory(null); })} style={{ fontWeight: activeCategory === cat ? 900 : 700, opacity: activeCategory === cat ? 1 : 0.6 }}>
              {cat}
            </span>
          ))}
          <span onClick={() => goTo('/pricing')}>PRECIOS</span>
          <span onClick={() => goTo('/tools')}>HERRAMIENTAS</span>
          {user ? (
            <>
              {(profile?.role === 'manager' || profile?.role === 'admin_editor') && (
                <span onClick={() => goTo('/manager')} style={{ color: '#ff3333' }}>MANAGER</span>
              )}
              <span onClick={() => goTo('/account')}>MI CUENTA</span>
              <span onClick={() => { signOut(); goTo('/'); }}>CERRAR SESIÓN</span>
            </>
          ) : (
            <span onClick={() => goTo('/auth')} style={{ fontWeight: 900 }}>COMENZAR →</span>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
