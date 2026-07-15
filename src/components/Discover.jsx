import React, { useEffect, useState } from 'react';
import { fetchSources, mapSource } from '../supabaseService';
import { SourceLogo, SourceTag } from './coverage';
import { useBreakpoint } from '../hooks/useBreakpoint';

const FOLLOWS_KEY = 'tne_follows';

const loadFollows = () => {
  try {
    return new Set(JSON.parse(localStorage.getItem(FOLLOWS_KEY) || '[]'));
  } catch {
    return new Set();
  }
};

const saveFollows = (set) => localStorage.setItem(FOLLOWS_KEY, JSON.stringify([...set]));

const TOPICS = [
  'POLÍTICA',
  'ECONOMÍA',
  'INTERNACIONAL',
  'TECNOLOGÍA',
  'SOCIEDAD',
  'CULTURA',
  'DEPORTES',
  'CIENCIA',
  'CLIMA',
  'SANIDAD',
  'VIVIENDA',
  'INMIGRACIÓN',
  'ENERGÍA',
  'SUCESOS',
];

const PLACES = [
  'Madrid',
  'Barcelona',
  'Valencia',
  'Sevilla',
  'Bilbao',
  'Galicia',
  'Andalucía',
  'Cataluña',
  'País Vasco',
  'Bruselas',
  'Ucrania',
  'Gaza',
];

const PEOPLE = [
  'Pedro Sánchez',
  'Alberto Núñez Feijóo',
  'Santiago Abascal',
  'Yolanda Díaz',
  'Isabel Díaz Ayuso',
  'Carlos Mazón',
  'Úrsula von der Leyen',
  'Donald Trump',
];

const Discover = ({ navigate, setActiveCategory }) => {
  const { isMobile } = useBreakpoint();
  const [follows, setFollows] = useState(loadFollows);
  const [sources, setSources] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [query, setQuery] = useState('');

  const ql = query.trim().toLowerCase();
  const match = (value) => !ql || String(value || '').toLowerCase().includes(ql);

  useEffect(() => {
    fetchSources().then((list) => setSources((list || []).map(mapSource).filter(Boolean)));
  }, []);

  const toggleFollow = (key) => {
    setFollows((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      saveFollows(next);
      return next;
    });
  };

  // Solo estas categorías existen realmente en el feed (pipeline + seeds). El
  // resto de temas de Discover (CLIMA, INMIGRACIÓN, ENERGÍA…) no son categorías
  // asignables: deben buscarse por texto, no fijar un filtro de categoría vacío.
  const REAL_CATEGORIES = ['POLÍTICA', 'ECONOMÍA', 'INTERNACIONAL', 'SOCIEDAD', 'TECNOLOGÍA', 'DEPORTES', 'CIENCIA', 'CULTURA'];

  const goTopic = (topic) => {
    if (setActiveCategory) setActiveCategory(REAL_CATEGORIES.includes(topic) ? topic : 'TODO');
    navigate(`/?topic=${encodeURIComponent(topic)}`);
  };

  const goPlace = (place) => navigate(`/?city=${encodeURIComponent(place)}`);

  const Row = ({ icon, label, sublabel, followKey, onOpen }) => {
    const following = follows.has(followKey);

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid #eee' }}>
        <div
          onClick={onOpen}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flex: 1,
            cursor: onOpen ? 'pointer' : 'default',
            minWidth: 0,
          }}
        >
          {icon}
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '14px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {label}
            </div>
            {sublabel && <div style={{ marginTop: '3px' }}>{sublabel}</div>}
          </div>
        </div>
        <button
          onClick={() => toggleFollow(followKey)}
          aria-label={following ? 'Dejar de seguir' : 'Seguir'}
          style={{
            width: 30,
            height: 30,
            flexShrink: 0,
            borderRadius: '50%',
            cursor: 'pointer',
            border: '1px solid #000',
            background: following ? '#000' : '#fff',
            color: following ? '#fff' : '#000',
            fontWeight: 900,
            fontSize: '15px',
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {following ? '✓' : '+'}
        </button>
      </div>
    );
  };

  const monogram = (text) => (
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        background: '#000',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 900,
        fontFamily: 'var(--font-mono)',
        fontSize: '13px',
        flexShrink: 0,
      }}
    >
      {text.trim().charAt(0).toUpperCase()}
    </div>
  );

  const Section = ({ title, items, renderRow, sectionKey, searching }) => {
    if (searching && items.length === 0) return null;

    const isOpen = expanded[sectionKey];
    const shown = isOpen ? items : items.slice(0, isMobile ? 5 : 8);

    return (
      <section style={{ marginBottom: '56px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: '20px',
            borderBottom: '2px solid black',
            paddingBottom: '12px',
          }}
        >
          <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: 800, letterSpacing: '-1.5px', margin: 0 }}>
            {title}
          </h2>
          {items.length > (isMobile ? 5 : 8) && (
            <span
              onClick={() => setExpanded((prev) => ({ ...prev, [sectionKey]: !isOpen }))}
              style={{ fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', cursor: 'pointer', letterSpacing: '1px' }}
            >
              {isOpen ? 'VER MENOS' : 'VER MÁS'}
            </span>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', columnGap: '48px' }}>
          {shown.map(renderRow)}
        </div>
      </section>
    );
  };

  return (
    <div style={{ maxWidth: 'var(--content-width)', margin: '0 auto', padding: isMobile ? '40px 16px' : '60px var(--page-padding)' }}>
      <div style={{ marginBottom: '40px' }}>
        <div style={{ fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '2px', opacity: 0.3, marginBottom: '16px' }}>
          TNE / DESCUBRIR
        </div>
        <h1 style={{ fontSize: isMobile ? '44px' : '72px', fontWeight: 800, letterSpacing: isMobile ? '-2px' : '-4px', lineHeight: 0.95, margin: 0 }}>
          Sigue temas,
          <br />
          lugares, personas
          <br />
          y medios.
        </h1>
      </div>


      <div style={{ marginBottom: '48px' }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar temas, lugares, personas o medios…"
          style={{
            width: '100%',
            maxWidth: '520px',
            padding: '14px 18px',
            border: 'var(--border-thin)',
            borderBottomWidth: '3px',
            fontSize: '15px',
            fontWeight: 600,
            fontFamily: 'var(--font-heading)',
            outline: 'none',
          }}
        />
      </div>

      <Section
        title="Temas"
        sectionKey="topics"
        items={TOPICS.filter(match)}
        searching={!!ql}
        renderRow={(topic) => <Row key={topic} icon={monogram(topic)} label={topic} followKey={`topic:${topic}`} onOpen={() => goTopic(topic)} />}
      />

      <Section
        title="Lugares"
        sectionKey="places"
        items={PLACES.filter(match)}
        searching={!!ql}
        renderRow={(place) => <Row key={place} icon={monogram(place)} label={place} followKey={`place:${place}`} onOpen={() => goPlace(place)} />}
      />

      <Section
        title="Personas"
        sectionKey="people"
        items={PEOPLE.filter(match)}
        searching={!!ql}
        renderRow={(person) => <Row key={person} icon={monogram(person)} label={person} followKey={`person:${person}`} onOpen={() => goTopic(person)} />}
      />

      <Section
        title="Fuentes"
        sectionKey="sources"
        items={sources.filter((source) => match(source.name))}
        searching={!!ql}
        renderRow={(source) => (
          <Row
            key={source.id}
            icon={<SourceLogo source={source} size={32} />}
            label={source.name}
            sublabel={<SourceTag kind="bias" value={source.biasRating} />}
            followKey={`source:${source.id}`}
            onOpen={() => navigate(`/?topic=${encodeURIComponent(source.name)}`)}
          />
        )}
      />

      <div style={{ marginTop: '20px', padding: '20px', border: '1px dashed #ccc', fontSize: '12px', fontFamily: 'var(--font-mono)', opacity: 0.5, textAlign: 'center' }}>
        SIGUES {follows.size} ELEMENTO{follows.size === 1 ? '' : 'S'} · Tus seguimientos personalizan tu feed “Para ti”.
      </div>
    </div>
  );
};

export default Discover;
