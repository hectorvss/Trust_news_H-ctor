import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBreakpoint } from '../hooks/useBreakpoint';

// Pantalla independiente de "todas las features" (separada de Pricing) con el
// mismo lenguaje visual monocromo. Cada grupo se pliega/despliega y hay un
// botón maestro para expandir/plegar todo.
const FEATURE_GROUPS = [
  {
    id: 'coverage',
    title: 'Análisis de cobertura',
    tag: 'NÚCLEO',
    items: [
      ['Distribución de sesgo por fuente', 'Cada noticia agrega izquierda / centro / derecha con datos reales de más de 80 medios y su clasificación editorial.'],
      ['Factualidad de cada medio', 'Valoración de fiabilidad factual (muy alta / alta / mixta / baja) por fuente y distribución agregada de la historia.'],
      ['Propiedad (ownership)', 'Quién posee cada medio y su categoría: conglomerado, público, independiente, sin ánimo de lucro o privado.'],
      ['Logos clicables al artículo', 'Pulsa el logo de cualquier fuente en el panel de cobertura para abrir su artículo original.'],
      ['Sesgo sin rastrear', 'Fuentes cuyo sesgo aún no está catalogado se muestran aparte, sin distorsionar la distribución.'],
    ],
  },
  {
    id: 'blindspot',
    title: 'Blindspot',
    tag: 'DIFERENCIAL',
    items: [
      ['Detección de puntos ciegos', 'Historias que un lado del espectro cubre mucho y el otro ignora, clasificadas For the Left / For the Right.'],
      ['Filtros de ámbito', 'TODO, España e Internacional, con el mismo criterio de desequilibrio.'],
      ['Imbalance Score', 'Ordena los blindspots por cuánto se desvía la cobertura entre lados.'],
    ],
  },
  {
    id: 'toddy',
    title: 'Toddy IA',
    tag: 'ASISTENTE',
    items: [
      ['Preguntas sobre la noticia', 'Explicaciones, resúmenes y análisis de sesgo generados sobre la cobertura real de cada historia.'],
      ['Profundidades', 'Respuesta rápida, análisis profundo, investigación y auditoría de fuentes.'],
      ['Créditos flexibles', 'Packs one-time que se suman a tu balance; el plan gratis mantiene 1 pregunta por noticia.'],
    ],
  },
  {
    id: 'personal',
    title: 'Personalización',
    tag: 'TU FEED',
    items: [
      ['Feed "Para ti"', 'El inicio se adapta a los temas favoritos que elijas en tu cuenta.'],
      ['Seguir temas, lugares, personas y medios', 'Desde Descubrir, construye tu propio radar informativo.'],
      ['Guardadas', 'Archivo personal de noticias con exportación CSV/JSON y métricas de tu colección.'],
      ['Temas relacionados', 'Cada noticia sugiere temas conectados para seguir tirando del hilo.'],
    ],
  },
  {
    id: 'bias-profile',
    title: 'Mi sesgo de lectura',
    tag: 'PERFIL',
    items: [
      ['Distribución ideológica personal', 'Cómo se reparte tu lectura entre izquierda, centro y derecha a lo largo del tiempo.'],
      ['Índice de diversidad', 'Mide la pluralidad de tu dieta informativa y su evolución diaria.'],
      ['Logros y recomendaciones', 'Objetivos de lectura equilibrada y consejos para salir de la cámara de eco.'],
    ],
  },
  {
    id: 'more',
    title: 'Más',
    tag: 'PLATAFORMA',
    items: [
      ['Noticias locales', 'Feed por ubicación con los medios que cubren tu zona.'],
      ['Resumen diario', 'Briefing editorial de la jornada: cobertura, sesgo, consensos y puntos ciegos.'],
      ['Cuenta y privacidad', 'Perfil, ajustes de lectura, suscripción y control de tus datos.'],
    ],
  },
];

const Features = ({ onBack }) => {
  const navigate = useNavigate();
  const { isMobile, isTablet } = useBreakpoint();
  const allIds = FEATURE_GROUPS.map(g => g.id);
  const [open, setOpen] = useState(() => new Set(allIds)); // todo abierto por defecto

  const allOpen = open.size === allIds.length;
  const toggleAll = () => setOpen(allOpen ? new Set() : new Set(allIds));
  const toggle = (id) => setOpen(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  return (
    <div className="pricing-page">
      <button
        onClick={onBack || (() => navigate('/'))}
        className="tag"
        style={{ background: 'none', cursor: 'pointer', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        {'<-'} Volver al Feed
      </button>

      <section style={{ padding: '0 0 40px 0', borderBottom: 'var(--border-thin)' }}>
        <span className="tag" style={{ background: 'black', color: 'white', border: 'none', marginBottom: '24px' }}>
          TODAS LAS FUNCIONES
        </span>
        <h1 style={{ fontSize: isMobile ? '44px' : isTablet ? '60px' : '80px', lineHeight: '0.9', letterSpacing: isMobile ? '-2px' : '-4px', margin: '0 0 24px' }}>
          Todo lo que incluye TNE.
        </h1>
        <p style={{ fontSize: isMobile ? '18px' : '24px', opacity: 0.6, maxWidth: '820px', lineHeight: '1.3' }}>
          Cada función de la plataforma, explicada. Hoy todas están disponibles para todos los usuarios.
        </p>
      </section>

      {/* Barra de control: contador + expandir/plegar todo + ir a precios */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: isMobile ? '20px 0' : '28px 0', borderBottom: 'var(--border-thin)', flexWrap: 'wrap', gap: '16px'
      }}>
        <span style={{ fontSize: '12px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.5, letterSpacing: '1px' }}>
          {FEATURE_GROUPS.reduce((n, g) => n + g.items.length, 0)} FUNCIONES · {FEATURE_GROUPS.length} CATEGORÍAS
        </span>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={toggleAll}
            style={{ padding: '12px 20px', background: 'black', color: 'white', border: 'none', fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '1px', cursor: 'pointer' }}
          >
            {allOpen ? 'PLEGAR TODO ▲' : 'DESPLEGAR TODO ▼'}
          </button>
          <button
            onClick={() => navigate('/pricing')}
            style={{ padding: '12px 20px', background: 'white', color: 'black', border: '1px solid black', fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '1px', cursor: 'pointer' }}
          >
            VER PLANES ↗
          </button>
        </div>
      </div>

      {/* Acordeón de grupos */}
      <div style={{ borderBottom: 'var(--border-thin)' }}>
        {FEATURE_GROUPS.map((group) => {
          const isOpen = open.has(group.id);
          return (
            <div key={group.id} style={{ borderTop: '1px solid #000' }}>
              <div
                onClick={() => toggle(group.id)}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: isMobile ? '24px 4px' : '32px 8px', cursor: 'pointer',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: isMobile ? '26px' : '38px', fontWeight: 800, letterSpacing: '-1.5px', margin: 0, lineHeight: 1 }}>
                    {group.title}
                  </h2>
                  <span className="tag" style={{ border: '1px solid black', background: 'none' }}>{group.tag}</span>
                  <span style={{ fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.3 }}>
                    {group.items.length}
                  </span>
                </div>
                <span style={{ fontSize: '22px', fontWeight: 900, lineHeight: 1, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
              </div>

              {isOpen && (
                <div style={{ paddingBottom: '20px' }}>
                  {group.items.map(([name, desc], i) => (
                    <div
                      key={i}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : '320px 1fr',
                        gap: isMobile ? '6px' : '40px',
                        padding: isMobile ? '16px 4px' : '20px 8px',
                        borderTop: '1px solid #eee',
                        alignItems: 'start',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ width: 8, height: 8, background: 'black', flexShrink: 0 }} />
                        <span style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '-0.3px' }}>{name}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '20px' }}>
                        <p style={{ fontSize: '14px', lineHeight: 1.5, opacity: 0.6, margin: 0 }}>{desc}</p>
                        <span style={{ fontSize: '9px', fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '1px', padding: '4px 8px', background: 'black', color: 'white', whiteSpace: 'nowrap', flexShrink: 0 }}>
                          INCLUIDO
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <section style={{ padding: isMobile ? '40px 0' : '60px 0', textAlign: 'center' }}>
        <p style={{ fontSize: isMobile ? '20px' : '28px', fontWeight: 700, letterSpacing: '-1px', marginBottom: '24px' }}>
          ¿List@ para verlo todo en acción?
        </p>
        <button
          onClick={() => navigate('/pricing')}
          className="navbar__link"
          style={{ padding: '18px 40px', background: 'black', color: 'white', border: 'none', fontSize: '13px', fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '1px', cursor: 'pointer' }}
        >
          VER PLANES Y PRECIOS ↗
        </button>
      </section>
    </div>
  );
};

export default Features;
