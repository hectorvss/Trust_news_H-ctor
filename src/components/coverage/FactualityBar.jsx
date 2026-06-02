import React from 'react';
import StackedBar from './StackedBar';
import { FACTUALITY_ORDER, FACTUALITY_LABEL, FACTUALITY_COLOR } from './helpers';

const FactualityBar = ({ breakdown = {}, title = 'FACTUALIDAD' }) => (
  <StackedBar
    title={title}
    breakdown={breakdown}
    order={FACTUALITY_ORDER}
    labelMap={FACTUALITY_LABEL}
    colorMap={FACTUALITY_COLOR}
  />
);

export default FactualityBar;
