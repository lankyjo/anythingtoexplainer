// Whole-frame camera moves: a push, pull or pan that holds one screen point fixed.
// Keys interpolate linearly: {f, cx, cy, s} where cx/cy is the held point and s the scale.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {kf} from './easing';

export type CamKey = {f: number; cx: number; cy: number; s: number};

export const Camera: React.FC<{N: number; keys: CamKey[]; children: React.ReactNode}> = ({N, keys, children}) => {
  const cx = kf(N, keys.map((k) => [k.f, k.cx] as [number, number]));
  const cy = kf(N, keys.map((k) => [k.f, k.cy] as [number, number]));
  const s = kf(N, keys.map((k) => [k.f, k.s] as [number, number]));
  return (
    <AbsoluteFill style={{transform: `translate(${cx * (1 - s)}px, ${cy * (1 - s)}px) scale(${s})`, transformOrigin: '0 0'}}>
      {children}
    </AbsoluteFill>
  );
};
