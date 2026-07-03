import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBreakpoint } from '../hooks/useBreakpoint';

// Pantalla independiente de "todas las features" (separada de Pricing) con el
// mismo lenguaje visual monocromo. Cada función indica a qué plan pertenece;
// el filtro superior muestra qué incluye cada suscripción (acumulativo). Los
// grupos se pliegan/despliegan y hay un botón maestro para todo.
//
// Nota: "de momento todo gratis" → todas las funciones están disponibles hoy;
// la etiqueta de plan refleja a qué nivel pertenece cada una.

const TIERS = ['ESTÁNDAR', 'PREMIUM', 'ELITE'];
const TIER_RANK = { 'ESTÁNDAR': 0, 'PREMIUM': 1, 'ELITE': 2 };
const tierStyle = (tier) => {
  if (tier === 'ELITE') return { background: '#000', color: '#fff', border: '1px solid #000' };
  if (tier === 'PREMIUM') return { background: '#e9e9e9', color: '#000', border: '1px solid #000' };
  return { background: '#fff', color: '#000', border: '1px solid #000' }; // ESTÁNDAR
};

// item = [name, desc, tier]
const FEATURE_GROUPS = [
  {
    id: 'coverage',
    title: 'Análisis de cobertura',
    tag: 'NÚCLEO',
    items: [
      ['Distribución de sesgo por fuente', 'Cada noticia agrega izquierda / centro / derecha con datos reales de más de 80 medios y su clasificación editorial.', 'ESTÁNDAR'],
      ['Factualidad de cada medio', 'Valoración de fiabilidad factual (muy alta / alta / mixta / baja) por fuente y distribución agregada de la historia.', 'ESTÁNDAR'],
      ['Propiedad (ownership)', 'Quién posee cada medio y su categoría: conglomerado, público, independiente, sin ánimo de lucro o privado.', 'ESTÁNDAR'],
      ['Logos clicables al artículo', 'Pulsa el logo de cualquier fuente en el panel de cobertura para abrir su artículo original.', 'ESTÁNDAR'],
      ['Sesgo sin rastrear', 'Fuentes cuyo sesgo aún no está catalogado se muestran aparte, sin distorsionar la distribución.', 'ESTÁNDAR'],
      ['Noticias completas redactadas', 'La síntesis editorial completa de cada historia, más allá del titular y el extracto.', 'PREMIUM'],
      ['Gráficos de sesgo avanzados', 'Desgloses granulares de 5 puntos y comparativas de framing entre lados.', 'PREMIUM'],
    ],
  },
  {
    id: 'blindspot',
    title: 'Blindspot',
    tag: 'DIFERENCIAL',
    items: [
      ['Detección de puntos ciegos', 'Historias que un lado del espectro cubre mucho y el otro ignora, clasificadas For the Left / For the Right.', 'ESTÁNDAR'],
      ['Filtros de ámbito', 'TODO, España e Internacional, con el mismo criterio de desequilibrio.', 'ESTÁNDAR'],
      ['Imbalance Score', 'Ordena los blindspots por cuánto se desvía la cobertura entre lados.', 'ESTÁNDAR'],
      ['Blindspots ilimitados', 'Sin límite de historias en el feed de puntos ciegos, con seguimiento continuo.', 'PREMIUM'],
    ],
  },
  {
    id: 'toddy',
    title: 'Toddy IA',
    tag: 'ASISTENTE',
    items: [
      ['1 pregunta IA por noticia', 'Explicación rápida sobre la cobertura real de cada historia, sin consumir créditos.', 'ESTÁNDAR'],
      ['Profundidades avanzadas', 'Análisis profundo, investigación y auditoría de fuentes además de la respuesta rápida.', 'PREMIUM'],
      ['50 créditos IA/mes', 'Bolsa mensual de créditos para usar Toddy en profundidad.', 'PREMIUM'],
      ['200 créditos IA/mes', 'Máxima autonomía para seguir noticias vivas y auditar fuentes.', 'ELITE'],
    ],
  },
  {
    id: 'personal',
    title: 'Personalización',
    tag: 'TU FEED',
    items: [
      ['Feed "Para ti"', 'El inicio se adapta a los temas favoritos que elijas en tu cuenta.', 'ESTÁNDAR'],
      ['Seguir temas, lugares, personas y medios', 'Desde Descubrir, construye tu propio radar informativo.', 'ESTÁNDAR'],
      ['Guardadas', 'Archivo personal de noticias con exportación CSV/JSON y métricas de tu colección.', 'ESTÁNDAR'],
      ['Temas relacionados', 'Cada noticia sugiere temas conectados para seguir tirando del hilo.', 'ESTÁNDAR'],
      ['Sin anuncios ni tracking', 'Experiencia de lectura limpia, sin publicidad ni seguimiento.', 'PREMIUM'],
    ],
  },
  {
    id: 'bias-profile',
    title: 'Mi sesgo de lectura',
    tag: 'PERFIL',
    items: [
      ['Distribución ideológica personal', 'Cómo se reparte tu lectura entre izquierda, centro y derecha a lo largo del tiempo.', 'ESTÁNDAR'],
      ['Índice de diversidad', 'Mide la pluralidad de tu dieta informativa y su evolución diaria.', 'ESTÁNDAR'],
      ['Logros y recomendaciones', 'Objetivos de lectura equilibrada y consejos para salir de la cámara de eco.', 'ESTÁNDAR'],
      ['Reportes semanales de sesgo', 'Informe periódico con tu evolución y comparativas.', 'ELITE'],
    ],
  },
  {
    id: 'more',
    title: 'Más',
    tag: 'PLATAFORMA',
    items: [
      ['Noticias locales', 'Feed por ubicación con los medios que cubren tu zona.', 'ESTÁNDAR'],
      ['Resumen diario', 'Briefing editorial de la jornada: cobertura, sesgo, consensos y puntos ciegos.', 'ESTÁNDAR'],
      ['Cuenta y privacidad', 'Perfil, ajustes de lectura, suscripción y control de tus datos.', 'ESTÁNDAR'],
      ['Acceso a la API de datos TNE', 'Consume la clasificación de cobertura y sesgo de forma programática.', 'ELITE'],
      ['Exportación de datos analíticos', 'Descarga tus métricas y las de cobertura para análisis externo.', 'ELITE'],
      ['Soporte prioritario 24/7', 'Atención preferente para cuentas Elite.', 'ELITE'],
    ],
  },
];

const Features = ({ onBack }) => {
  const navigate = useNavigate();
  const { isMobile, isTablet } = useBreakpoint();
  const allIds = FEATURE_GROUPS.map(g => g.id);
  const [open, setOpen] = useState(() => new Set(allIds)); // todo abierto por defecto
  const [plan, setPlan] = useState('ALL'); // ALL | ESTÁNDAR | PREMIUM | ELITE

  const allOpen = open.size === allIds.length;
  const toggleAll = () => setOpen(allOpen ? new Set() : new Set(allIds));
  const toggle = (id) => setOpen(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  // Un plan "incluye" su nivel y los inferiores (acumulativo).
  const itemVisible = (tier) => plan === 'ALL' || TIER_RANK[tier] <= TIER_RANK[plan];
  const totalVisible = FEATURE_GROUPS.reduce((n, g) => n + g.items.filter(it => itemVisible(it[2])).length, 0);

  const PlanChip = ({ id, label }) => {
    const active = plan === id;
    return (
      <button
        onClick={() => setPlan(id)}
        style={{
          padding: '10px 16px', border: '1px solid black', cursor: 'pointer',
          fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '1px',
          background: active ? 'black' : 'white', color: active ? 'white' : 'black',
        }}
      >
        {label}
      </button>
    );
  };

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
          Cada función y a qué plan pertenece. Hoy todas están disponibles para todos los usuarios; la etiqueta indica el nivel de cada una.
        </p>
      </section>

      {/* Filtro por suscripción */}
      <div style={{ padding: isMobile ? '20px 0 12px' : '28px 0 16px', borderBottom: '1px solid #eee' }}>
        <div style={{ fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.4, letterSpacing: '1px', marginBottom: '14px' }}>
          VER LO QUE INCLUYE CADA SUSCRIPCIÓN
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <PlanChip id="ALL" label="TODAS" />
          <PlanChip id="ESTÁNDAR" label="ESTÁNDAR (GRATIS)" />
          <PlanChip id="PREMIUM" label="PREMIUM" />
          <PlanChip id="ELITE" label="ELITE" />
        </div>
      </div>

      {/* Barra de control: contador + expandir/plegar todo + ir a precios */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: isMobile ? '16px 0' : '22px 0', borderBottom: 'var(--border-thin)', flexWrap: 'wrap', gap: '16px'
      }}>
        <span style={{ fontSize: '12px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.5, letterSpacing: '1px' }}>
          {totalVisible} FUNCIONES{plan !== 'ALL' ? ` EN ${plan}` : ''}
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
          const visibleItems = group.items.filter(it => itemVisible(it[2]));
          if (visibleItems.length === 0) return null; // grupo sin funciones en este plan
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
                    {visibleItems.length}
                  </span>
                </div>
                <span style={{ fontSize: '22px', fontWeight: 900, lineHeight: 1, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
              </div>

              {isOpen && (
                <div style={{ paddingBottom: '20px' }}>
                  {visibleItems.map(([name, desc, tier], i) => (
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
                        <span style={{ ...tierStyle(tier), fontSize: '9px', fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '1px', padding: '4px 8px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                          {tier}
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

      {/* Leyenda de planes */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', padding: isMobile ? '20px 0' : '24px 0', borderBottom: 'var(--border-thin)' }}>
        {TIERS.map(t => (
          <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ ...tierStyle(t), fontSize: '9px', fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '1px', padding: '4px 8px' }}>{t}</span>
            <span style={{ fontSize: '12px', opacity: 0.5 }}>
              {t === 'ESTÁNDAR' ? 'Incluido en el plan gratuito' : t === 'PREMIUM' ? 'Incluido desde Premium' : 'Exclusivo Elite'}
            </span>
          </div>
        ))}
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
