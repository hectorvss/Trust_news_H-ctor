import React from 'react';
import StackedBar from './StackedBar';
import { OWNERSHIP_ORDER, OWNERSHIP_LABEL, OWNERSHIP_COLOR } from './helpers';

const OwnershipBar = ({ breakdown = {}, title = 'PROPIEDAD' }) => (
  <StackedBar
    title={title}
    breakdown={breakdown}
    order={OWNERSHIP_ORDER}
    labelMap={OWNERSHIP_LABEL}
    colorMap={OWNERSHIP_COLOR}
  />
);

export default OwnershipBar;
