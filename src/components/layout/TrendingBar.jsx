import React from 'react';
import Plus from '../ui/Plus';

const TrendingBar = ({ navigate, trendingTopics, activeTopic }) => {
  return (
    <div 
      id="trending-bar"
      style={{ 
        borderBottom: 'var(--border-thin)', 
        padding: '12px var(--page-padding)', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '16px', 
        overflowX: 'auto', 
        whiteSpace: 'nowrap', 
        background: 'white',
        cursor: 'grab',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}
      onMouseDown={(e) => {
        const el = e.currentTarget;
        el.style.cursor = 'grabbing';
        const startX = e.pageX - el.offsetLeft;
        const scrollLeft = el.scrollLeft;
        
        const handleMouseMove = (em) => {
          const x = em.pageX - el.offsetLeft;
          const walk = (x - startX) * 2;
          el.scrollLeft = scrollLeft - walk;
        };
        
        const handleMouseUp = () => {
          el.style.cursor = 'grab';
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('mouseup', handleMouseUp);
        };
        
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
      }}
    >
      <style>{`
        #trending-bar::-webkit-scrollbar { display: none; }
      `}</style>
      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700, pointerEvents: 'none' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 6l-9.5 9.5-5-5L1 18"/><path d="M17 6h6v6"/></svg>
        TRENDING
      </span>
      {trendingTopics.map(topic => (
        <span key={topic} onClick={() => navigate('/?topic=' + encodeURIComponent(topic))} style={{ backgroundColor: activeTopic === topic ? 'black' : 'white', color: activeTopic === topic ? 'white' : 'black', padding: '8px 16px', borderRadius: '100px', fontSize: '11px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', border: '1px solid black', transition: '0.2s' }}>
          {topic} <Plus inline />
        </span>
      ))}
    </div>
  );
};

export default TrendingBar;
