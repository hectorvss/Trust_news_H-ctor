import React from 'react';
import { useBreakpoint } from '../hooks/useBreakpoint';

const Bullet = () => (
  <div style={{ width: '8px', height: '8px', background: 'black', marginRight: '16px' }} />
);

const ShareModal = ({ isOpen, onClose, storyTitle, storyUrl }) => {
  const { isMobile } = useBreakpoint();
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
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999999,
        padding: isMobile ? '16px' : '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          width: '100%',
          maxWidth: '500px',
          maxHeight: 'min(88vh, 760px)',
          borderRadius: '0',
          border: '2px solid black',
          padding: isMobile ? '24px' : '40px',
          boxShadow: isMobile ? '8px 8px 0 rgba(0,0,0,1)' : '12px 12px 0 rgba(0,0,0,1)',
          position: 'relative',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: isMobile ? '10px' : '20px',
            right: isMobile ? '10px' : '20px',
            background: 'none',
            border: 'none',
            fontSize: isMobile ? '20px' : '24px',
            cursor: 'pointer',
            padding: '8px',
            fontWeight: 800,
          }}
        >
          X
        </button>

        <div style={{ fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.4, letterSpacing: '3px', marginBottom: '16px' }}>
          TNE INTELLIGENCE / COMPARTIR
        </div>

        <h2 style={{ fontSize: isMobile ? '28px' : '42px', fontWeight: 800, letterSpacing: isMobile ? '-1.4px' : '-2.5px', marginBottom: '28px', lineHeight: '0.95', paddingRight: isMobile ? '28px' : '40px' }}>
          Enviar informe a la red.
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '32px', borderTop: '1px solid black' }}>
          {shareOptions.map((opt, i) => (
            <div
              key={i}
              onClick={() => handleShare(opt.url)}
              style={{
                padding: isMobile ? '20px 0' : '28px 0',
                borderBottom: '1px solid black',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                transition: '0.1s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.paddingLeft = '12px';
                e.currentTarget.style.background = '#f5f5f5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.paddingLeft = '0px';
                e.currentTarget.style.background = 'white';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
                <Bullet />
                <span style={{ fontWeight: 800, fontSize: isMobile ? '14px' : '16px', letterSpacing: '-0.2px' }}>{opt.name.toUpperCase()}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                <span style={{ fontSize: '13px', fontWeight: 900, opacity: 0.3 }}>{isMobile ? 'IR' : 'SELECT'}</span>
                <span style={{ fontSize: '22px', fontWeight: 900, opacity: 0.3, lineHeight: 1 }}>{'->'}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: isMobile ? '16px' : '24px', border: '1px solid black', position: 'relative' }}>
          <div style={{ fontSize: '9px', fontWeight: 900, opacity: 0.4, marginBottom: '12px', letterSpacing: '2px' }}>LOCALIZACION DEL RECURSO (URL)</div>
          <div style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-mono)', wordBreak: 'break-all', color: '#333' }}>
            {storyUrl || 'tne.es/story/7x9k2m4l'}
          </div>
          <div style={{ position: 'absolute', right: '-4px', bottom: '-4px', width: '100%', height: '100%', background: 'rgba(0,0,0,0.05)', zIndex: -1 }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', opacity: 0.2 }}>
          <div style={{ border: '1px solid black', width: '20px', height: '20px' }} />
          <div style={{ border: '1px solid black', width: '20px', height: '20px' }} />
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
