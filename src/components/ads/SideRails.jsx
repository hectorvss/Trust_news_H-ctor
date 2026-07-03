import React from 'react';
import AdSlot from './AdSlot';
import { useMediaQuery } from '../../hooks/useMediaQuery';

// Rails laterales fijos para no-pagantes. Se muestran desde 1280px (portátiles
// y sobremesa). En pantallas anchas caen en el hueco vacío; en portátiles
// medianos, App inseta el contenido para no solaparse (ver App.jsx).
const railStyle = (side) => ({
  position: 'fixed',
  top: '96px',
  [side]: '16px',
  zIndex: 900,
  pointerEvents: 'auto',
});

const SideRails = ({ active, navigate }) => {
  const wideEnough = useMediaQuery('(min-width: 1280px)');
  if (!active || !wideEnough) return null;

  return (
    <>
      <div style={railStyle('left')} aria-hidden="true">
        <AdSlot navigate={navigate} />
      </div>
      <div style={railStyle('right')} aria-hidden="true">
        <AdSlot navigate={navigate} />
      </div>
    </>
  );
};

export default SideRails;
