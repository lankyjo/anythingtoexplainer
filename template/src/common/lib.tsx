import React from 'react';
import {AbsoluteFill} from 'remotion';

// Canvas and frame convention: 1280x720 at 30 fps; frame numbers start at 1 (N = useCurrentFrame() + F0).
export const W = 1280;
export const H = 720;
export const FPS = 30;

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
export const lerp = (t: number, t0: number, t1: number, v0: number, v1: number) => {
  if (t1 === t0) return v1;
  return v0 + (v1 - v0) * clamp((t - t0) / (t1 - t0), 0, 1);
};
/** Piecewise-linear keyframes [frame, value][]. First-value trap: below the first key it returns the first value, not zero. */
export const keyframes = (t: number, kf: Array<[number, number]>) => {
  if (t <= kf[0][0]) return kf[0][1];
  for (let i = 1; i < kf.length; i++) if (t <= kf[i][0]) return lerp(t, kf[i - 1][0], kf[i][0], kf[i - 1][1], kf[i][1]);
  return kf[kf.length - 1][1];
};
export const stepHold = (t: number, kf: Array<[number, number]>) => {
  if (t < kf[0][0]) return 0;
  for (let i = kf.length - 1; i >= 0; i--) if (t >= kf[i][0]) return kf[i][1];
  return 0;
};

// ---- directional blur (SVG feGaussianBlur; sigma below 0.8 has no effect in Chromium; feConvolveMatrix is banned) ----
let blurSeq = 0;
export const DirBlur: React.FC<{bx: number; by: number; style?: React.CSSProperties; children: React.ReactNode}> = ({bx, by, style, children}) => {
  const idRef = React.useRef<string | undefined>(undefined);
  if (!idRef.current) idRef.current = `dirblur-${blurSeq++}`;
  const id = idRef.current;
  const active = bx > 0.05 || by > 0.05;
  return (
    <AbsoluteFill style={style}>
      {active ? (
        <svg width={0} height={0} style={{position: 'absolute'}}>
          <defs>
            <filter id={id} x="-60%" y="-60%" width="220%" height="220%" colorInterpolationFilters="sRGB">
              <feGaussianBlur stdDeviation={`${Math.max(0, bx)} ${Math.max(0, by)}`} />
            </filter>
          </defs>
        </svg>
      ) : null}
      <AbsoluteFill style={{filter: active ? `url(#${id})` : undefined}}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};
