import React from 'react';

const Plus = () => <span style={{ fontSize: '14px', opacity: 0.3, fontWeight: 700 }}>+</span>;

const ShareModal = ({ isOpen, onClose, storyTitle, storyUrl }) => {
  if (!isOpen) return null;

  const shareOptions = [
    { name: 'WhatsApp', icon: '📱' },
    { name: 'X / Twitter', icon: '𝕏' },
    { name: 'LinkedIn', icon: '💼' },
    { name: 'Telegram', icon: '✈️' },
    { name: 'Email', icon: '✉️' },
  ];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.4)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10000,
      padding: '20px'
    }} onClick={onClose}>
      <div 
        style={{
          background: 'white',
          width: '100%',
          maxWidth: '500px',
          borderRadius: '32px',
          padding: '40px',
          boxShadow: '0 30px 60px rgba(0,0,0,0.12)',
          position: 'relative'
        }}
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '30px',
            right: '30px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            opacity: 0.3
          }}
        >✕</button>

        <div style={{ fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.3, letterSpacing: '2px', marginBottom: '16px' }}>
          TNE INTELLIGENCE / COMPARTIR
        </div>
        
        <h2 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-1.5px', marginBottom: '32px', lineHeight: '1' }}>
          Enviar historia a tu red.
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '32px' }}>
          {shareOptions.map((opt, i) => (
            <div 
              key={i} 
              style={{ 
                padding: '20px 24px', 
                border: '1px solid #f0f0f0', 
                borderRadius: '16px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                cursor: 'pointer',
                transition: '0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'black'; e.currentTarget.style.background = '#fcfcfc'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#f0f0f0'; e.currentTarget.style.background = 'white'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '20px' }}>{opt.icon}</span>
                <span style={{ fontWeight: 800, fontSize: '14px' }}>{opt.name.toUpperCase()}</span>
              </div>
              <Plus />
            </div>
          ))}
        </div>

        <div style={{ padding: '24px', background: '#f5f5f5', borderRadius: '16px', border: 'var(--border-thin)' }}>
          <div style={{ fontSize: '9px', fontWeight: 900, opacity: 0.3, marginBottom: '8px', letterSpacing: '1px' }}>URL DEL INFORME</div>
          <div style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>
            {storyUrl || 'tne.es/story/7x9k2m4l'}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px' }}>
          <Plus /> <Plus />
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
