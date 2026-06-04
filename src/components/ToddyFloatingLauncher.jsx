import React from 'react';

const ToddyFloatingLauncher = ({ onClick, isMobile = false, hidden = false }) => {
  if (hidden) return null;

  return (
    <>
      <style>{`
        @keyframes toddyLauncherFloat {
          0%, 100% { transform: translateY(0) rotate(-1deg); }
          50% { transform: translateY(-5px) rotate(1deg); }
        }
        @keyframes toddyLauncherPeek {
          0%, 72%, 100% { transform: translate(0, 0) rotate(0deg); }
          78% { transform: translate(9px, -6px) rotate(8deg); }
          84% { transform: translate(-5px, 4px) rotate(-6deg); }
          91% { transform: translate(0, 0) rotate(0deg); }
        }
        @keyframes toddyLauncherLook {
          0%, 55%, 100% { transform: translateX(0); }
          64% { transform: translateX(3px); }
          76% { transform: translateX(-2px); }
          88% { transform: translateX(0); }
        }
        @keyframes toddyLauncherBlink {
          0%, 84%, 100% { transform: scaleY(1); }
          88%, 91% { transform: scaleY(0.12); }
        }
        @keyframes toddyLauncherPress {
          0% { transform: scale(1); }
          45% { transform: scale(0.92); }
          100% { transform: scale(1); }
        }
        .toddy-floating-launcher {
          animation: toddyLauncherFloat 5.5s ease-in-out infinite;
        }
        .toddy-floating-launcher:hover {
          transform: translateY(-4px) scale(1.03);
          box-shadow: 0 18px 44px rgba(0,0,0,0.20);
        }
        .toddy-floating-launcher:active {
          animation: toddyLauncherPress 220ms ease-out;
        }
        .toddy-floating-face {
          animation: toddyLauncherPeek 9s ease-in-out infinite;
        }
        .toddy-floating-eyes {
          animation: toddyLauncherLook 7s ease-in-out infinite;
        }
        .toddy-floating-eye {
          transform-origin: center;
          animation: toddyLauncherBlink 5.8s ease-in-out infinite;
        }
        .toddy-floating-launcher:hover .toddy-floating-face {
          transform: translate(5px, -3px) rotate(5deg);
          animation-play-state: paused;
        }
        .toddy-floating-launcher:focus-visible {
          outline: 3px solid #111;
          outline-offset: 4px;
        }
        @media (prefers-reduced-motion: reduce) {
          .toddy-floating-launcher,
          .toddy-floating-face,
          .toddy-floating-eyes,
          .toddy-floating-eye {
            animation: none !important;
          }
          .toddy-floating-launcher:hover {
            transform: none;
          }
        }
      `}</style>
      <button
        className="toddy-floating-launcher"
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onClick?.();
        }}
        aria-label="Preguntar a Toddy sobre esta noticia"
        title="Preguntar a Toddy"
        style={{
          position: 'fixed',
          right: isMobile ? '18px' : '28px',
          bottom: isMobile ? '18px' : '28px',
          zIndex: 980,
          width: isMobile ? '54px' : '58px',
          height: isMobile ? '54px' : '58px',
          borderRadius: '50%',
          border: '1px solid rgba(17,17,17,0.16)',
          background: '#fff',
          color: '#111',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 14px 34px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.08)',
          overflow: 'hidden',
          transition: 'transform 180ms ease, box-shadow 180ms ease',
          padding: 0
        }}
      >
        <span
          className="toddy-floating-face"
          aria-hidden="true"
          style={{
            position: 'relative',
            width: isMobile ? '31px' : '34px',
            height: isMobile ? '34px' : '37px',
            display: 'block'
          }}
        >
          <span
            className="toddy-floating-eyes"
            style={{
              position: 'absolute',
              left: '4px',
              top: '8px',
              width: '24px',
              height: '8px',
              display: 'flex',
              justifyContent: 'space-between'
            }}
          >
            <span
              className="toddy-floating-eye"
              style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                background: '#111',
                display: 'block'
              }}
            />
            <span
              className="toddy-floating-eye"
              style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                background: '#111',
                display: 'block',
                animationDelay: '120ms'
              }}
            />
          </span>
          <span
            style={{
              position: 'absolute',
              left: '14px',
              top: '12px',
              width: '9px',
              height: '16px',
              borderLeft: '2px solid #111',
              borderBottom: '2px solid #111',
              borderRadius: '0 0 0 8px',
              transform: 'rotate(11deg)'
            }}
          />
          <span
            style={{
              position: 'absolute',
              left: '7px',
              bottom: '5px',
              width: '18px',
              height: '9px',
              borderTop: '2px solid #111',
              borderRadius: '50%',
              transform: 'rotate(-10deg)'
            }}
          />
        </span>
      </button>
    </>
  );
};

export default ToddyFloatingLauncher;
