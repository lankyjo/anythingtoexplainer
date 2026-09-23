// SC01: answers from memory, and the cutoff. Hero: the memory grid; accent on the cutoff tick.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Camera, clamp01} from '../../common';
import {Tokens} from '../../ui';
import {DotGrid, ScanLine, VLine} from './helpers';

const F0 = 78;

export const SC01: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const n = N - F0;
  const out = 1 - clamp01((n - 122) / 8);
  return (
    <Camera N={N} keys={[{f: F0, cx: 640, cy: 360, s: 1}, {f: F0 + 130, cx: 620, cy: 390, s: 1.05}]}>
      <DotGrid
        x={200}
        y={300}
        cols={22}
        rows={5}
        pitch={36}
        size={7}
        dot={(col, row) => {
          const reveal = clamp01((n - 2 - col * 1.1 - row * 0.5) / 7);
          const dim = n > 82 && col > 15 ? 0.2 : 1;
          const wave = Math.exp(-Math.pow(col - ((n * 0.5) % 22), 2) / 6);
          return {op: reveal * dim * out * (0.7 + 0.3 * wave)};
        }}
      />
      <ScanLine n={n} y0={300} y1={480} x={200} w={792} />
      <VLine x={760} y={286} h={224} p={(n - 79) / 16} />
      <div style={{position: 'absolute', left: 753, top: 282, width: 14, height: 4, background: Tokens.accent, opacity: clamp01((n - 80) / 8) * out}} />
      <div style={{position: 'absolute', left: 778, top: 266, fontFamily: Tokens.sans, fontWeight: 600, fontSize: 22, color: Tokens.muted, opacity: clamp01((n - 86) / 12) * out}}>cutoff</div>
    </Camera>
  );
};
