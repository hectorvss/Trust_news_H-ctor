import React from 'react';

// Evita la pantalla en blanco: captura cualquier error de render. Si es un fallo
// de carga de chunk (típico tras un redeploy con el index.html viejo cacheado),
// recarga la página una vez para traer los assets nuevos. Si es otro error,
// muestra una pantalla de recuperación en vez de dejar el DOM vacío.
const isChunkError = (error) => {
  const msg = String(error?.message || error || '');
  return /Loading chunk|dynamically imported module|Importing a module script failed|Failed to fetch dynamically/i.test(msg);
};

const RELOAD_FLAG = 'tne_chunk_reloaded';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error) {
    // Chunk que ya no existe en el servidor → recarga una sola vez.
    if (isChunkError(error) && !sessionStorage.getItem(RELOAD_FLAG)) {
      sessionStorage.setItem(RELOAD_FLAG, '1');
      window.location.reload();
      return;
    }
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught:', error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    if (isChunkError(this.state.error)) {
      // Mientras recarga, no pintamos nada visible molesto.
      return null;
    }
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', padding: '40px', textAlign: 'center', fontFamily: 'var(--font-heading)' }}>
        <div style={{ fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '3px', opacity: 0.4 }}>
          TNE / ERROR INESPERADO
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-1.5px', margin: 0, maxWidth: '520px', lineHeight: 1.1 }}>
          Algo se ha roto al cargar esta vista.
        </h1>
        <p style={{ fontSize: '15px', opacity: 0.6, maxWidth: '460px', lineHeight: 1.5, margin: 0 }}>
          Ha ocurrido un error inesperado. Recarga la página; si persiste, vuelve al inicio.
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => { sessionStorage.removeItem(RELOAD_FLAG); window.location.reload(); }}
            style={{ padding: '14px 28px', background: 'black', color: 'white', border: 'none', fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '1px', cursor: 'pointer' }}
          >
            RECARGAR ↻
          </button>
          <button
            onClick={() => { window.location.href = '/'; }}
            style={{ padding: '14px 28px', background: 'white', color: 'black', border: '1px solid black', fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '1px', cursor: 'pointer' }}
          >
            VOLVER AL INICIO
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
