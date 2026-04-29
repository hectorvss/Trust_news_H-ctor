import React from 'react';

export const SkeletonStory = () => (
  <div style={{ 
    padding: '30px', 
    border: '0.888889px solid #ddd', 
    borderRadius: '25px', 
    marginBottom: '30px',
    minHeight: '380px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    background: '#fff',
    animation: 'shimmer 1.5s infinite linear'
  }}>
    <style>{`
      @keyframes shimmer {
        0% { background-position: -468px 0; }
        100% { background-position: 468px 0; }
      }
    `}</style>
    <div>
      <div style={{ width: '80px', height: '20px', background: '#f0f0f0', borderRadius: '20px', marginBottom: '20px' }}></div>
      <div style={{ width: '90%', height: '48px', background: '#f0f0f0', borderRadius: '4px', marginBottom: '12px' }}></div>
      <div style={{ width: '70%', height: '48px', background: '#f0f0f0', borderRadius: '4px' }}></div>
    </div>
    <div style={{ display: 'flex', gap: '12px' }}>
      <div style={{ width: '120px', height: '14px', background: '#f8f8f8', borderRadius: '4px' }}></div>
      <div style={{ width: '80px', height: '14px', background: '#f8f8f8', borderRadius: '4px' }}></div>
    </div>
  </div>
);

export const SkeletonSidebar = () => (
  <div style={{ marginBottom: '32px', animation: 'shimmer 1.5s infinite linear' }}>
    <div style={{ width: '60%', height: '18px', background: '#f0f0f0', marginBottom: '16px', borderRadius: '4px' }}></div>
    <div style={{ height: '120px', background: '#f8f8f8', border: '1px solid #eee', borderRadius: '12px' }}></div>
  </div>
);
