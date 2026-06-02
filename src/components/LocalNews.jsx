import React, { useState, useEffect, useRef } from 'react';
import { searchStories } from '../supabaseService';
import StoryCard from './StoryCard';
import { SkeletonStory } from './Skeleton';
import { useBreakpoint } from '../hooks/useBreakpoint';

const CITY_KEY = 'tne_local_city';

const LocalNews = ({ onSelectStory, favStoryIds, toggleFavorite, openShare }) => {
  const { isMobile } = useBreakpoint();
  const [city, setCity] = useState(() => localStorage.getItem(CITY_KEY) || '');
  const [input, setInput] = useState('');
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!city) return;
    setLoading(true);
    searchStories(city).then(data => { setStories(data || []); setLoading(false); });
  }, [city]);

  const setLocation = (value) => {
    const v = (value || '').trim();
    if (!v) return;
    localStorage.setItem(CITY_KEY, v);
    setCity(v);
  };

  // Derive the local media covering this location from the result set
  const localSources = Array.from(new Set(
    stories.flatMap(s => (s.articles || []).map(a => a.source)).filter(Boolean)
  )).slice(0, 12);

  // ── Empty state: choose a location ──
  if (!city) {
    return (
      <div style={{ maxWidth: 'var(--content-width)', margin: '0 auto', padding: isMobile ? '60px 16px' : '120px var(--page-padding)', textAlign: 'center', minHeight: '70vh' }}>
        <div style={{ fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '2px', opacity: 0.3, marginBottom: '24px' }}>
          TNE / LOCAL
        </div>
        <h1 style={{ fontSize: isMobile ? '40px' : '64px', fontWeight: 800, letterSpacing: isMobile ? '-2px' : '-3px', lineHeight: 1.0, margin: '0 auto 24px auto', maxWidth: '720px' }}>
          Elige una ubicación para crear tu feed local.
        </h1>
        <p style={{ fontSize: '18px', opacity: 0.55, maxWidth: '560px', margin: '0 auto 48px auto', lineHeight: 1.5 }}>
          Lee las noticias más relevantes de tu zona, descubre qué medios locales las cubren y contrasta su enfoque.
        </p>
        <form
          onSubmit={(e) => { e.preventDefault(); setLocation(input); }}
          style={{ maxWidth: '480px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
          <input
            ref={inputRef}
            autoFocus
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Escribe el nombre de tu ciudad…"
            style={{ padding: '18px 20px', border: 'var(--border-thin)', borderBottomWidth: '3px', fontSize: '18px', fontWeight: 600, fontFamily: 'var(--font-heading)', outline: 'none', textAlign: 'center' }}
          />
          <button type="submit" style={{ padding: '18px', background: 'black', color: 'white', border: 'none', fontWeight: 900, fontSize: '12px', fontFamily: 'var(--font-mono)', letterSpacing: '2px', cursor: 'pointer' }}>
            FIJAR MI UBICACIÓN ↗
          </button>
        </form>
        <div style={{ marginTop: '20px', fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-mono)', opacity: 0.4 }}>
          {['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao'].map(c => (
            <span key={c} onClick={() => setLocation(c)} style={{ cursor: 'pointer', margin: '0 8px', textDecoration: 'underline' }}>{c}</span>
          ))}
        </div>
      </div>
    );
  }

  // ── Located state: local feed ──
  return (
    <div style={{ maxWidth: 'var(--content-width)', margin: '0 auto', padding: isMobile ? '40px 16px' : '60px var(--page-padding)' }}>
      <div style={{ borderBottom: 'var(--border-thin)', paddingBottom: '32px', marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '2px', opacity: 0.3, marginBottom: '12px' }}>TNE / FEED LOCAL</div>
          <h1 style={{ fontSize: isMobile ? '40px' : '64px', fontWeight: 800, letterSpacing: isMobile ? '-2px' : '-3px', lineHeight: 1, margin: 0, textTransform: 'capitalize' }}>{city}</h1>
        </div>
        <button onClick={() => { localStorage.removeItem(CITY_KEY); setCity(''); setInput(''); setStories([]); }} style={{ padding: '10px 18px', border: 'var(--border-thin)', background: 'white', fontWeight: 900, fontSize: '10px', fontFamily: 'var(--font-mono)', letterSpacing: '1px', cursor: 'pointer' }}>
          CAMBIAR UBICACIÓN
        </button>
      </div>

      {/* Local summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1px', background: 'black', border: '1px solid black', marginBottom: '48px' }}>
        <div style={{ background: 'white', padding: '24px' }}>
          <div style={{ fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.4, letterSpacing: '1.5px', marginBottom: '12px' }}>NOTICIAS EN TU ZONA</div>
          <div style={{ fontSize: '40px', fontWeight: 900, letterSpacing: '-2px', lineHeight: 1 }}>{loading ? '…' : stories.length}</div>
        </div>
        <div style={{ background: 'white', padding: '24px' }}>
          <div style={{ fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.4, letterSpacing: '1.5px', marginBottom: '12px' }}>MEDIOS QUE CUBREN {city.toUpperCase()}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {localSources.length > 0
              ? localSources.map(s => <span key={s} style={{ fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-mono)', border: '1px solid #ddd', padding: '4px 8px' }}>{s}</span>)
              : <span style={{ fontSize: '13px', opacity: 0.4 }}>{loading ? 'Cargando…' : 'Sin medios identificados aún.'}</span>}
          </div>
        </div>
      </div>

      {/* Feed */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>{[1, 2, 3].map(i => <SkeletonStory key={i} />)}</div>
      ) : stories.length === 0 ? (
        <div style={{ padding: '80px 0', textAlign: 'center', borderTop: 'var(--border-thin)' }}>
          <div style={{ fontSize: '64px', fontWeight: 800, opacity: 0.05, marginBottom: '24px' }}>∅</div>
          <div style={{ fontSize: '14px', fontWeight: 800, marginBottom: '8px' }}>Aún no hay noticias indexadas para “{city}”.</div>
          <div style={{ fontSize: '12px', opacity: 0.4 }}>El motor irá poblando tu feed local a medida que ingiera fuentes.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
          {stories.map(story => (
            <div key={story.id} onClick={() => onSelectStory(story)} style={{ cursor: 'pointer' }}>
              <StoryCard story={story} isFavorite={favStoryIds.has(String(story.id))} onToggleFavorite={toggleFavorite} onShare={() => openShare(story)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocalNews;
