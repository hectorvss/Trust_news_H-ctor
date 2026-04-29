import React from 'react';

const Navbar = ({ navigate, user, profile, signOut, activeCategory, setActiveCategory, setSelectedStory, showForYou, setShowForYou, categories }) => {
  return (
    <nav className="navbar">
      <div className="navbar__inner">
        <div className="navbar__logo" onClick={() => { navigate('/'); setActiveCategory('TODO'); setSelectedStory(null); }} style={{ cursor: 'pointer' }}>TNE.</div>
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
                marginTop: '0px'
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
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {user?.email === 'hectorvidal0411@gmail.com' || profile?.role === 'manager' ? (
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
      </div>
    </nav>
  );
};

export default Navbar;
