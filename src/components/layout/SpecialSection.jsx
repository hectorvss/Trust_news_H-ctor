import React from 'react';

const SpecialSection = ({ idx, section, stories, onSelectStory, navigate }) => {
  const main = section.main || {};
  const sides = section.sides || [];
  const label = section.label || '';
  const title = section.title || '';

  const handleMainClick = () => {
    const sid = main.story_id;
    if (!sid) return;
    const story = stories.find(s => String(s.id) === String(sid));
    if (story) onSelectStory(story);
    else navigate(`/story/${sid}`);
  };

  const handleSideClick = (side) => {
    const sid = side.story_id;
    if (!sid) return;
    const story = stories.find(s => String(s.id) === String(sid));
    if (story) onSelectStory(story);
    else navigate(`/story/${sid}`);
  };

  return (
    <section key={section.id} className="layout-split" style={{ borderTop: idx === 0 ? 'var(--border-thin)' : '1px solid black', background: '#fff' }}>
      <div className="sidebar" style={{ display: 'flex', flexDirection: 'column', padding: '60px 40px', borderRight: 'var(--border-thin)' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-1.5px', lineHeight: '1', margin: '0 0 32px 0' }}>{label}<br/>{title}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button onClick={handleMainClick} style={{ padding: '14px', background: 'black', color: 'white', border: 'none', borderRadius: '4px', fontSize: '10px', fontWeight: 900, cursor: main.story_id ? 'pointer' : 'default', letterSpacing: '1px' }}>
            {section.btn1 || 'VER NOTICIA →'}
          </button>
          <button style={{ padding: '14px', background: 'none', border: '1px solid #f0f0f0', borderRadius: '4px', fontSize: '10px', fontWeight: 900, cursor: 'pointer', color: '#999', letterSpacing: '1px' }}>
            {section.btn2 || 'OCULTAR'}
          </button>
        </div>
        <div style={{ marginTop: 'auto', fontSize: '10px', opacity: 0.2, fontFamily: 'var(--font-mono)', fontWeight: 800 }}>{section.trend}</div>
      </div>
      <div className="main-content" style={{ padding: 0 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', minHeight: '600px' }}>
          {/* MAIN STORY CARD */}
          <div
            onClick={main.story_id ? handleMainClick : undefined}
            style={{ padding: '60px', borderRight: 'var(--border-thin)', display: 'flex', flexDirection: 'column', gap: '24px', cursor: main.story_id ? 'pointer' : 'default', transition: 'background 0.15s' }}
            onMouseEnter={e => { if (main.story_id) e.currentTarget.style.background = '#fafafa'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            <div style={{ fontSize: '11px', fontWeight: 900, opacity: 0.25, letterSpacing: '1px', fontFamily: 'var(--font-mono)' }}>{main.label}</div>
            <h3 style={{ fontSize: '48px', fontWeight: 800, lineHeight: '1.05', letterSpacing: '-2px', margin: 0 }}>{main.title}</h3>
            <p style={{ fontSize: '18px', color: '#666', lineHeight: '1.4', maxWidth: '90%', margin: 0 }}>{main.desc}</p>
            {main.story_id && (
              <div style={{ fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.4, letterSpacing: '1px' }}>
                VER ANÁLISIS COMPLETO ↗
              </div>
            )}
            <div style={{ marginTop: 'auto' }}>
              <div style={{ display: 'flex', height: '8px', background: '#f5f5f5', borderRadius: '4px', overflow: 'hidden', marginBottom: '16px' }}>
                {main.barType === 'bipartisan' ? (
                  <>
                    <div style={{ width: '40%', background: 'black' }}></div>
                    <div style={{ width: '15%', background: '#ccc' }}></div>
                    <div style={{ width: '45%', background: '#666' }}></div>
                  </>
                ) : (
                  <>
                    <div style={{ width: '60%', background: 'black' }}></div>
                    <div style={{ width: '25%', background: '#ccc' }}></div>
                    <div style={{ width: '15%', background: '#eee' }}></div>
                  </>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.4 }}>
                <span>{main.legendLeft || 'COBERTURA GLOBAL'}</span>
                <span>{main.legendRight || 'SESGO BALANCEADO'}</span>
              </div>
            </div>
          </div>
          {/* SIDES */}
          <div style={{ background: '#fcfcfc', borderLeft: 'var(--border-thin)', display: 'flex', flexDirection: 'column' }}>
            {sides.map((side, sidx) => (
              <div 
                key={sidx} 
                onClick={() => handleSideClick(side)}
                style={{ 
                  flex: 1,
                  padding: '40px 60px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  cursor: side.story_id ? 'pointer' : 'default', 
                  borderBottom: sidx === sides.length - 1 ? 'none' : '1px solid #eee',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => { if (side.story_id) e.currentTarget.style.background = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ fontSize: '10px', fontWeight: 900, opacity: 0.3, letterSpacing: '1px', marginBottom: '12px', fontFamily: 'var(--font-mono)' }}>{side.label}</div>
                <h4 style={{ fontSize: '20px', fontWeight: 800, lineHeight: '1.2', margin: 0, maxWidth: '90%' }}>{side.title}</h4>
                <div style={{ fontSize: '10px', fontWeight: 800, opacity: 0.2, marginTop: '12px', fontFamily: 'var(--font-mono)' }}>{side.meta}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SpecialSection;
