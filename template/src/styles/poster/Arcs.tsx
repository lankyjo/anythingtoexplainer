// The backdrop: four cropped concentric arcs anchored at the top-right corner, in one committed
// colour with decreasing opacity, plus an optional filled disc. Cropping is the point.
import React from 'react';
import {Tokens} from './tokens';

export const ANCHOR = {x: 1258, y: 26};

export const Arcs: React.FC<{r0?: number; filled?: boolean}> = ({r0 = 250, filled = false}) => (
  <>
    {[0, 1, 2, 3].map((i) => {
      const r = r0 + i * 170;
      return (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: ANCHOR.x - r,
            top: ANCHOR.y - r,
            width: r * 2,
            height: r * 2,
            borderRadius: '50%',
            border: `2px solid rgba(29,63,191,${0.9 - i * 0.22})`,
          }}
        />
      );
    })}
    {filled ? <div style={{position: 'absolute', left: ANCHOR.x - 96, top: ANCHOR.y - 96, width: 192, height: 192, borderRadius: '50%', background: Tokens.accent}} /> : null}
  </>
);
