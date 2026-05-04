import React, { useState, useRef, useEffect } from 'react';

const SearchIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const Navbar = ({ navigate, user, profile, signOut, activeCategory, setActiveCategory, setSelectedStory, showForYou, setShowForYou, categories }) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const term = searchValue.trim();
    if (!term) return;
    setSearchOpen(false);
    setSearchValue('');
    navigate(`/search?q=${encodeURIComponent(term)}`);
  };

  const handleSearchKey = (e) => {
    if (e.key === 'Escape') { setSearchOpen(false); setSearchValue(''); }
  };

  return (
    <nav className="navbar">
      <div className="navbar__inner">
        <div className="navbar__logo" onClick={() => { navigate('/'); setActiveCategory('TODO'); setSelectedStory(null); }} style={{ cursor: 'pointer' }}>TNE.</div>

        {searchOpen ? (
          <form onSubmit={handleSearchSubmit} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '24px' }}>
            <input
              ref={searchInputRef}
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              onKeyDown={handleSearchKey}
              placeholder="Buscar noticias..."
              style={{
                flex: 1,
                border: 'none',
                borderBottom: '2px solid black',
                outline: 'none',
                fontSize: '13px',
                fontWeight: 700,
                fontFamily: 'var(--font-heading)',
                padding: '4px 0',
                background: 'transparent',
              }}
            />
            <button type="submit" style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 900, fontSize: '11px', fontFamily: 'var(--font-mono)', letterSpacing: '1px' }}>
              IR ↗
            </button>
            <button type="button" onClick={() => { setSearchOpen(false); setSearchValue(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.4, fontSize: '18px', lineHeight: 1 }}>
              ✕
            </button>
          </form>
        ) : (
          <div className="navbar__links" style={{ display: 'flex', alignItems: 'center' }}>
            <a href="/" className="navbar__link" onClick={(e) => { e.preventDefault(); navigate('/'); setActiveCategory('TODO'); setSelectedStory(null); }}>INICIO</a>

            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <a
                href="#"
                className="navbar__link"
                onClick={(e) => { e.preventDefault(); setShowForYou(!showForYou); }}
                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                CATEGORÍAS {showForYou ? '▲' : '▼'}
              </a>
              {showForYou && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 1px)',
                  left: '0',
                  background: 'white',
                  border: '1px solid black',
                  padding: '20px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '12px',
                  width: '300px',
                  zIndex: 1000,
                }}>
                  {categories.map(cat => (
                    <span
                      key={cat}
                      onClick={() => { setActiveCategory(cat); setShowForYou(false); navigate('/'); setSelectedStory(null); }}
                      style={{
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        padding: '8px',
                        cursor: 'pointer',
                        borderBottom: activeCategory === cat ? '2px solid black' : '1px solid #eee',
                        fontWeight: activeCategory === cat ? 800 : 400
                      }}
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <a href="/pricing" className="navbar__link" onClick={(e) => { e.preventDefault(); navigate('/pricing'); }}>PRECIOS</a>
            <a href="/tools" className="navbar__link" onClick={(e) => { e.preventDefault(); navigate('/tools'); }}>HERRAMIENTAS</a>

            {/* Botón búsqueda */}
            <button
              onClick={() => setSearchOpen(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px 8px', opacity: 0.6 }}
              title="Buscar"
              onMouseEnter={e => e.currentTarget.style.opacity = 1}
              onMouseLeave={e => e.currentTarget.style.opacity = 0.6}
            >
              <SearchIcon />
            </button>

            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {(profile?.role === 'manager' || profile?.role === 'admin_editor') ? (
                  <a
                    href="/manager"
                    className="navbar__link"
                    onClick={(e) => { e.preventDefault(); navigate('/manager'); }}
                    style={{ fontWeight: 900, color: '#ff3333', fontFamily: 'var(--font-mono)' }}
                  >
                    MANAGER
                  </a>
                ) : null}
                <a
                  href="/account"
                  className="navbar__link"
                  onClick={(e) => { e.preventDefault(); navigate('/account'); }}
                  style={{ fontWeight: 800, color: 'black' }}
                >
                  MI CUENTA
                </a>
                <a href="#" className="navbar__link navbar__link--btn" onClick={(e) => { e.preventDefault(); signOut(); navigate('/'); }} style={{ background: '#333' }}>SALIR</a>
              </div>
            ) : (
              <a href="/auth" className="navbar__link navbar__link--btn" onClick={(e) => { e.preventDefault(); navigate('/auth'); }}>COMENZAR</a>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
