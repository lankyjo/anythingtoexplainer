// Instrument chrome: mono rail HUD, hairline + sans subtitles, segmented progress, title, chapter
// card and end credit. Timings come from src/common/chromeSpec.ts; only the drawing differs.
import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {clamp01, fitSize, TOTAL_FRAMES, CHAPTER_STARTS} from '../../common';
import {SUBS} from '../../common/subs';
import {TITLE_RANGE, END_CREDIT_RANGE, HUD} from '../../common/chromeSpec';
import type {ChapterCardSpec} from '../../common/chromeSpec';
import {VIDEO} from '../../config';
import {Tokens} from './tokens';

const easeOut = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);
const mmss = (f: number) => {
  const s = Math.max(0, Math.round(f / 30));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

// ---------- HUD rail ----------
export const Hud: React.FC<{N?: number; override?: {left: string; right: string}}> = ({N: NProp, override}) => {
  const live = useCurrentFrame() + 1;
  const N = NProp ?? live;
  const entry = HUD.find((h) => N >= h.from && N <= h.to);
  const ch = [...CHAPTER_STARTS].reverse().find((c) => c.from <= N);
  if (!override && !entry) return null;
  const left = override?.left ?? `CH.${String(ch?.n ?? 1).padStart(2, '0')} — ${(entry?.text ?? '').toUpperCase()}`;
  const right = override?.right ?? `${mmss(N)} / ${mmss(TOTAL_FRAMES)}`;
  return (
    <>
      <div style={{position: 'absolute', left: 60, right: 60, top: 32, display: 'flex', justifyContent: 'space-between'}}>
        <div style={{fontFamily: Tokens.mono, fontSize: 13, letterSpacing: '0.12em', color: Tokens.ink}}>{left}</div>
        <div style={{fontFamily: Tokens.mono, fontSize: 13, color: Tokens.muted}}>{right}</div>
      </div>
      <div style={{position: 'absolute', left: 60, right: 60, top: 58, height: 1, background: Tokens.hair}} />
    </>
  );
};

// ---------- subtitles ----------
export const SUB_TOP = 637;
export const SubtitleLine: React.FC<{text: string; top?: number}> = ({text, top = SUB_TOP}) => {
  const size = fitSize(text, 1160, 37, 28);
  return (
    <>
      <div style={{position: 'absolute', left: 80, right: 80, top: top - 14, height: 1, background: Tokens.hair}} />
      <div style={{position: 'absolute', left: 640, top, transform: 'translateX(-50%)', whiteSpace: 'nowrap', fontFamily: Tokens.sans, fontWeight: 500, fontSize: size, color: Tokens.ink}}>
        {text}
      </div>
    </>
  );
};
export const Subtitles: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    {SUBS.map((s, k) => (
      <Sequence key={k} from={s.from - 1} durationInFrames={Math.max(1, s.to - s.from + 1)}>
        <SubtitleLine text={s.text} />
      </Sequence>
    ))}
  </AbsoluteFill>
);

// ---------- progress ----------
export const Progress: React.FC<{N?: number}> = ({N: NProp}) => {
  const live = useCurrentFrame() + 1;
  const N = NProp ?? live;
  const p = clamp01(N / TOTAL_FRAMES);
  const chs = CHAPTER_STARTS;
  const cur = [...chs].reverse().find((c) => c.from <= N);
  const curIdx = cur ? chs.findIndex((c) => c.n === cur.n) : -1;
  const segFrom = cur ? (cur.from - 1) / TOTAL_FRAMES : 0;
  const segTo = curIdx >= 0 ? (curIdx + 1 < chs.length ? (chs[curIdx + 1].from - 1) / TOTAL_FRAMES : 1) : 0;
  return (
    <>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 5, background: '#E3DED6'}} />
      <div style={{position: 'absolute', left: 0, bottom: 0, height: 5, width: 1280 * p, background: Tokens.ink}} />
      {cur ? <div style={{position: 'absolute', left: 1280 * segFrom, bottom: 0, height: 5, width: 1280 * (segTo - segFrom), background: Tokens.accent, opacity: 0.9}} /> : null}
      {chs.map((c, i) => (
        <div key={c.n} style={{position: 'absolute', left: 60 + (i * 1160) / Math.max(1, chs.length), bottom: 10, fontFamily: Tokens.mono, fontSize: 10, color: i === curIdx ? Tokens.accent : Tokens.muted}}>
          {String(c.n).padStart(2, '0')}
        </div>
      ))}
    </>
  );
};

// ---------- title ----------
export const Title: React.FC<{N?: number}> = ({N: NProp}) => {
  const live = useCurrentFrame() + 1;
  const N = NProp ?? live;
  const [a, b] = TITLE_RANGE;
  const inN = clamp01((N - (a + 4)) / 22);
  const outN = clamp01((N - (b - 12)) / 12);
  const dy = (1 - easeOut(inN)) * 26 - easeOut(outN) * 130;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: inN * (1 - outN), transform: `translateY(${dy}px)`}}>
      <div style={{position: 'absolute', left: 596, top: 200, width: 620}}>
        <div style={{fontFamily: Tokens.mono, fontSize: 13, letterSpacing: '0.14em', color: Tokens.accent}}>EXPLAINER / 01</div>
        <div style={{fontFamily: Tokens.sans, fontWeight: 500, fontSize: 66, lineHeight: 1.06, letterSpacing: '-0.015em', color: Tokens.ink, marginTop: 18}}>{VIDEO.title.en}</div>
        <div style={{height: 1, background: Tokens.hair, margin: '26px 0 14px'}} />
        <div style={{fontFamily: Tokens.mono, fontSize: 13, color: Tokens.muted}}>{VIDEO.title.big.toLowerCase()} · chunking · reranking · evaluation</div>
        <div style={{fontFamily: Tokens.sans, fontWeight: 400, fontSize: 22, color: Tokens.muted, marginTop: 22}}>{VIDEO.title.tagline}</div>
      </div>
    </div>
  );
};

// ---------- chapter card ----------
export const ChapterCard: React.FC<{card: ChapterCardSpec; N?: number}> = ({card, N: NProp}) => {
  const live = useCurrentFrame() + 1;
  const N = NProp ?? live;
  if (N < card.from || N > card.to) return null;
  const n = N - card.from;
  const inN = clamp01(n / 14);
  const outN = clamp01((N - (card.to - 12)) / 12);
  const dy = (1 - easeOut(inN)) * 26 - easeOut(outN) * 130;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: inN * (1 - outN), transform: `translateY(${dy}px)`}}>
      <div style={{position: 'absolute', left: 596, top: 264, width: 620}}>
        <div style={{fontFamily: Tokens.mono, fontSize: 13, letterSpacing: '0.14em', color: Tokens.accent}}>{`CHAPTER ${String(card.n).padStart(2, '0')}`}</div>
        <div style={{fontFamily: Tokens.sans, fontWeight: 500, fontSize: fitSize(card.title, 620, 62, 44), lineHeight: 1.05, letterSpacing: '-0.02em', color: Tokens.ink, marginTop: 16}}>{card.title}</div>
        <div style={{height: 1, background: Tokens.hair, margin: '24px 0 14px', transform: `scaleX(${clamp01((n - 4) / 16)})`, transformOrigin: '0 50%'}} />
        {card.tech ? <div style={{fontFamily: Tokens.mono, fontSize: 13, color: Tokens.muted, opacity: clamp01((n - 10) / 12)}}>{card.tech}</div> : null}
      </div>
    </div>
  );
};

// ---------- end credit ----------
export const EndCredit: React.FC<{N?: number}> = ({N: NProp}) => {
  const live = useCurrentFrame() + 1;
  const N = NProp ?? live;
  const [a, b] = END_CREDIT_RANGE;
  const c = VIDEO.credit;
  if (!c || N < a || N > b) return null;
  const op = Math.min(clamp01((N - a) / 8), 1 - clamp01((N - (b - 8)) / 8));
  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 290, textAlign: 'center', fontFamily: Tokens.mono, fontSize: 12, letterSpacing: '0.16em', color: Tokens.muted}}>{c.kicker}</div>
      <div style={{position: 'absolute', left: 140, right: 140, top: 330, textAlign: 'center', fontFamily: Tokens.sans, fontWeight: 500, fontSize: 38, lineHeight: 1.2, color: Tokens.ink}}>{c.title}</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 452, textAlign: 'center', fontFamily: Tokens.mono, fontSize: 13, color: Tokens.muted}}>{c.byline}</div>
      <div style={{position: 'absolute', left: 640 - 80 * clamp01((N - (a + 6)) / 16), top: 486, width: 160 * clamp01((N - (a + 6)) / 16), height: 1, background: Tokens.hair}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 508, textAlign: 'center', fontFamily: Tokens.mono, fontSize: 12, color: Tokens.muted}}>{c.note}</div>
    </div>
  );
};
