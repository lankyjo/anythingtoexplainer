// SC03: RAG arrives - rings settle, the word lands, the accent rule wipes. Hero: the outer ring + RAG.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Camera, clamp01} from '../../common';
import {RingTarget, Tokens} from '../../ui';
import {ScanLine, enter, exitOp} from './helpers';

const F0 = 324;

export const SC03: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const n = N - F0;
  const out = exitOp(n, 129);
  const word = enter(n - 8, 24, 30);
  const rule = clamp01((n - 70) / 14);
  return (
    <Camera N={N} keys={[{f: F0, cx: 640, cy: 380, s: 1}, {f: F0 + 128, cx: 640, cy: 380, s: 1.05}]}>
      <div style={{position: 'absolute', inset: 0, opacity: out, transform: `scale(${0.9 + 0.1 * clamp01(n / 26)})`, transformOrigin: '640px 380px'}}>
        <RingTarget cx={640} cy={380} r={[110, 175, 240]} dot="none" />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 330 + word.dy, textAlign: 'center', fontFamily: Tokens.sans, fontWeight: 500, fontSize: 150, letterSpacing: '-0.03em', color: Tokens.ink, opacity: word.op * out}}>
        RAG
      </div>
<ScanLine n={n} y0={270} y1={500} x={240} w={800} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 494, textAlign: 'center', opacity: clamp01((n - 70) / 14) * out}}>
        <div style={{width: 160 * rule, height: 3, background: Tokens.accent, margin: '0 auto'}} />
        <div style={{marginTop: 22, fontFamily: Tokens.sans, fontSize: 24, color: Tokens.muted}}>an open book</div>
      </div>
    </Camera>
  );
};
