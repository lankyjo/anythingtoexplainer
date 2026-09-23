// SC04: index - a document splits into chunks, each chunk becomes vectors. Hero: the document (380 tall).
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Camera, clamp01} from '../../common';
import {Tokens} from '../../ui';
import {ScanLine, VLine, exitOp} from './helpers';

const F0 = 499;
const LINES = [200, 230, 180, 210, 160, 190];

export const SC04: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const n = N - F0;
  const out = exitOp(n, 140);
  const docOp = clamp01((n - 2) / 14) * (1 - 0.55 * clamp01((n - 35) / 16));
  const cut = clamp01((n - 35) / 10);
  return (
    <Camera N={N} keys={[{f: F0, cx: 640, cy: 360, s: 1}, {f: F0 + 139, cx: 560, cy: 380, s: 1.04}]}>
      <div style={{position: 'absolute', inset: 0, opacity: out}}>
        <div style={{position: 'absolute', left: 180, top: 170, width: 300, height: 380, border: `1px solid ${Tokens.hair}`, opacity: docOp}}>
          {LINES.map((w, i) => (
            <div key={i} style={{position: 'absolute', left: 26, top: 40 + i * 54, width: w, height: 3, background: Tokens.ink, opacity: 0.5}} />
          ))}
        </div>
        <VLine x={490} y={170} h={380} p={cut} color={Tokens.accent} />
        {[0, 1, 2].map((i) => {
          const slide = clamp01((n - (38 + i * 4)) / 16);
          const dx = Math.pow(1 - Math.pow(1 - slide, 2.5), 1) * 380;
          return (
            <div key={i} style={{position: 'absolute', left: 180 + dx, top: 190 + i * 100, width: 470, height: 78, borderTop: `1px solid ${Tokens.hair}`, borderBottom: `1px solid ${Tokens.hair}`, opacity: slide}}>
              <div style={{position: 'absolute', left: 0, top: 22, width: 300, height: 3, background: Tokens.ink}} />
              <div style={{position: 'absolute', left: 0, top: 44, width: 220, height: 3, background: Tokens.muted, opacity: 0.55}} />
              <div style={{position: 'absolute', left: 330, top: 37, display: 'flex', gap: 10}}>
                {Array.from({length: 8}, (_, k) => (
                  <div key={k} style={{width: 6, height: 6, borderRadius: '50%', background: Tokens.ink, opacity: clamp01((n - 91 - k * 1.2 - i * 2) / 6)}} />
                ))}
              </div>
            </div>
          );
        })}
        <ScanLine n={n} y0={200} y1={460} x={560} w={470} />
        <div style={{position: 'absolute', left: 560, top: 512, fontFamily: Tokens.sans, fontSize: 22, color: Tokens.muted, opacity: clamp01((n - 96) / 12) * out}}>stored as vectors</div>
      </div>
    </Camera>
  );
};
