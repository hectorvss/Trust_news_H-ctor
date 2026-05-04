import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchStories } from '../supabaseService';
import StoryCard from './StoryCard';
import { SkeletonStory } from './Skeleton';

const SearchResults = ({ onSelectStory, favStoryIds, toggleFavorite, openShare }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [inputValue, setInputValue] = useState(query);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    setSearched(false);
    searchStories(query).then(data => {
      setResults(data);
      setLoading(false);
      setSearched(true);
    });
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const term = inputValue.trim();
    if (term) setSearchParams({ q: term });
  };

  return (
    <div style={{ maxWidth: 'var(--content-width)', margin: '0 auto', padding: '60px var(--page-padding)' }}>

      {/* Header */}
      <div style={{ borderBottom: 'var(--border-thin)', paddingBottom: '40px', marginBottom: '60px' }}>
        <div style={{ fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '2px', opacity: 0.3, marginBottom: '16px' }}>
          TNE / BUSCADOR
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0', border: 'var(--border-thin)', borderBottomWidth: '3px' }}>
          <input
            autoFocus
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="Buscar noticias, temas, lugares..."
            style={{
              flex: 1,
              padding: '20px 24px',
              border: 'none',
              outline: 'none',
              fontSize: '22px',
              fontWeight: 700,
              fontFamily: 'var(--font-heading)',
              letterSpacing: '-0.5px',
              background: 'transparent',
            }}
          />
          <button
            type="submit"
            style={{
              padding: '20px 32px',
              background: 'black',
              color: 'white',
              border: 'none',
              fontSize: '11px',
              fontWeight: 900,
              fontFamily: 'var(--font-mono)',
              letterSpacing: '2px',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            BUSCAR ↗
          </button>
        </form>
      </div>

      {/* Estado: cargando */}
      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
          {[1, 2, 3].map(i => <SkeletonStory key={i} />)}
        </div>
      )}

      {/* Estado: resultados */}
      {!loading && searched && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '40px' }}>
            <h1 style={{ fontSize: '48px', fontWeight: 800, letterSpacing: '-2px', lineHeight: 1 }}>
              {results.length > 0 ? (
                <>{results.length} resultado{results.length !== 1 ? 's' : ''}</>
              ) : (
                <>Sin resultados</>
              )}
            </h1>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 800, opacity: 0.3, letterSpacing: '1px' }}>
              BÚSQUEDA: "{query.toUpperCase()}"
            </span>
          </div>

          {results.length === 0 ? (
            <div style={{ padding: '80px 0', textAlign: 'center', borderTop: 'var(--border-thin)' }}>
              <div style={{ fontSize: '64px', fontWeight: 800, opacity: 0.05, marginBottom: '24px' }}>∅</div>
              <div style={{ fontSize: '14px', fontWeight: 800, marginBottom: '8px' }}>
                No encontramos noticias para "{query}"
              </div>
              <div style={{ fontSize: '12px', opacity: 0.4, lineHeight: '1.6' }}>
                Prueba con otro término o revisa las categorías disponibles.
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
              {results.map(story => (
                <div key={story.id} onClick={() => onSelectStory(story)} style={{ cursor: 'pointer' }}>
                  <StoryCard
                    story={story}
                    isFavorite={favStoryIds.has(String(story.id))}
                    onToggleFavorite={toggleFavorite}
                    onShare={() => openShare(story)}
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Estado: sin búsqueda aún */}
      {!loading && !searched && !query && (
        <div style={{ padding: '80px 0', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.2, letterSpacing: '2px' }}>
            INTRODUCE UN TÉRMINO PARA BUSCAR
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
