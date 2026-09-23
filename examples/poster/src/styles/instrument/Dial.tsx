// The dial backdrop: three rings, 48 ticks (every fourth long and inked), radius labels in mono,
// and an optional teal sweep sector. Rings are structure here, not decoration.
import React from 'react';
import {Tokens} from './tokens';

export const DIAL_CX = 318;
export const DIAL_CY = 382;
const RINGS = [118, 196, 274];

export const Dial: React.FC<{sweep?: number}> = ({sweep = 0}) => (
  <>
    {RINGS.map((r) => (
      <div key={r} style={{position: 'absolute', left: DIAL_CX - r, top: DIAL_CY - r, width: r * 2, height: r * 2, borderRadius: '50%', border: `1px solid ${Tokens.ring}`}} />
    ))}
    {Array.from({length: 48}).map((_, i) => (
      <div
        key={i}
        style={{
          position: 'absolute',
          left: DIAL_CX,
          top: DIAL_CY,
          width: i % 4 === 0 ? 12 : 7,
          height: 1,
          background: i % 4 === 0 ? Tokens.ink : Tokens.hair,
          transformOrigin: '0 0',
          transform: `rotate(${i * 7.5}deg) translateX(274px)`,
        }}
      />
    ))}
    {sweep > 0 ? (
      <div
        style={{
          position: 'absolute',
          left: DIAL_CX - 196,
          top: DIAL_CY - 196,
          width: 392,
          height: 392,
          borderRadius: '50%',
          background: `conic-gradient(${Tokens.accent} ${Math.min(1, sweep) * 360}deg, transparent 0deg)`,
          mask: 'radial-gradient(circle, transparent 150px, #000 151px, #000 194px, transparent 195px)',
          WebkitMask: 'radial-gradient(circle, transparent 150px, #000 151px, #000 194px, transparent 195px)',
          opacity: 0.85,
        }}
      />
    ) : null}
    <div style={{position: 'absolute', left: DIAL_CX - 210, top: DIAL_CY - 210, width: 420, height: 420}}>
      {([['R1', 96, -18], ['R2', 168, 44], ['R3', 246, 128]] as Array<[string, number, number]>).map(([t, r, deg]) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <div key={t} style={{position: 'absolute', left: 210 + r * Math.cos(rad), top: 210 + r * Math.sin(rad), fontFamily: Tokens.mono, fontSize: 10, color: Tokens.muted}}>
            {t}
          </div>
        );
      })}
    </div>
  </>
);
