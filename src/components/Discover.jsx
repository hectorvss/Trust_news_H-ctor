import React, { useState, useEffect, useMemo } from 'react';
import { fetchSources, mapSource } from '../supabaseService';
import { SourceTag } from './coverage';
import { BIAS_LABEL, BIAS_COLOR, BUCKET_COLOR } from './coverage/helpers';
import { useBreakpoint } from '../hooks/useBreakpoint';

// ── Persistence ────────────────────────────────────────────────────────────────
const FOLLOWS_KEY = 'tne_follows';
const loadFollows = () => {
  try { return new Set(JSON.parse(localStorage.getItem(FOLLOWS_KEY) || '[]')); }
  catch { return new Set(); }
};
const saveFollows = (set) => localStorage.setItem(FOLLOWS_KEY, JSON.stringify([...set]));

// ── Static catalogs ─────────────────────────────────────────────────────────
const TOPICS = [
  { id: 'POLÍTICA', label: 'POLÍTICA', desc: 'Gobierno, Congreso, partidos y elecciones.' },
  { id: 'ECONOMÍA', label: 'ECONOMÍA', desc: 'Mercados, empleo, inflación y política fiscal.' },
  { id: 'INTERNACIONAL', label: 'INTERNACIONAL', desc: 'Conflictos, diplomacia y geopolítica global.' },
  { id: 'TECNOLOGÍA', label: 'TECNOLOGÍA', desc: 'IA, Big Tech, startups y regulación digital.' },
  { id: 'SOCIEDAD', label: 'SOCIEDAD', desc: 'Derechos, educación, género y cultura urbana.' },
  { id: 'CULTURA', label: 'CULTURA', desc: 'Cine, literatura, música y patrimonio.' },
  { id: 'DEPORTES', label: 'DEPORTES', desc: 'Fútbol, baloncesto, tenis y competición.' },
  { id: 'CIENCIA', label: 'CIENCIA', desc: 'Investigación, salud pública y avances.' },
  { id: 'CLIMA', label: 'CLIMA', desc: 'Cambio climático, energía y medioambiente.' },
  { id: 'SANIDAD', label: 'SANIDAD', desc: 'Salud pública, medicamentos y sistema sanitario.' },
  { id: 'VIVIENDA', label: 'VIVIENDA', desc: 'Alquiler, precios, política de vivienda.' },
  { id: 'INMIGRACIÓN', label: 'INMIGRACIÓN', desc: 'Política migratoria, asilo y fronteras.' },
  { id: 'ENERGÍA', label: 'ENERGÍA', desc: 'Renovables, petróleo, nuclear y precios.' },
  { id: 'SUCESOS', label: 'SUCESOS', desc: 'Criminalidad, juicios y seguridad pública.' },
];

const PLACES = [
  { id: 'Madrid', label: 'Madrid', desc: 'Comunidad Autónoma de Madrid.' },
  { id: 'Barcelona', label: 'Barcelona', desc: 'Capital de Cataluña y segundo polo económico.' },
  { id: 'Valencia', label: 'Valencia', desc: 'Comunitat Valenciana.' },
  { id: 'Sevilla', label: 'Sevilla', desc: 'Capital de Andalucía.' },
  { id: 'Bilbao', label: 'Bilbao', desc: 'País Vasco, centro financiero del norte.' },
  { id: 'Galicia', label: 'Galicia', desc: 'Comunidad Autónoma del noroeste.' },
  { id: 'Andalucía', label: 'Andalucía', desc: 'La comunidad autónoma más poblada de España.' },
  { id: 'Cataluña', label: 'Cataluña', desc: 'Debate soberanista y motor económico.' },
  { id: 'País Vasco', label: 'País Vasco', desc: 'Euskadi, estatuto y política vasca.' },
  { id: 'Bruselas', label: 'Bruselas', desc: 'Unión Europea, Parlamento y Comisión.' },
  { id: 'Ucrania', label: 'Ucrania', desc: 'Guerra, reconstrucción y geopolítica europea.' },
  { id: 'Gaza', label: 'Gaza', desc: 'Conflicto Israel-Palestina y ayuda humanitaria.' },
];

const PEOPLE = [
  { id: 'Pedro Sánchez', label: 'Pedro Sánchez', desc: 'Presidente del Gobierno. PSOE.' },
  { id: 'Alberto Núñez Feijóo', label: 'Alberto N. Feijóo', desc: 'Líder de la oposición. PP.' },
  { id: 'Santiago Abascal', label: 'Santiago Abascal', desc: 'Líder de Vox.' },
  { id: 'Yolanda Díaz', label: 'Yolanda Díaz', desc: 'Vicepresidenta y ministra de Trabajo. Sumar.' },
  { id: 'Isabel Díaz Ayuso', label: 'Isabel Díaz Ayuso', desc: 'Presidenta Comunidad de Madrid. PP.' },
  { id: 'Carlos Mazón', label: 'Carlos Mazón', desc: 'President de la Generalitat Valenciana. PP.' },
  { id: 'Úrsula von der Leyen', label: 'Úrsula von der Leyen', desc: 'Presidenta de la Comisión Europea.' },
  { id: 'Donald Trump', label: 'Donald Trump', desc: 'Presidente de EE.UU. Partido Republicano.' },
];

// ── Bias bucket metadata ─────────────────────────────────────────────────────
const BUCKET_META = {
  LEFT:   { label: 'Izquierda',  dot: '#000' },
  LEAN_LEFT:  { label: 'Centro-Izq.', dot: '#3a3a3a' },
  CENTER: { label: 'Centro',     dot: '#888' },
  LEAN_RIGHT: { label: 'Centro-Der.', dot: '#b8b8b8' },
  RIGHT:  { label: 'Derecha',    dot: '#d8d8d8' },
};

// ── Component ────────────────────────────────────────────────────────────────
const Discover = ({ navigate, setActiveCategory }) => {
  const { isMobile } = useBreakpoint();
  const [follows, setFollows] = useState(loadFollows);
  const [sources, setSources] = useState([]);
  const [loadingSources, setLoadingSources] = useState(true);
  const [query, setQuery] = useState('');
  const [activeSection, setActiveSection] = useState('all');
  const [expandedSections, setExpandedSections] = useState({});

  const ql = query.trim().toLowerCase();
  const match = (s) => !ql || String(s || '').toLowerCase().includes(ql);

  useEffect(() => {
    fetchSources()
      .then(list => setSources((list || []).map(mapSource).filter(Boolean)))
      .finally(() => setLoadingSources(false));
  }, []);

  const toggleFollow = (key) => {
    setFollows(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      saveFollows(next);
      return next;
    });
  };

  const goTopic = (t) => {
    if (setActiveCategory) setActiveCategory(t);
    navigate(`/?topic=${encodeURIComponent(t)}`);
  };

  // ── Sources grouped by bias ──────────────────────────────────────────────
  const sourcesByBias = useMemo(() => {
    const groups = {};
    sources
      .filter(s => match(s.name))
      .forEach(s => {
        const key = s.biasRating || 'CENTER';
        if (!groups[key]) groups[key] = [];
        groups[key].push(s);
      });
    return groups;
  }, [sources, ql]);

  const followCount = follows.size;
  const followedTopics = [...follows].filter(k => k.startsWith('topic:')).map(k => k.replace('topic:', ''));
  const followedPlaces = [...follows].filter(k => k.startsWith('place:')).map(k => k.replace('place:', ''));
  const followedPeople = [...follows].filter(k => k.startsWith('person:')).map(k => k.replace('person:', ''));
  const followedSources = [...follows].filter(k => k.startsWith('source:')).map(k => k.replace('source:', ''));

  const filteredTopics = TOPICS.filter(t => match(t.label) || match(t.desc));
  const filteredPlaces = PLACES.filter(p => match(p.label) || match(p.desc));
  const filteredPeople = PEOPLE.filter(p => match(p.label) || match(p.desc));
  const filteredSources = sources.filter(s => match(s.name));

  const isSearching = ql.length > 0;

  // ── Sub-components ────────────────────────────────────────────────────────

  const FollowButton = ({ followKey, small }) => {
    const following = follows.has(followKey);
    return (
      <button
        onClick={(e) => { e.stopPropagation(); toggleFollow(followKey); }}
        aria-label={following ? 'Dejar de seguir' : 'Seguir'}
        style={{
          width: small ? 28 : 34,
          height: small ? 28 : 34,
          flexShrink: 0,
          borderRadius: '50%',
          cursor: 'pointer',
          border: '2px solid #000',
          background: following ? '#000' : '#fff',
          color: following ? '#fff' : '#000',
          fontWeight: 900,
          fontSize: small ? '14px' : '16px',
          lineHeight: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.15s',
        }}
      >
        {following ? '✓' : '+'}
      </button>
    );
  };

  // Topic / Place / Person card (grid cell)
  const ItemCard = ({ item, followKey, onOpen, icon }) => {
    const following = follows.has(followKey);
    return (
      <div
        style={{
          border: '1px solid black',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          cursor: 'pointer',
          background: '#fff',
          transition: 'box-shadow 0.15s',
        }}
        onClick={() => onOpen && onOpen(item.id)}
        onMouseEnter={e => e.currentTarget.style.boxShadow = '4px 4px 0 rgba(0,0,0,1)'}
        onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          {/* Icon square */}
          <div style={{
            width: '44px', height: '44px',
            background: following ? '#000' : '#000',
            color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontFamily: 'var(--font-mono)', fontSize: '18px',
            flexShrink: 0,
            letterSpacing: 0,
          }}>
            {icon || item.label.trim().charAt(0).toUpperCase()}
          </div>
          <FollowButton followKey={followKey} />
        </div>
        <div>
          <div style={{ fontSize: isMobile ? '14px' : '15px', fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '0.5px', marginBottom: '4px' }}>
            {item.label}
          </div>
          <div style={{ fontSize: '12px', lineHeight: 1.5, opacity: 0.5 }}>{item.desc}</div>
        </div>
        {following && (
          <div style={{ fontSize: '9px', fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '1.5px', opacity: 0.4 }}>
            SIGUIENDO ✓
          </div>
        )}
      </div>
    );
  };

  // Source row item
  const SourceRow = ({ source }) => {
    const following = follows.has(`source:${source.id}`);
    const dot = BIAS_COLOR[source.biasRating] || '#888';
    return (
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: '14px',
          padding: '14px 0', borderBottom: '1px solid #f0f0f0',
          cursor: 'pointer',
        }}
        onClick={() => navigate(`/?topic=${encodeURIComponent(source.name)}`)}
      >
        {/* Logo / monogram */}
        <div style={{
          width: '36px', height: '36px', flexShrink: 0,
          border: '1px solid #e0e0e0', overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#fafafa',
        }}>
          {source.logoUrl
            ? <img src={source.logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={e => { e.target.style.display = 'none'; }} />
            : <span style={{ fontWeight: 900, fontFamily: 'var(--font-mono)', fontSize: '13px' }}>{(source.name || '?').charAt(0).toUpperCase()}</span>
          }
        </div>
        {/* Name + bias */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '14px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{source.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: dot, flexShrink: 0 }} />
            <span style={{ fontSize: '10px', fontWeight: 800, fontFamily: 'var(--font-mono)', opacity: 0.5 }}>
              {BIAS_LABEL[source.biasRating] || source.biasRating || 'Centro'}
            </span>
            {source.domain && (
              <span style={{ fontSize: '10px', opacity: 0.3, fontFamily: 'var(--font-mono)' }}>· {source.domain}</span>
            )}
          </div>
        </div>
        <FollowButton followKey={`source:${source.id}`} small />
      </div>
    );
  };

  // Section header
  const SectionHeader = ({ title, count, sectionKey, total, threshold }) => {
    const isOpen = expandedSections[sectionKey];
    const showToggle = total > threshold;
    return (
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        borderBottom: '2px solid black', paddingBottom: '14px', marginBottom: '24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
          <h2 style={{
            fontSize: isMobile ? '28px' : '36px', fontWeight: 800,
            letterSpacing: '-1.5px', margin: 0, lineHeight: 1,
          }}>{title}</h2>
          {count > 0 && (
            <span style={{ fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.3, letterSpacing: '1px' }}>
              {count} siguiendo
            </span>
          )}
        </div>
        {showToggle && (
          <span
            onClick={() => setExpandedSections(p => ({ ...p, [sectionKey]: !isOpen }))}
            style={{ fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', cursor: 'pointer', letterSpacing: '1px', opacity: 0.5 }}
          >
            {isOpen ? 'VER MENOS ↑' : 'VER MÁS ↓'}
          </span>
        )}
      </div>
    );
  };

  // Grid section (topics, places, people)
  const GridSection = ({ title, items, keyPrefix, onOpen, sectionKey, followedCount }) => {
    if (isSearching && items.length === 0) return null;
    const threshold = isMobile ? 6 : 8;
    const shown = expandedSections[sectionKey] ? items : items.slice(0, threshold);
    return (
      <section style={{ marginBottom: '64px' }}>
        <SectionHeader
          title={title}
          count={followedCount}
          sectionKey={sectionKey}
          total={items.length}
          threshold={threshold}
        />
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: '1px',
          border: '1px solid black',
          background: 'black',
        }}>
          {shown.map(item => (
            <div key={item.id} style={{ background: '#fff' }}>
              <ItemCard
                item={item}
                followKey={`${keyPrefix}:${item.id}`}
                onOpen={onOpen}
              />
            </div>
          ))}
        </div>
      </section>
    );
  };

  // ── Sources section (grouped by bias) ────────────────────────────────────
  const SourcesSection = () => {
    if (loadingSources) {
      return (
        <section style={{ marginBottom: '64px' }}>
          <SectionHeader title="Fuentes" count={followedSources.length} sectionKey="sources" total={0} threshold={10} />
          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', opacity: 0.3, padding: '32px 0', textAlign: 'center', letterSpacing: '2px' }}>
            CARGANDO MEDIOS...
          </div>
        </section>
      );
    }
    if (isSearching && filteredSources.length === 0) return null;

    const BIAS_ORDER = ['LEFT', 'LEAN_LEFT', 'CENTER', 'LEAN_RIGHT', 'RIGHT'];
    const threshold = 5;

    return (
      <section style={{ marginBottom: '64px' }}>
        <SectionHeader
          title="Medios"
          count={followedSources.length}
          sectionKey="sources"
          total={filteredSources.length}
          threshold={filteredSources.length + 1}
        />

        {/* Total summary bar */}
        {!isSearching && (
          <div style={{
            display: 'flex', gap: '0', marginBottom: '32px',
            border: '1px solid black', overflow: 'hidden',
          }}>
            {BIAS_ORDER.map(bias => {
              const group = sourcesByBias[bias] || [];
              if (group.length === 0) return null;
              const pct = Math.round((group.length / sources.length) * 100);
              const dot = BIAS_COLOR[bias] || '#888';
              return (
                <div key={bias} style={{
                  flex: group.length, padding: '14px 16px',
                  borderRight: '1px solid black',
                  background: bias === 'LEFT' ? '#000' : bias === 'LEAN_LEFT' ? '#1a1a1a' : bias === 'CENTER' ? '#f5f5f5' : bias === 'LEAN_RIGHT' ? '#fafafa' : '#fff',
                }}>
                  <div style={{
                    fontSize: '9px', fontWeight: 900, fontFamily: 'var(--font-mono)',
                    letterSpacing: '1px', marginBottom: '4px',
                    color: ['LEFT', 'LEAN_LEFT'].includes(bias) ? '#fff' : '#000',
                    opacity: 0.6,
                  }}>
                    {BIAS_LABEL[bias]?.toUpperCase()}
                  </div>
                  <div style={{
                    fontSize: isMobile ? '18px' : '22px', fontWeight: 800,
                    color: ['LEFT', 'LEAN_LEFT'].includes(bias) ? '#fff' : '#000',
                  }}>
                    {group.length}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Groups */}
        {BIAS_ORDER.map(bias => {
          const group = (sourcesByBias[bias] || []);
          if (group.length === 0) return null;
          const isOpen = expandedSections[`sources_${bias}`];
          const shown = isOpen ? group : group.slice(0, threshold);
          return (
            <div key={bias} style={{ marginBottom: '36px' }}>
              {/* Group header */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 14px',
                background: ['LEFT', 'LEAN_LEFT'].includes(bias) ? '#000' : '#f5f5f5',
                marginBottom: '0',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    width: 10, height: 10,
                    background: ['LEFT', 'LEAN_LEFT'].includes(bias) ? '#fff' : BIAS_COLOR[bias],
                    borderRadius: '50%',
                  }} />
                  <span style={{
                    fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)',
                    letterSpacing: '2px',
                    color: ['LEFT', 'LEAN_LEFT'].includes(bias) ? '#fff' : '#000',
                  }}>
                    {BIAS_LABEL[bias]?.toUpperCase()}
                  </span>
                  <span style={{
                    fontSize: '10px', fontFamily: 'var(--font-mono)',
                    color: ['LEFT', 'LEAN_LEFT'].includes(bias) ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)',
                  }}>
                    {group.length} medios
                  </span>
                </div>
                {group.length > threshold && (
                  <span
                    onClick={() => setExpandedSections(p => ({ ...p, [`sources_${bias}`]: !isOpen }))}
                    style={{
                      fontSize: '9px', fontWeight: 900, fontFamily: 'var(--font-mono)',
                      cursor: 'pointer', letterSpacing: '1px',
                      color: ['LEFT', 'LEAN_LEFT'].includes(bias) ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.4)',
                    }}
                  >
                    {isOpen ? 'VER MENOS' : 'VER MÁS'}
                  </span>
                )}
              </div>
              <div style={{
                border: '1px solid black', borderTop: 'none',
                padding: '0 16px',
              }}>
                {shown.map(source => <SourceRow key={source.id} source={source} />)}
              </div>
            </div>
          );
        })}
      </section>
    );
  };

  // ── Following summary ────────────────────────────────────────────────────
  const FollowingSummary = () => {
    if (followCount === 0) return null;
    return (
      <div style={{
        border: '2px solid black', padding: isMobile ? '20px' : '24px 28px',
        marginBottom: '48px', position: 'relative',
        boxShadow: '4px 4px 0 rgba(0,0,0,1)',
      }}>
        <div style={{ fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '3px', opacity: 0.4, marginBottom: '14px' }}>
          TU FEED PERSONALIZADO
        </div>
        <div style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: 800, letterSpacing: '-0.8px', marginBottom: '18px' }}>
          Sigues {followCount} elemento{followCount !== 1 ? 's' : ''}. Tu feed de inicio se actualiza con estas preferencias.
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            ...followedTopics.map(t => ({ label: t, key: `topic:${t}`, type: 'TEMA' })),
            ...followedPlaces.map(p => ({ label: p, key: `place:${p}`, type: 'LUGAR' })),
            ...followedPeople.map(p => ({ label: p, key: `person:${p}`, type: 'PERSONA' })),
          ].slice(0, 10).map(item => (
            <div key={item.key} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              border: '1px solid black', padding: '5px 12px',
            }}>
              <span style={{ fontSize: '9px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.4, letterSpacing: '1px' }}>{item.type}</span>
              <span style={{ fontSize: '12px', fontWeight: 700 }}>{item.label}</span>
              <span
                onClick={() => toggleFollow(item.key)}
                style={{ cursor: 'pointer', fontSize: '12px', opacity: 0.4, lineHeight: 1, marginLeft: '4px' }}
              >×</span>
            </div>
          ))}
          {followCount > 10 && (
            <div style={{ border: '1px solid black', padding: '5px 12px', fontSize: '11px', fontFamily: 'var(--font-mono)', opacity: 0.4 }}>
              +{followCount - 10} más
            </div>
          )}
        </div>
      </div>
    );
  };

  // ── Nav tabs ──────────────────────────────────────────────────────────────
  const NAV_TABS = [
    { l: 'MI FEED', go: () => navigate('/') },
    { l: 'DESCUBRIR', go: null },
    { l: 'GUARDADAS', go: () => navigate('/favorites') },
    { l: 'MIS SESGOS', go: () => navigate('/mi-sesgo') },
  ];

  const FILTER_TABS = [
    { id: 'all', label: 'TODO' },
    { id: 'topics', label: 'TEMAS' },
    { id: 'places', label: 'LUGARES' },
    { id: 'people', label: 'PERSONAS' },
    { id: 'sources', label: 'MEDIOS' },
  ];

  const showTopics = activeSection === 'all' || activeSection === 'topics';
  const showPlaces = activeSection === 'all' || activeSection === 'places';
  const showPeople = activeSection === 'all' || activeSection === 'people';
  const showSources = activeSection === 'all' || activeSection === 'sources';

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 'var(--content-width)', margin: '0 auto', padding: isMobile ? '40px 16px' : '60px var(--page-padding)' }}>

      {/* Breadcrumb */}
      <div style={{ fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '2px', opacity: 0.3, marginBottom: '16px' }}>
        TNE / DESCUBRIR
      </div>

      {/* Hero title */}
      <h1 style={{
        fontSize: isMobile ? '44px' : '72px',
        fontWeight: 800, letterSpacing: isMobile ? '-2px' : '-4px',
        lineHeight: 0.95, margin: '0 0 40px',
      }}>
        Sigue temas,<br />lugares, personas<br />y medios.
      </h1>

      {/* Sub-nav */}
      <div style={{
        display: 'flex', gap: '0', borderBottom: '2px solid black',
        marginBottom: '40px', overflowX: 'auto',
        scrollbarWidth: 'none',
      }}>
        {NAV_TABS.map(t => (
          <span
            key={t.l}
            onClick={t.go || undefined}
            style={{
              padding: '14px 20px',
              fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)',
              letterSpacing: '1px', cursor: t.go ? 'pointer' : 'default',
              borderBottom: !t.go ? '3px solid black' : '3px solid transparent',
              marginBottom: '-2px',
              opacity: !t.go ? 1 : 0.35,
              whiteSpace: 'nowrap',
              background: !t.go ? 'transparent' : 'transparent',
            }}
          >
            {t.l}
          </span>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: '32px', display: 'flex', gap: '0' }}>
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center',
          border: '2px solid black', maxWidth: '560px',
        }}>
          <span style={{ padding: '0 14px', opacity: 0.3, fontSize: '16px' }}>⌕</span>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar temas, lugares, personas o medios…"
            style={{
              flex: 1, padding: '14px 14px 14px 0',
              border: 'none', outline: 'none',
              fontSize: '14px', fontWeight: 600,
              fontFamily: 'var(--font-heading)',
              background: 'transparent',
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{ padding: '0 14px', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.4, fontSize: '16px' }}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Section filter pills */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '48px', flexWrap: 'wrap' }}>
        {FILTER_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            style={{
              padding: '8px 16px',
              border: '2px solid black',
              background: activeSection === tab.id ? 'black' : 'white',
              color: activeSection === tab.id ? 'white' : 'black',
              cursor: 'pointer',
              fontSize: '10px', fontWeight: 900,
              fontFamily: 'var(--font-mono)',
              letterSpacing: '1.5px',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Following summary */}
      <FollowingSummary />

      {/* Search results header */}
      {isSearching && (
        <div style={{ marginBottom: '32px', padding: '16px 20px', background: '#f5f5f5', border: '1px solid black' }}>
          <span style={{ fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '2px', opacity: 0.5 }}>
            RESULTADOS PARA "{query.toUpperCase()}"
          </span>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', opacity: 0.4, marginLeft: '12px' }}>
            {filteredTopics.length + filteredPlaces.length + filteredPeople.length + filteredSources.length} elementos
          </span>
        </div>
      )}

      {/* No results */}
      {isSearching &&
        filteredTopics.length === 0 &&
        filteredPlaces.length === 0 &&
        filteredPeople.length === 0 &&
        filteredSources.length === 0 && (
        <div style={{ padding: '64px 0', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', letterSpacing: '3px', opacity: 0.3 }}>
            SIN RESULTADOS PARA "{query.toUpperCase()}"
          </div>
          <div style={{ fontSize: '13px', opacity: 0.4, marginTop: '12px' }}>
            Intenta con otra búsqueda.
          </div>
        </div>
      )}

      {/* Temas */}
      {showTopics && (
        <GridSection
          title="Temas"
          items={filteredTopics}
          keyPrefix="topic"
          onOpen={(id) => goTopic(id)}
          sectionKey="topics"
          followedCount={followedTopics.length}
        />
      )}

      {/* Lugares */}
      {showPlaces && (
        <GridSection
          title="Lugares"
          items={filteredPlaces}
          keyPrefix="place"
          onOpen={(id) => navigate(`/?city=${encodeURIComponent(id)}`)}
          sectionKey="places"
          followedCount={followedPlaces.length}
        />
      )}

      {/* Personas */}
      {showPeople && (
        <GridSection
          title="Personas"
          items={filteredPeople}
          keyPrefix="person"
          onOpen={(id) => goTopic(id)}
          sectionKey="people"
          followedCount={followedPeople.length}
        />
      )}

      {/* Medios / Sources */}
      {showSources && <SourcesSection />}

      {/* Footer info */}
      <div style={{
        marginTop: '16px', padding: '20px 24px',
        border: '1px solid black',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '12px',
      }}>
        <div>
          <span style={{ fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '2px', opacity: 0.4 }}>
            {followCount} ELEMENTO{followCount !== 1 ? 'S' : ''} SEGUIDOS
          </span>
          <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', opacity: 0.3, marginLeft: '12px' }}>
            · Tu feed se adapta a tus preferencias
          </span>
        </div>
        <span
          onClick={() => navigate('/')}
          style={{ fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '1px', cursor: 'pointer', opacity: 0.5 }}
        >
          VER MI FEED ↗
        </span>
      </div>
    </div>
  );
};

export default Discover;
