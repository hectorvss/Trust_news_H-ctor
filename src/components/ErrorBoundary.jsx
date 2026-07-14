import React from 'react';

// Evita la pantalla en blanco: captura cualquier error de render. Si es un fallo
// de carga de chunk (típico tras un redeploy con el index.html viejo cacheado),
// recarga la página una vez para traer los assets nuevos. Si es otro error,
// muestra una pantalla de recuperación Y registra el detalle (mensaje + qué
// componente ha reventado) para poder diagnosticar crashes recurrentes.
const isChunkError = (error) => {
  const msg = String(error?.message || error || '');
  return /Loading chunk|dynamically imported module|Importing a module script failed|Failed to fetch dynamically|error loading dynamically imported module/i.test(msg);
};

const RELOAD_FLAG = 'tne_chunk_reloaded';

// El primer componente no-nativo de la pila suele ser el que ha fallado.
const firstComponent = (stack) => {
  const line = String(stack || '').split('\n').map((s) => s.trim()).find((s) => s.startsWith('at '));
  return line ? line.replace(/^at\s+/, '') : '';
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, componentStack: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    const componentStack = errorInfo?.componentStack || '';
    this.setState({ componentStack });

    // Chunk que ya no existe en el servidor → recarga una sola vez.
    if (isChunkError(error) && !sessionStorage.getItem(RELOAD_FLAG)) {
      sessionStorage.setItem(RELOAD_FLAG, '1');
      window.location.reload();
      return;
    }

    // Persistimos el último error para poder inspeccionarlo aunque el usuario
    // recargue: se lee con  JSON.parse(localStorage.getItem('tne_last_error')).
    try {
      localStorage.setItem('tne_last_error', JSON.stringify({
        message: String(error?.message || error || ''),
        component: firstComponent(componentStack),
        stack: String(error?.stack || '').split('\n').slice(0, 6).join('\n'),
        componentStack: componentStack.split('\n').slice(0, 8).join('\n'),
        path: window.location.pathname + window.location.search,
        at: new Date().toISOString(),
      }));
    } catch { /* almacenamiento lleno o bloqueado */ }

    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught:', error, componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    if (isChunkError(this.state.error)) {
      // Mientras recarga, no pintamos nada visible molesto.
      return null;
    }
    const msg = String(this.state.error?.message || this.state.error || 'Error desconocido');
    const comp = firstComponent(this.state.componentStack);
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
        <details style={{ marginTop: '12px', maxWidth: '620px', width: '100%', textAlign: 'left' }}>
          <summary style={{ fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '1px', opacity: 0.4, cursor: 'pointer' }}>
            DETALLE TÉCNICO
          </summary>
          <pre style={{ marginTop: '10px', padding: '14px 16px', background: '#f6f6f6', border: '1px solid #eee', borderRadius: '8px', fontSize: '11px', lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'var(--font-mono)', color: '#333' }}>
{comp ? `Componente: ${comp}\n` : ''}{msg}
          </pre>
        </details>
      </div>
    );
  }
}

export default ErrorBoundary;
