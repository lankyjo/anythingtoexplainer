// Recognisable objects drawn in code. These are the *shape* language: a band arc, two cups, a
// capsule, a grille - the two or three details that make the object identifiable. Colours are
// passed in so every pack can use them.
import React from 'react';

type IconProps = {x: number; y: number; s?: number; color: string; accent: string; op?: number; rot?: number};

const frame = (s: number, w: number, h: number, x: number, y: number, op: number, rot: number) => ({
  width: w * s,
  height: h * s,
  style: {position: 'absolute', left: x, top: y, opacity: op, transform: rot ? `rotate(${rot}deg)` : undefined, transformOrigin: '50% 50%', pointerEvents: 'none'} as React.CSSProperties,
  viewBox: `0 0 ${w} ${h}`,
});

/** Over-ear headphones: band, two cups, two pads, one status light. */
export const Headphones: React.FC<IconProps> = ({x, y, s = 1, color, accent, op = 1, rot = 0}) => (
  <svg {...frame(s, 200, 170, x, y, op, rot)}>
    <path d="M 34 86 C 34 24, 166 24, 166 86" fill="none" stroke={color} strokeWidth={13} strokeLinecap="round" />
    <rect x={12} y={76} width={46} height={72} rx={22} fill="none" stroke={color} strokeWidth={3} />
    <rect x={142} y={76} width={46} height={72} rx={22} fill="none" stroke={color} strokeWidth={3} />
    <rect x={20} y={84} width={30} height={56} rx={15} fill="none" stroke={color} strokeWidth={1.5} opacity={0.45} />
    <rect x={150} y={84} width={30} height={56} rx={15} fill="none" stroke={color} strokeWidth={1.5} opacity={0.45} />
    <circle cx={165} cy={122} r={4} fill={accent} />
  </svg>
);

/** A studio microphone: capsule, grille, basket, stem, base, cable. */
export const Mic: React.FC<IconProps> = ({x, y, s = 1, color, accent, op = 1, rot = 0}) => (
  <svg {...frame(s, 200, 200, x, y, op, rot)}>
    <rect x={68} y={12} width={64} height={112} rx={32} fill="none" stroke={color} strokeWidth={3} />
    <line x1={84} y1={28} x2={84} y2={94} stroke={color} strokeWidth={1.5} opacity={0.4} />
    <line x1={100} y1={28} x2={100} y2={94} stroke={color} strokeWidth={1.5} opacity={0.4} />
    <line x1={116} y1={28} x2={116} y2={94} stroke={color} strokeWidth={1.5} opacity={0.4} />
    <path d="M 56 52 C 56 124, 144 124, 144 52" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" />
    <line x1={100} y1={126} x2={100} y2={156} stroke={color} strokeWidth={4} />
    <line x1={72} y1={158} x2={128} y2={158} stroke={color} strokeWidth={4} strokeLinecap="round" />
    <path d="M 128 158 C 150 158, 150 176, 150 190" fill="none" stroke={color} strokeWidth={2} opacity={0.5} />
    <circle cx={100} cy={106} r={4} fill={accent} />
  </svg>
);

/** A plain head-and-shoulders figure, useful as the wearer of a pair of headphones. */
export const Person: React.FC<IconProps> = ({x, y, s = 1, color, accent, op = 1, rot = 0}) => (
  <svg {...frame(s, 140, 200, x, y, op, rot)}>
    <circle cx={70} cy={54} r={38} fill="none" stroke={color} strokeWidth={3} />
    <path d="M 12 190 C 12 130, 128 130, 128 190" fill="none" stroke={color} strokeWidth={3} />
    <circle cx={70} cy={54} r={5} fill={accent} />
  </svg>
);
