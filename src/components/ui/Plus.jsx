import React from 'react';

const Plus = ({ inline = false }) => (
  <span style={{
    fontSize: inline ? '14px' : '18px',
    opacity: 0.3,
    fontWeight: 700,
    ...(inline ? { display: 'inline-flex', alignItems: 'center', marginLeft: '4px', lineHeight: 1 } : {})
  }}>+</span>
);

export default Plus;
