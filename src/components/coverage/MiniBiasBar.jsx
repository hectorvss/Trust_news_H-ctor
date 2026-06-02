import React from 'react';
import { BUCKET_COLOR, BUCKET_LABEL } from './helpers';

/**
 * Compact 3-segment lean bar (Left / Center / Right) — the inline coverage
 * indicator used in feed list items and compact cards. Mirrors the 80×8px
 * mini bar from the Ground News "Top News Stories" feed, rendered in the
 * TNE monochrome palette (BUCKET_COLOR).
 *
 * Props:
 *  - distribution: { left, center, right } percentages (0–100)
 *  - width, height (px)
 */
const MiniBiasBar = ({ distribution = { left: 0, center: 0, right: 0 }, width = 80, height = 8 }) => {
  const segs = [
    { key: 'LEFT', pct: distribution.left || 0 },
    { key: 'CENTER', pct: distribution.center || 0 },
    { key: 'RIGHT', pct: distribution.right || 0 }
  ];
  const total = segs.reduce((a, s) => a + s.pct, 0);
  if (total <= 0) return null;

  return (
    <div
      style={{ display: 'flex', width, height, border: '1px solid #000', overflow: 'hidden', flexShrink: 0 }}
      aria-hidden="true"
    >
      {segs.map((s, i) =>
        s.pct > 0 ? (
          <div
            key={s.key}
            title={`${BUCKET_LABEL[s.key]}: ${s.pct}%`}
            style={{
              width: `${s.pct}%`,
              background: BUCKET_COLOR[s.key],
              borderRight: i < 2 ? '1px solid #fff' : 'none'
            }}
          />
        ) : null
      )}
    </div>
  );
};

export default MiniBiasBar;
