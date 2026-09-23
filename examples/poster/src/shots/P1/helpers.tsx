// Shared drawing helpers for the Paper sample film.
import React from 'react';
import {clamp01} from '../../common';
import {Tokens} from '../../ui';

export const easeOut = (t: number) => 1 - Math.pow(1 - clamp01(t), 2.5);

/** Entrance: fade + rise. Returns {op, dy}. */
export const enter = (n: number, len = 22, d = 26) => {
  const p = clamp01(n / len);
  return {op: p, dy: d * Math.pow(1 - p, 2.5)};
};

/** Exit: fade to zero over the last `len` frames before `to`. */
export const exitOp = (n: number, to: number, len = 8) => 1 - clamp01((n - (to - len)) / len);

export const Wipe: React.FC<{x: number; y: number; w: number; p: number; color?: string; h?: number}> = ({x, y, w, p, color = Tokens.ink, h = 2}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w * p, height: h, background: color}} />
);

export const VLine: React.FC<{x: number; y: number; h: number; p: number; color?: string; w?: number}> = ({x, y, h, p, color = Tokens.ink, w = 1}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h * clamp01(p), background: color}} />
);

export const DotGrid: React.FC<{
  x: number;
  y: number;
  cols: number;
  rows: number;
  pitch?: number;
  size?: number;
  dot: (col: number, row: number) => {op?: number; color?: string};
}> = ({x, y, cols, rows, pitch = 36, size = 6, dot}) => (
  <>
    {Array.from({length: rows * cols}, (_, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const st = dot(col, row);
      return (
        <div
          key={i}
          style={{position: 'absolute', left: x + col * pitch, top: y + row * pitch, width: size, height: size, borderRadius: '50%', background: st.color ?? Tokens.ink, opacity: st.op ?? 1}}
        />
      );
    })}
  </>
);

export const ScanLine: React.FC<{n: number; y0: number; y1: number; x?: number; w?: number; period?: number; op?: number; color?: string}> = ({n, y0, y1, x = 180, w = 920, period = 80, op = 0.45, color = Tokens.ink}) => {
  const p = (Math.sin((n / period) * Math.PI * 2) + 1) / 2;
  return <div style={{position: 'absolute', left: x, top: y0 + (y1 - y0) * p, width: w, height: 3, background: color, opacity: op}} />;
};

/** Diagonal hairline that draws from (x0,y0) to (x1,y1) with progress p. */
export const Diag: React.FC<{x0: number; y0: number; x1: number; y1: number; p: number; color?: string; w?: number}> = ({x0, y0, x1, y1, p, color = Tokens.ink, w = 1}) => {
  const L = Math.hypot(x1 - x0, y1 - y0);
  return (
    <svg width={1280} height={720} style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none'}}>
      <line x1={x0} y1={y0} x2={x1} y2={y1} stroke={color} strokeWidth={w} strokeDasharray={L} strokeDashoffset={L * (1 - clamp01(p))} />
    </svg>
  );
};

/** Zigzag hairline with a draw-on progress p and a travelling phase for sustained motion. */
export const Zigzag: React.FC<{x: number; y: number; w: number; amp: number; segs: number; p: number; phase?: number; color?: string}> = ({x, y, w, amp, segs, p, phase = 0, color = Tokens.accent}) => {
  const pts: string[] = [];
  for (let i = 0; i <= segs; i++) {
    const px = x + (w * i) / segs;
    const py = y + (i % 2 ? -amp : amp) + Math.sin(phase + i) * 3;
    pts.push(`${px},${py}`);
  }
  return (
    <svg width={1280} height={720} style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none'}}>
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth={2} strokeDasharray={2400} strokeDashoffset={2400 * (1 - clamp01(p))} />
    </svg>
  );
};
