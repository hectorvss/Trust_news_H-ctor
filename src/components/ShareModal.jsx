import React from 'react';

const Bullet = () => (
  <div style={{ width: '8px', height: '8px', background: 'black', marginRight: '16px' }} />
);

const ShareModal = ({ isOpen, onClose, storyTitle, storyUrl }) => {
  if (!isOpen) return null;

  const encodedUrl = encodeURIComponent(storyUrl);
  const encodedTitle = encodeURIComponent(storyTitle || 'Interesante noticia en TNE');

  const shareOptions = [
    { name: 'WhatsApp', url: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}` },
    { name: 'X / Twitter', url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}` },
    { name: 'LinkedIn', url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
    { name: 'Telegram', url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}` },
    { name: 'Email', url: `mailto:?subject=${encodedTitle}&body=${encodedUrl}` },
  ];

  const handleShare = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(255,255,255,0.7)',
      backdropFilter: 'blur(3px)', // Reduced blur as requested
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 999999,
      padding: '20px'
    }} onClick={onClose}>
      <div 
        style={{
          background: 'white',
          width: '100%',
          maxWidth: '500px',
          borderRadius: '0',
          border: '2px solid black',
          padding: '40px',
          boxShadow: '12px 12px 0px rgba(0,0,0,1)',
          position: 'relative'
        }}
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '10px',
            fontWeight: 800
          }}
        >✕</button>

        <div style={{ fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.4, letterSpacing: '3px', marginBottom: '16px' }}>
          TNE INTELLIGENCE / COMPARTIR
        </div>
        
        <h2 style={{ fontSize: '42px', fontWeight: 800, letterSpacing: '-2.5px', marginBottom: '40px', lineHeight: '0.9' }}>
          Enviar informe a la red.
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0px', marginBottom: '40px', borderTop: '1px solid black' }}>
          {shareOptions.map((opt, i) => (
            <div 
              key={i} 
              onClick={() => handleShare(opt.url)}
              style={{ 
                padding: '28px 0', 
                borderBottom: '1px solid black', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                cursor: 'pointer',
                transition: '0.1s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.paddingLeft = '12px'; e.currentTarget.style.background = '#f5f5f5'; }}
              onMouseLeave={(e) => { e.currentTarget.style.paddingLeft = '0px'; e.currentTarget.style.background = 'white'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Bullet />
                <span style={{ fontWeight: 800, fontSize: '16px', letterSpacing: '-0.2px' }}>{opt.name.toUpperCase()}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '13px', fontWeight: 900, opacity: 0.3 }}>SELECT</span>
                <span style={{ fontSize: '22px', fontWeight: 900, opacity: 0.3, lineHeight: 1 }}>→</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: '24px', border: '1px solid black', position: 'relative' }}>
          <div style={{ fontSize: '9px', fontWeight: 900, opacity: 0.4, marginBottom: '12px', letterSpacing: '2px' }}>LOCALIZACIÓN DEL RECURSO (URL)</div>
          <div style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-mono)', wordBreak: 'break-all', color: '#333' }}>
            {storyUrl || 'tne.es/story/7x9k2m4l'}
          </div>
          <div style={{ position: 'absolute', right: '-4px', bottom: '-4px', width: '100%', height: '100%', background: 'rgba(0,0,0,0.05)', zIndex: -1 }}></div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', opacity: 0.2 }}>
          <div style={{ border: '1px solid black', width: '20px', height: '20px' }} />
          <div style={{ border: '1px solid black', width: '20px', height: '20px' }} />
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
