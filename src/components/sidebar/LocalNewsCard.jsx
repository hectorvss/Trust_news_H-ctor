import React, { useRef } from 'react';

const LocalNewsCard = ({ navigate }) => {
  const inputRef = useRef(null);

  const handleSubmit = () => {
    const city = inputRef.current?.value?.trim();
    if (city) navigate('/?city=' + encodeURIComponent(city));
  };

  return (
    <div style={{ padding: '30px', border: 'var(--border-thin)', borderRadius: '24px', background: '#fff', marginBottom: '60px', overflow: 'hidden' }}>
      <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.5px' }}>Noticias Locales</h3>
      <p style={{ fontSize: '13px', opacity: 0.4, marginBottom: '30px', lineHeight: '1.2' }}>Descubre qué está pasando en tu ciudad ahora mismo.</p>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', borderBottom: '1.5px solid #f8f8f8', paddingBottom: '10px' }}>
        <input ref={inputRef} type="text" placeholder="Tu ciudad..." style={{ flex: 1, border: 'none', fontSize: '14px', outline: 'none', fontWeight: 600, width: '100%' }} onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }} />
        <button onClick={handleSubmit} style={{ background: 'black', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '100px', fontWeight: 900, fontSize: '11px', cursor: 'pointer', flexShrink: 0 }}>FIJAR</button>
      </div>
    </div>
  );
};

export default LocalNewsCard;
