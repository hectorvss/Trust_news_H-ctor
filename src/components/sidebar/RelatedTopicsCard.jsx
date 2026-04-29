import React from 'react';

const Plus = () => <span style={{ fontSize: '14px', opacity: 0.3, fontWeight: 700, display: 'inline-flex', alignItems: 'center', marginLeft: '4px', lineHeight: 1 }}>+</span>;

const RelatedTopicsCard = ({ navigate, relatedTopics, activeTopic }) => {
  return (
    <div style={{ marginBottom: '60px' }}>
      <h3 style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '2px', borderBottom: '2.5px solid black', paddingBottom: '12px', marginBottom: '24px', textTransform: 'uppercase' }}>Temas Relacionados</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {relatedTopics.map(topic => (
          <span key={topic} onClick={() => navigate('/?topic=' + encodeURIComponent(topic))} style={{ background: activeTopic === topic ? 'black' : 'none', color: activeTopic === topic ? 'white' : 'black', border: '1px solid #eee', fontSize: '10px', fontWeight: 800, padding: '8px 16px', borderRadius: '100px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', transition: '0.2s' }}>{topic} <Plus /></span>
        ))}
      </div>
    </div>
  );
};

export default RelatedTopicsCard;
