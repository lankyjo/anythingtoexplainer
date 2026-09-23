// Instrument building blocks: mono-labelled rows, step dots, mono numbers with magnitude bars,
// dial targets, and hairline callouts. Presentational only.
import React from 'react';
import {Tokens} from './tokens';
import {DIAL_CX, DIAL_CY} from './Dial';

// ---------- hairline row / step list ----------
export const HairlineRow: React.FC<{index?: string; label: string; note?: string; active?: boolean; first?: boolean; width?: number}> = ({index, label, note, active = false, first = false, width = 620}) => (
  <div style={{width, display: 'flex', alignItems: 'center', gap: 18, padding: '18px 0', borderTop: first ? 'none' : `1px solid ${Tokens.hair}`}}>
    {index ? <div style={{fontFamily: Tokens.mono, fontSize: 12, width: 26, color: active ? Tokens.accent : Tokens.muted}}>{index}</div> : null}
    <div style={{fontFamily: Tokens.mono, fontSize: 15, letterSpacing: '0.08em', color: active ? Tokens.accent : Tokens.ink}}>{label.toUpperCase()}</div>
    {note ? <div style={{marginLeft: 'auto', fontFamily: Tokens.sans, fontSize: 15, color: Tokens.muted}}>{note}</div> : null}
  </div>
);

export const StepList: React.FC<{steps: Array<{label: string; note?: string; timing?: string}>; active?: number; left?: number; top?: number; width?: number}> = ({steps, active = -1, left = 596, top = 132, width = 620}) => (
  <div style={{position: 'absolute', left, top, width}}>
    {steps.map((s, i) => (
      <div key={s.label} style={{display: 'flex', alignItems: 'center', height: 96}}>
        <div style={{width: 15, height: 15, borderRadius: '50%', background: i === active ? Tokens.accent : 'transparent', border: `1.5px solid ${i === active ? Tokens.accent : Tokens.ink}`}} />
        <div style={{width: 60, height: 1, background: i === steps.length - 1 ? 'transparent' : Tokens.hair}} />
        <div>
          <div style={{fontFamily: Tokens.mono, fontSize: 15, letterSpacing: '0.08em', color: i === active ? Tokens.accent : Tokens.ink}}>{s.label.toUpperCase()}</div>
          <div style={{fontFamily: Tokens.sans, fontSize: 15, color: Tokens.muted}}>{s.note}</div>
        </div>
        {s.timing ? <div style={{marginLeft: 'auto', fontFamily: Tokens.mono, fontSize: 12, color: i === steps.length - 1 ? Tokens.amber : Tokens.muted}}>{s.timing}</div> : null}
      </div>
    ))}
    <div style={{position: 'absolute', left: 7, top: 7, width: 1.5, height: 96 * steps.length - 48, background: Tokens.hair, zIndex: -1}} />
  </div>
);

// ---------- magnitude bars ----------
export const MagBars: React.FC<{values: number[]; left?: number; top?: number; active?: number; w?: number; h?: number}> = ({values, left = 0, top = 0, active = 0, w = 44, h = 6}) => (
  <div style={{position: 'absolute', left, top, display: 'flex', gap: 8}}>
    {values.map((_, i) => (
      <div key={i} style={{width: w, height: h, background: i === active ? Tokens.accent : '#E3DED6'}} />
    ))}
  </div>
);

// ---------- big number ----------
export const BigNumber: React.FC<{value: string; caption?: string; stats?: string; top?: number; size?: number; bars?: boolean}> = ({value, caption, stats, top = 196, size = 150, bars = true}) => (
  <div style={{position: 'absolute', left: 596, top}}>
    <div style={{fontFamily: Tokens.mono, fontWeight: 500, fontSize: size, lineHeight: 1, letterSpacing: '-0.03em', color: Tokens.ink}}>{value}</div>
    {caption ? <div style={{fontFamily: Tokens.sans, fontSize: 22, color: Tokens.muted, marginTop: 18}}>{caption}</div> : null}
    {bars ? <MagBars values={[1, 2, 3]} top={size + 74} /> : null}
    {stats ? <div style={{fontFamily: Tokens.mono, fontSize: 12, color: Tokens.muted, marginTop: bars ? 24 : 16}}>{stats}</div> : null}
  </div>
);

// ---------- dial target ----------
export const RingTarget: React.FC<{cx: number; cy: number; r?: number[]; sweep?: number}> = ({cx, cy, r = [26, 44], sweep = 0}) => (
  <>
    {r.map((rr) => (
      <div key={rr} style={{position: 'absolute', left: cx - rr, top: cy - rr, width: rr * 2, height: rr * 2, borderRadius: '50%', border: `1px solid ${Tokens.ring}`}} />
    ))}
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
    <div style={{position: 'absolute', left: cx - 2, top: cy - 2, width: 4, height: 4, borderRadius: '50%', background: Tokens.ink}} />
  </>
);

// ---------- ranked bar ----------
export const RankedBar: React.FC<{items: Array<{label: string; value: number; display?: string; active?: boolean}>; left?: number; top?: number; width?: number; max?: number}> = ({items, left = 596, top = 200, width = 620, max}) => {
  const m = max ?? Math.max(...items.map((i) => i.value), 1);
  return (
    <div style={{position: 'absolute', left, top, width}}>
      {items.map((it, k) => (
        <div key={it.label} style={{marginTop: k ? 30 : 0}}>
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <div style={{fontFamily: Tokens.mono, fontSize: 12, letterSpacing: '0.08em', color: it.active ? Tokens.accent : Tokens.muted}}>{it.label.toUpperCase()}</div>
            <div style={{fontFamily: Tokens.mono, fontSize: 12, color: it.active ? Tokens.accent : Tokens.muted}}>{it.display ?? String(it.value)}</div>
          </div>
          <div style={{position: 'relative', height: 3, marginTop: 8, background: Tokens.hair}}>
            <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${(it.value / m) * 100}%`, background: it.active ? Tokens.accent : Tokens.ink}} />
          </div>
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
      <circle cx={tx} cy={ty} r={2.5} fill={Tokens.accent} />
    </svg>
    <div style={{position: 'absolute', left: x, top: y - 8, fontFamily: Tokens.mono, fontSize: 11, color: Tokens.muted, whiteSpace: 'nowrap'}}>{text}</div>
  </>
);

export {DIAL_CX, DIAL_CY};
