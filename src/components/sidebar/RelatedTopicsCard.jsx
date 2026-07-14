import React from 'react';
import Plus from '../ui/Plus';

const RelatedTopicsCard = ({ navigate, relatedTopics, activeTopic }) => {
  // Blindamos contra datos ausentes o mal formados: un tema puede llegar como
  // string o como objeto ({name}/{topic}) según la fuente; nunca renderizamos
  // un objeto (rompería el render) ni hacemos .map sobre algo que no sea array.
  const topics = (Array.isArray(relatedTopics) ? relatedTopics : [])
    .map(t => (typeof t === 'string' ? t : (t?.name || t?.topic || t?.label || '')))
    .map(t => String(t).trim())
    .filter(Boolean);

  if (topics.length === 0) return null;

  return (
    <div style={{ marginBottom: '60px' }}>
      <h3 style={{ fontSize: '13px', fontWeight: 900, letterSpacing: '1.5px', borderBottom: '2.5px solid black', paddingBottom: '12px', marginBottom: '24px', textTransform: 'uppercase' }}>Temas Relacionados</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {topics.map((topic, idx) => (
          <span key={`${topic}-${idx}`} onClick={() => navigate('/?topic=' + encodeURIComponent(topic))} style={{ background: activeTopic === topic ? 'black' : 'none', color: activeTopic === topic ? 'white' : 'black', border: '1px solid #eee', fontSize: '10px', fontWeight: 800, padding: '8px 16px', borderRadius: '100px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', transition: '0.2s' }}>{topic} <Plus inline /></span>
        ))}
      </div>
    </div>
  );
};

export default RelatedTopicsCard;
