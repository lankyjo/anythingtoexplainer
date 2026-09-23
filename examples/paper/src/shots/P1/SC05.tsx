// SC05: retrieve - the query dot finds its nearest neighbours. Hero: the grid; accent on the query.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Camera, clamp01} from '../../common';
import {RingTarget, Tokens} from '../../ui';
import {Diag, DotGrid, ScanLine, exitOp} from './helpers';

const F0 = 640;

export const SC05: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const n = N - F0;
  const out = exitOp(n, 102);
  const qx = 240 + Math.pow(1 - Math.pow(1 - clamp01((n - 8) / 22), 2.5), 1) * 230;
  const ring = clamp01((n - 38) / 18);
  return (
    <Camera N={N} keys={[{f: F0, cx: 620, cy: 380, s: 1}, {f: F0 + 101, cx: 560, cy: 390, s: 1.05}]}>
      <DotGrid
        x={200}
        y={300}
        cols={22}
        rows={5}
        pitch={36}
        dot={(col, row) => {
          const lit = (col === 9 || col === 10) && (row === 2 || row === 3);
          const base = lit ? (n > 44 ? 1 : 0.35) : 0.26 + 0.12 * Math.exp(-Math.pow(col - ((n * 0.6) % 22), 2) / 8);
          return {op: out * base, color: lit && n > 44 ? Tokens.ink : Tokens.muted};
        }}
      />
      <ScanLine n={n} y0={300} y1={480} x={200} w={792} />
      <div style={{position: 'absolute', left: qx, top: 378, width: 12, height: 12, borderRadius: '50%', background: Tokens.accent, opacity: out}} />
      <Diag x0={qx + 16} y0={384} x1={505} y1={390} p={ring} color={Tokens.hair} />
      <div style={{position: 'absolute', inset: 0, opacity: out, transform: `scale(${0.9 + 0.1 * ring})`, transformOrigin: '545px 390px'}}>
        <RingTarget cx={545} cy={390} r={[44, 70]} dot="none" />
      </div>
      <div style={{position: 'absolute', left: 440, top: 296, fontFamily: Tokens.sans, fontSize: 22, color: Tokens.muted, opacity: clamp01((n - 46) / 12) * out}}>closest chunks</div>
    </Camera>
  );
};
