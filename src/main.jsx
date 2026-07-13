import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'
import App from './App.jsx'

// Tras un redeploy, el index.html cacheado puede pedir un chunk que ya no existe.
// Vite emite 'vite:preloadError' cuando un import dinámico falla → recargamos una
// vez para traer los assets nuevos, en vez de dejar la pantalla en blanco.
window.addEventListener('vite:preloadError', () => {
  if (!sessionStorage.getItem('tne_chunk_reloaded')) {
    sessionStorage.setItem('tne_chunk_reloaded', '1');
    window.location.reload();
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
)

// Si la app siguió en pie unos segundos, la recarga anterior (si la hubo) funcionó:
// limpiamos el flag para permitir futuras auto-recargas por chunk en esta sesión.
setTimeout(() => sessionStorage.removeItem('tne_chunk_reloaded'), 5000)
