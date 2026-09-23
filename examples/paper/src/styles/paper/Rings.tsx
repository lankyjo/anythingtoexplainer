// Concentric-ring backdrop: four hairlines plus a centre dot, centred at (640, 368).
// It is the one structural motif every Paper shot sits on.
import React from 'react';
import {Tokens} from './tokens';

export const Rings: React.FC = () => (
  <>
    {[150, 235, 320, 405].map((r) => (
      <div
        key={r}
        style={{
          position: 'absolute',
          left: 640 - r,
          top: 368 - r,
          width: r * 2,
          height: r * 2,
          borderRadius: '50%',
          border: `1px solid ${Tokens.ring}`,
        }}
      />
    ))}
    <div style={{position: 'absolute', left: 640 - 6, top: 368 - 6, width: 12, height: 12, borderRadius: '50%', background: Tokens.ring}} />
  </>
);
