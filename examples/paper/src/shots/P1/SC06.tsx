// SC06: generate - the answer is written, citations link to sources. Hero: the answer block.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Camera, clamp01} from '../../common';
import {Tokens} from '../../ui';
import {Diag, ScanLine, exitOp} from './helpers';

const F0 = 743;
const LINES = [760, 660, 420, 240];

export const SC06: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const n = N - F0;
  const out = exitOp(n, 149);
  const lineP = [clamp01(n / 14), clamp01((n - 10) / 16), clamp01((n - 108) / 14), clamp01((n - 108) / 14)];
  const cite = clamp01((n - 108) / 10);
  return (
    <Camera N={N} keys={[{f: F0, cx: 640, cy: 360, s: 1.03}, {f: F0 + 148, cx: 640, cy: 360, s: 1}]}>
      <div style={{position: 'absolute', inset: 0, opacity: out}}>
        {LINES.map((w, i) => (
          <div key={i} style={{position: 'absolute', left: 180, top: 210 + i * 38, width: w * lineP[i], height: 3, background: i === 3 ? Tokens.muted : Tokens.ink}} />
        ))}
        <ScanLine n={n} y0={206} y1={336} x={180} w={780} />
        {[0, 1].map((i) => (
          <div key={'c' + i} style={{position: 'absolute', left: 180 + LINES[i] + 16, top: 202 + i * 38, width: 18, height: 18, background: Tokens.accent, opacity: cite}} />
        ))}
        <Diag x0={180 + LINES[0] + 25} y0={230} x1={700} y1={420} p={cite} color={Tokens.hair} />
        <Diag x0={180 + LINES[1] + 25} y0={270} x1={760} y1={500} p={cite} color={Tokens.hair} />
        <div style={{position: 'absolute', left: 700, top: 420, opacity: cite}}>
          <div style={{fontFamily: Tokens.sans, fontWeight: 700, fontSize: 20, letterSpacing: '0.14em', color: Tokens.muted}}>SOURCE 01</div>
          <div style={{fontFamily: Tokens.sans, fontSize: 22, color: Tokens.ink, marginTop: 6}}>Lewis et al. · NeurIPS 2020</div>
        </div>
        <div style={{position: 'absolute', left: 760, top: 500, opacity: cite}}>
          <div style={{fontFamily: Tokens.sans, fontWeight: 700, fontSize: 20, letterSpacing: '0.14em', color: Tokens.muted}}>SOURCE 02</div>
          <div style={{fontFamily: Tokens.sans, fontSize: 22, color: Tokens.ink, marginTop: 6}}>arxiv.org/abs/2005.11401</div>
        </div>
      </div>
    </Camera>
  );
};
