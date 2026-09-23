// Poster chrome: kicker rail, clean subtitles, blue progress, type-led title, chapter card and
// end credit. Timings come from src/common/chromeSpec.ts; only the drawing differs.
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

// ---------- HUD kicker ----------
export const Hud: React.FC<{N?: number; override?: {left: string; right: string}}> = ({N: NProp, override}) => {
  const live = useCurrentFrame() + 1;
  const N = NProp ?? live;
  const entry = HUD.find((h) => N >= h.from && N <= h.to);
  const ch = [...CHAPTER_STARTS].reverse().find((c) => c.from <= N);
  if (!override && !entry) return null;
  const left = override?.left ?? `${String(ch?.n ?? 1).padStart(2, '0')} · ${(entry?.text ?? '').toUpperCase()}`;
  const right = override?.right ?? `${mmss(N)} / ${mmss(TOTAL_FRAMES)}`;
  return (
    <>
      <div style={{position: 'absolute', left: 96, top: 66, fontFamily: Tokens.sans, fontWeight: 600, fontSize: 13, letterSpacing: '0.3em', color: Tokens.accent}}>{left}</div>
      <div style={{position: 'absolute', right: 96, top: 66, fontFamily: Tokens.sans, fontWeight: 400, fontSize: 13, color: Tokens.muted}}>{right}</div>
    </>
  );
};

// ---------- subtitles ----------
export const SUB_TOP = 637;
export const SubtitleLine: React.FC<{text: string; top?: number}> = ({text, top = SUB_TOP}) => {
  const size = fitSize(text, 1100, 38, 28);
  return (
    <div style={{position: 'absolute', left: 640, top, transform: 'translateX(-50%)', whiteSpace: 'nowrap', fontFamily: Tokens.sans, fontWeight: 500, fontSize: size, letterSpacing: '-0.005em', color: Tokens.ink}}>
      {text}
    </div>
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
  return (
    <>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 6, background: '#E5E0D8'}} />
      <div style={{position: 'absolute', left: 0, bottom: 0, height: 6, width: 1280 * p, background: Tokens.accent}} />
    </>
  );
};

// ---------- title ----------
export const Title: React.FC<{N?: number}> = ({N: NProp}) => {
  const live = useCurrentFrame() + 1;
  const N = NProp ?? live;
  const [a, b] = TITLE_RANGE;
  const inN = clamp01((N - (a + 4)) / 24);
  const outN = clamp01((N - (b - 12)) / 12);
  const dy = (1 - easeOut(inN)) * 30 - easeOut(outN) * 140;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: inN * (1 - outN), transform: `translateY(${dy}px)`}}>
      <div style={{position: 'absolute', left: 96, top: 150, width: 840}}>
        <div style={{fontFamily: Tokens.sans, fontWeight: 600, fontSize: 13, letterSpacing: '0.3em', color: Tokens.accent}}>A FIELD GUIDE</div>
        <div style={{fontFamily: Tokens.sans, fontWeight: 250, fontSize: 124, lineHeight: 0.97, letterSpacing: '-0.035em', color: Tokens.ink, marginTop: 26}}>{VIDEO.title.big}</div>
        {VIDEO.title.rest ? (
          <div style={{fontFamily: Tokens.sans, fontWeight: 450, fontSize: 56, lineHeight: 1.05, letterSpacing: '-0.02em', color: Tokens.accent, marginTop: 4}}>{VIDEO.title.rest}</div>
        ) : null}
      </div>
      <div style={{position: 'absolute', left: 96, top: 560, width: 60, height: 2, background: Tokens.accent}} />
      <div style={{position: 'absolute', left: 96, top: 584, fontFamily: Tokens.sans, fontWeight: 400, fontSize: 23, color: Tokens.muted}}>{VIDEO.title.tagline}</div>
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
  const dy = (1 - easeOut(inN)) * 30 - easeOut(outN) * 140;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: inN * (1 - outN), transform: `translateY(${dy}px)`}}>
      <div style={{position: 'absolute', left: 96, top: 240, width: 1000}}>
        <div style={{fontFamily: Tokens.sans, fontWeight: 600, fontSize: 13, letterSpacing: '0.3em', color: Tokens.accent}}>{`CHAPTER ${String(card.n).padStart(2, '0')}`}</div>
        <div style={{fontFamily: Tokens.sans, fontWeight: 250, fontSize: fitSize(card.title, 1000, 96, 56), lineHeight: 1.0, letterSpacing: '-0.03em', color: Tokens.ink, marginTop: 20}}>{card.title}</div>
        <div style={{width: 120 * clamp01((n - 4) / 16), height: 2, background: Tokens.accent, marginTop: 30}} />
        {card.tech ? <div style={{fontFamily: Tokens.sans, fontWeight: 400, fontSize: 24, color: Tokens.muted, marginTop: 20, opacity: clamp01((n - 10) / 12)}}>{card.tech}</div> : null}
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
      <div style={{position: 'absolute', left: 0, right: 0, top: 296, textAlign: 'center', fontFamily: Tokens.sans, fontWeight: 600, fontSize: 12, letterSpacing: '0.3em', color: Tokens.accent}}>{c.kicker}</div>
      <div style={{position: 'absolute', left: 120, right: 120, top: 336, textAlign: 'center', fontFamily: Tokens.sans, fontWeight: 300, fontSize: 44, lineHeight: 1.15, letterSpacing: '-0.02em', color: Tokens.ink}}>{c.title}</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 466, textAlign: 'center', fontFamily: Tokens.sans, fontWeight: 400, fontSize: 22, color: Tokens.muted}}>{c.byline}</div>
      <div style={{position: 'absolute', left: 640 - 60 * clamp01((N - (a + 6)) / 16), top: 500, width: 120 * clamp01((N - (a + 6)) / 16), height: 2, background: Tokens.accent}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 520, textAlign: 'center', fontFamily: Tokens.sans, fontWeight: 400, fontSize: 19, color: Tokens.muted}}>{c.note}</div>
    </div>
  );
};
