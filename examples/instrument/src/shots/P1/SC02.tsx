// SC02: ask about last week - one path from memory, one path that invents. Hero: the path pair.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Camera, clamp01} from '../../common';
import {Tokens} from '../../ui';
import {Diag, ScanLine, Wipe, Zigzag, exitOp} from './helpers';

const F0 = 210;

export const SC02: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const n = N - F0;
  const out = exitOp(n, 113);
  const dy = Math.pow(1 - clamp01((n - 8) / 22), 2.5) * 26;
  const p = clamp01((n - 57) / 22);
  return (
    <Camera N={N} keys={[{f: F0, cx: 640, cy: 360, s: 1.02}, {f: F0 + 112, cx: 640, cy: 360, s: 1}]}>
      <div style={{position: 'absolute', inset: 0, opacity: out}}>
        <div style={{position: 'absolute', left: 180, top: 186 + dy, width: 920, fontFamily: Tokens.sans, fontWeight: 400, fontSize: 56, letterSpacing: '-0.01em', color: Tokens.ink}}>Ask about last week</div>
        <Wipe x={180} y={268} w={920} p={clamp01((n - 12) / 20)} color={Tokens.hair} />
        <ScanLine n={n} y0={330} y1={500} x={260} w={720} />
        <Diag x0={260} y0={370} x1={980} y1={370} p={p} color={Tokens.ink} />
        <div style={{position: 'absolute', left: 260 + clamp01((n - 14) / 40) * 720, top: 364, width: 12, height: 12, borderRadius: '50%', background: Tokens.accent, opacity: clamp01((n - 12) / 8) * (1 - clamp01((n - 56) / 6)) * out}} />
        <div style={{position: 'absolute', left: 770, top: 334, fontFamily: Tokens.sans, fontSize: 22, color: Tokens.muted, opacity: clamp01((n - 70) / 12) * out}}>from memory</div>
        <Zigzag x={260} y={450 + 9 * Math.sin(n / 8)} w={720} amp={60} segs={10} p={p} phase={n / 4} />
        <div style={{position: 'absolute', left: 812, top: 536, fontFamily: Tokens.sans, fontSize: 22, color: Tokens.accent, opacity: clamp01((n - 74) / 12) * out}}>invented</div>
      </div>
    </Camera>
  );
};
