// Paper building blocks for shot authors: hairline rows, big light numbers, ring targets, ranked
// bars and leader-line labels. Presentational only - shots pass positions and animate around them.
import React from 'react';
import {Tokens} from './tokens';

// ---------- hairline row / step list ----------
export const HairlineRow: React.FC<{index?: string; label: string; note?: string; active?: boolean; first?: boolean; width?: number}> = ({index, label, note, active = false, first = false, width = 920}) => (
  <div style={{width, display: 'flex', alignItems: 'baseline', gap: 22, padding: '19px 0', borderTop: first ? 'none' : `1px solid ${Tokens.hair}`}}>
    {index ? <div style={{fontFamily: Tokens.sans, fontWeight: 700, fontSize: 15, width: 30, color: active ? Tokens.accent : Tokens.muted}}>{index}</div> : null}
    <div style={{fontFamily: Tokens.sans, fontWeight: active ? 600 : 400, fontSize: 36, letterSpacing: '-0.01em', color: active ? Tokens.accent : Tokens.ink}}>{label}</div>
    {note ? <div style={{marginLeft: 'auto', fontFamily: Tokens.sans, fontWeight: 400, fontSize: 19, color: Tokens.muted}}>{note}</div> : null}
  </div>
);

export const StepList: React.FC<{steps: Array<{label: string; note?: string}>; active?: number; left?: number; top?: number; width?: number}> = ({steps, active = -1, left = 180, top = 180, width = 920}) => (
  <div style={{position: 'absolute', left, top, width}}>
    {steps.map((s, i) => (
      <HairlineRow key={s.label} index={String(i + 1).padStart(2, '0')} label={s.label} note={s.note} active={i === active} first={i === 0} width={width} />
    ))}
  </div>
);

// ---------- big light number ----------
export const BigNumber: React.FC<{value: string; unit?: string; caption?: string; top?: number; size?: number; rule?: boolean}> = ({value, unit, caption, top = 196, size = 196, rule = true}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top, textAlign: 'center'}}>
    <div style={{fontFamily: Tokens.sans, fontWeight: 300, fontSize: size, lineHeight: 1, letterSpacing: '-0.045em', color: Tokens.ink}}>
      {value}
      {unit ? <span style={{color: Tokens.accent, fontWeight: 400}}>{unit}</span> : null}
    </div>
    {caption ? <div style={{fontFamily: Tokens.sans, fontWeight: 400, fontSize: 24, color: Tokens.muted, marginTop: 26}}>{caption}</div> : null}
    {rule ? <div style={{width: 120, height: 2, background: Tokens.accent, margin: '30px auto 0'}} /> : null}
  </div>
);

// ---------- ring target ----------
export const RingTarget: React.FC<{cx: number; cy: number; r?: number[]; dot?: 'ring' | 'accent' | 'none'}> = ({cx, cy, r = [60, 110, 160], dot = 'ring'}) => (
  <>
    {r.map((rr) => (
      <div key={rr} style={{position: 'absolute', left: cx - rr, top: cy - rr, width: rr * 2, height: rr * 2, borderRadius: '50%', border: `1px solid ${Tokens.ring}`}} />
    ))}
    {dot !== 'none' ? <div style={{position: 'absolute', left: cx - 5, top: cy - 5, width: 10, height: 10, borderRadius: '50%', background: dot === 'accent' ? Tokens.accent : Tokens.ring}} /> : null}
  </>
);

// ---------- ranked bar ----------
export const RankedBar: React.FC<{items: Array<{label: string; value: number; display?: string; accent?: boolean}>; left?: number; top?: number; width?: number; max?: number}> = ({items, left = 180, top = 200, width = 760, max}) => {
  const m = max ?? Math.max(...items.map((i) => i.value), 1);
  return (
    <div style={{position: 'absolute', left, top, width}}>
      {items.map((it, k) => (
        <div key={it.label} style={{marginTop: k ? 34 : 0}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
            <div style={{fontFamily: Tokens.sans, fontWeight: it.accent ? 600 : 400, fontSize: 19, color: it.accent ? Tokens.accent : Tokens.muted}}>{it.label}</div>
            <div style={{fontFamily: Tokens.sans, fontWeight: it.accent ? 600 : 400, fontSize: 19, color: it.accent ? Tokens.accent : Tokens.muted}}>{it.display ?? String(it.value)}</div>
          </div>
          <div style={{position: 'relative', height: 4, marginTop: 10, background: Tokens.hair}}>
            <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${(it.value / m) * 100}%`, background: it.accent ? Tokens.accent : Tokens.ink}} />
          </div>
        </div>
      ))}
    </div>
  );
};

// ---------- leader-line label ----------
export const LeaderLabel: React.FC<{x: number; y: number; tx: number; ty: number; text: string; anchor?: 'start' | 'end'}> = ({x, y, tx, ty, text, anchor = 'start'}) => (
  <>
    <svg width={1280} height={720} style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none'}}>
      <line x1={x} y1={y} x2={tx} y2={ty} stroke={Tokens.hair} strokeWidth={1} />
      <circle cx={tx} cy={ty} r={3} fill={Tokens.accent} />
    </svg>
    <div style={{position: 'absolute', left: x, top: y - 8, transform: anchor === 'end' ? 'translateX(-100%)' : 'translateX(10px)', fontFamily: Tokens.sans, fontWeight: 400, fontSize: 16, color: Tokens.muted, whiteSpace: 'nowrap'}}>{text}</div>
  </>
);
