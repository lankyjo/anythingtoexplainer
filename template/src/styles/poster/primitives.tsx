// Poster building blocks: type-led rows, a very large light number, comparison bars, local arcs and
// thin callouts. Presentational only.
import React from 'react';
import {Tokens} from './tokens';

// ---------- hairline row / step list ----------
export const HairlineRow: React.FC<{index?: string; label: string; note?: string; active?: boolean; first?: boolean; width?: number}> = ({index, label, note, active = false, first = false, width = 900}) => (
  <div style={{width, display: 'flex', alignItems: 'baseline', gap: 20, padding: '16px 0', borderTop: first ? 'none' : `1px solid ${Tokens.hair}`}}>
    {index ? <div style={{fontFamily: Tokens.sans, fontWeight: 500, fontSize: 15, width: 30, color: active ? Tokens.accent : Tokens.muted}}>{index}</div> : null}
    <div style={{fontFamily: Tokens.sans, fontWeight: active ? 600 : 400, fontSize: 34, letterSpacing: '-0.02em', color: active ? Tokens.accent : Tokens.ink}}>{label}</div>
    {note ? <div style={{marginLeft: 'auto', fontFamily: Tokens.sans, fontWeight: 400, fontSize: 18, color: Tokens.muted}}>{note}</div> : null}
  </div>
);

/** A single line of words, the poster way to show steps: space and weight, no boxes. */
export const StepList: React.FC<{steps: string[]; active?: number; left?: number; top?: number; size?: number}> = ({steps, active = -1, left = 96, top = 430, size = 20}) => (
  <div style={{position: 'absolute', left, top, display: 'flex', gap: 26}}>
    {steps.map((s, i) => (
      <div key={s} style={{fontFamily: Tokens.sans, fontWeight: i === active ? 600 : 400, fontSize: size, color: i === active ? Tokens.accent : Tokens.muted}}>{s}</div>
    ))}
  </div>
);

// ---------- big light number ----------
export const BigNumber: React.FC<{value: string; caption?: string; top?: number; size?: number; compare?: Array<{label: string; w: number; active?: boolean}>}> = ({value, caption, top = 170, size = 210, compare}) => (
  <div style={{position: 'absolute', left: 110, top}}>
    <div style={{fontFamily: Tokens.sans, fontWeight: 200, fontSize: size, lineHeight: 1, letterSpacing: '-0.05em', color: Tokens.ink}}>{value}</div>
    {caption ? <div style={{fontFamily: Tokens.sans, fontWeight: 400, fontSize: 26, color: Tokens.muted, marginTop: 20, width: 430}}>{caption}</div> : null}
    {compare
      ? compare.map((c, i) => (
          <div key={c.label} style={{display: 'flex', gap: 12, alignItems: 'baseline', marginTop: i === 0 ? 34 : 12}}>
            <div style={{width: c.w, height: 8, background: c.active ? Tokens.accent : Tokens.hair}} />
            <div style={{fontFamily: Tokens.sans, fontWeight: c.active ? 500 : 400, fontSize: 18, color: c.active ? Tokens.ink : Tokens.muted}}>{c.label}</div>
          </div>
        ))
      : null}
  </div>
);

// ---------- local arcs / ring target ----------
export const RingTarget: React.FC<{cx: number; cy: number; r?: number[]; filled?: boolean; dot?: 'ring' | 'accent' | 'none'; sweep?: number}> = ({cx, cy, r = [40, 72], filled = false, dot = 'accent', sweep = 0}) => (
  <>
    {r.map((rr, i) => (
      <div key={rr} style={{position: 'absolute', left: cx - rr, top: cy - rr, width: rr * 2, height: rr * 2, borderRadius: '50%', border: `2px solid rgba(29,63,191,${0.6 - i * 0.18})`}} />
    ))}
    {filled ? <div style={{position: 'absolute', left: cx - 20, top: cy - 20, width: 40, height: 40, borderRadius: '50%', background: Tokens.accent}} /> : null}
    {sweep > 0 ? (
      <div
        style={{
          position: 'absolute', left: cx - r[r.length - 1], top: cy - r[r.length - 1], width: r[r.length - 1] * 2, height: r[r.length - 1] * 2, borderRadius: '50%',
          background: `conic-gradient(${Tokens.accent} ${Math.min(1, sweep) * 360}deg, transparent 0deg)`,
          mask: `radial-gradient(circle, transparent ${r[0] - 2}px, #000 ${r[0] - 1}px, #000 ${r[r.length - 1] - 2}px, transparent ${r[r.length - 1] - 1}px)`,
          WebkitMask: `radial-gradient(circle, transparent ${r[0] - 2}px, #000 ${r[0] - 1}px, #000 ${r[r.length - 1] - 2}px, transparent ${r[r.length - 1] - 1}px)`,
          opacity: 0.85,
        }}
      />
    ) : null}
    {dot === 'none' ? null : <div style={{position: 'absolute', left: cx - 4, top: cy - 4, width: 8, height: 8, borderRadius: '50%', background: dot === 'ring' ? Tokens.hair : Tokens.accent}} />}
  </>
);

// ---------- comparison bars ----------
export const RankedBar: React.FC<{items: Array<{label: string; value: number; active?: boolean}>; left?: number; top?: number; width?: number; max?: number}> = ({items, left = 96, top = 430, width = 700, max}) => {
  const m = max ?? Math.max(...items.map((i) => i.value), 1);
  return (
    <div style={{position: 'absolute', left, top, width}}>
      {items.map((it, k) => (
        <div key={it.label} style={{display: 'flex', gap: 14, alignItems: 'center', marginTop: k ? 14 : 0}}>
          <div style={{width: `${(it.value / m) * 62}%`, height: 8, background: it.active ? Tokens.accent : Tokens.hair}} />
          <div style={{fontFamily: Tokens.sans, fontWeight: it.active ? 500 : 400, fontSize: 18, color: it.active ? Tokens.ink : Tokens.muted}}>{it.label}</div>
        </div>
      ))}
    </div>
  );
};

// ---------- leader-line label ----------
export const LeaderLabel: React.FC<{x: number; y: number; tx: number; ty: number; text: string}> = ({x, y, tx, ty, text}) => (
  <>
    <svg width={1280} height={720} style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none'}}>
      <line x1={x} y1={y} x2={tx} y2={ty} stroke={Tokens.hair} strokeWidth={1} />
      <circle cx={tx} cy={ty} r={3} fill={Tokens.accent} />
    </svg>
    <div style={{position: 'absolute', left: x, top: y - 10, fontFamily: Tokens.sans, fontWeight: 400, fontSize: 18, color: Tokens.muted, whiteSpace: 'nowrap'}}>{text}</div>
  </>
);
