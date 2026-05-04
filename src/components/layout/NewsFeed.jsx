import React from 'react';
import StoryCard from '../StoryCard';
import { SkeletonStory } from '../Skeleton';

const NewsFeed = ({ storiesLoading, displayStories, stories, onSelectStory, favStoryIds, toggleFavorite, openShare, visibleStories, finalStoriesCount, setVisibleStories }) => {
  return (
    <div className="main-content">
      {/* Main Stories Feed */}
      {storiesLoading && displayStories.length === 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
          {[1, 2, 3].map(i => <SkeletonStory key={i} />)}
        </div>
      )}
      {!storiesLoading && displayStories.length === 0 && (
        <div style={{ padding: '80px 0', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', fontWeight: 800, opacity: 0.05, marginBottom: '16px' }}>—</div>
          <div style={{ fontSize: '14px', fontWeight: 800, marginBottom: '8px' }}>No hay noticias disponibles</div>
          <div style={{ fontSize: '12px', opacity: 0.4, lineHeight: '1.5' }}>Publica tu primera noticia desde el Manager Studio o selecciona otra categoría.</div>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
        {displayStories.map(story => (
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
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '60px', marginBottom: '40px' }}>
        {visibleStories < finalStoriesCount ? (
          <button 
            onClick={() => setVisibleStories(prev => prev + 8)}
            style={{ padding: '18px 40px', border: '1.5px solid black', borderBottomWidth: '3px', background: 'none', borderRadius: '100px', fontSize: '12px', fontWeight: 900, cursor: 'pointer', transition: '0.2s', letterSpacing: '1px' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'black'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'black'; }}
          >
            CARGAR MÁS NOTICIAS
          </button>
        ) : (
          <div style={{ opacity: 0.3, fontSize: '11px', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>FIN DE LAS NOTICIAS RECIENTES</div>
        )}
      </div>
    </div>
  );
};

export default NewsFeed;
