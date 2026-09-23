// Paper chrome: HUD, subtitle band, progress bar, title / chapter / credit cards.
// Timings come from src/common/chromeSpec.ts (shared with every pack); only the drawing differs.
// Every component takes an optional absolute frame N for stills; the film uses the live frame.
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

const Kicker: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <div style={{fontFamily: Tokens.sans, fontWeight: 700, fontSize: 14, letterSpacing: '0.2em', color: Tokens.muted, ...style}}>{children}</div>
);

// ---------- HUD ----------
export const PaperHud: React.FC<{N?: number; override?: {left: string; right: string}}> = ({N: NProp, override}) => {
  const live = useCurrentFrame() + 1;
  const N = NProp ?? live;
  const entry = HUD.find((h) => N >= h.from && N <= h.to);
  const ch = [...CHAPTER_STARTS].reverse().find((c) => c.from <= N);
  const left = override?.left ?? `${ch ? String(ch.n).padStart(2, '0') : '01'} · ${(entry?.text ?? '').toUpperCase()}`;
  const right = override?.right ?? `${mmss(N)} / ${mmss(TOTAL_FRAMES)}`;
  if (!override && !entry) return null;
  return (
    <>
      <div style={{position: 'absolute', left: 60, right: 60, top: 34, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
        <div style={{fontFamily: Tokens.sans, fontWeight: 700, fontSize: 14, letterSpacing: '0.18em', color: Tokens.ink}}>{left}</div>
        <div style={{fontFamily: Tokens.sans, fontWeight: 400, fontSize: 14, letterSpacing: '0.06em', color: Tokens.muted}}>{right}</div>
      </div>
      <div style={{position: 'absolute', left: 60, right: 60, top: 66, height: 1, background: Tokens.hair}} />
    </>
  );
};

// ---------- subtitles ----------
export const SUB_TOP = 637; // same band as the classic chrome: ink sits at y644-684
export const PaperSubtitleLine: React.FC<{text: string; top?: number}> = ({text, top = SUB_TOP}) => {
  const size = fitSize(text, 1160, 38, 28);
  return (
    <div style={{position: 'absolute', left: 640, top, transform: 'translateX(-50%)', whiteSpace: 'nowrap', fontFamily: Tokens.sans, fontWeight: 600, fontSize: size, letterSpacing: '-0.01em', color: Tokens.ink}}>
      {text}
    </div>
  );
};
export const PaperSubtitles: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    {SUBS.map((s, k) => (
      <Sequence key={k} from={s.from - 1} durationInFrames={Math.max(1, s.to - s.from + 1)}>
        <PaperSubtitleLine text={s.text} />
      </Sequence>
    ))}
  </AbsoluteFill>
);

// ---------- progress bar ----------
export const PaperProgress: React.FC<{N?: number}> = ({N: NProp}) => {
  const live = useCurrentFrame() + 1;
  const N = NProp ?? live;
  const p = clamp01(N / TOTAL_FRAMES);
  return (
    <>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 4, background: Tokens.hair}} />
      <div style={{position: 'absolute', left: 0, bottom: 0, height: 4, width: 1280 * p, background: Tokens.ink}} />
      <div style={{position: 'absolute', left: 1280 * p - 1, bottom: 0, height: 4, width: 2, background: Tokens.accent}} />
    </>
  );
};

// ---------- title ----------
export const PaperTitle: React.FC<{N?: number}> = ({N: NProp}) => {
  const live = useCurrentFrame() + 1;
  const N = NProp ?? live;
  const [a, b] = TITLE_RANGE;
  const inN = clamp01((N - (a + 4)) / 22);
  const outN = clamp01((N - (b - 12)) / 12);
  const dy = (1 - easeOut(inN)) * 26 - easeOut(outN) * 130;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: inN * (1 - outN), transform: `translateY(${dy}px)`}}>
      <div style={{position: 'absolute', left: 128, top: 208, width: 900}}>
        <Kicker>EXPLAINER · 01</Kicker>
        <div style={{fontFamily: Tokens.sans, fontWeight: 500, fontSize: 76, lineHeight: 1.04, letterSpacing: '-0.025em', color: Tokens.ink, marginTop: 20}}>
          <span style={{color: Tokens.accent, fontWeight: 600}}>{VIDEO.title.big}</span>
          {VIDEO.title.rest ? (
            <>
              <br />
              {VIDEO.title.rest}
            </>
          ) : null}
        </div>
        <div style={{fontFamily: Tokens.sans, fontWeight: 400, fontSize: 25, color: Tokens.ink, marginTop: 14}}>{VIDEO.title.en}</div>
        <div style={{height: 1, background: Tokens.hair, margin: '30px 0 18px', transform: `scaleX(${clamp01((N - (a + 14)) / 18)})`, transformOrigin: '0 50%'}} />
        <div style={{fontFamily: Tokens.sans, fontWeight: 400, fontSize: 20, color: Tokens.muted, opacity: clamp01((N - (a + 20)) / 12)}}>{VIDEO.title.tagline}</div>
      </div>
    </div>
  );
};

// ---------- chapter card ----------
export const PaperChapterCard: React.FC<{card: ChapterCardSpec; N?: number}> = ({card, N: NProp}) => {
  const live = useCurrentFrame() + 1;
  const N = NProp ?? live;
  if (N < card.from || N > card.to) return null;
  const n = N - card.from;
  const inN = clamp01(n / 14);
  const outN = clamp01((N - (card.to - 12)) / 12);
  const dy = (1 - easeOut(inN)) * 26 - easeOut(outN) * 130;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: inN * (1 - outN), transform: `translateY(${dy}px)`}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 240, textAlign: 'center'}}>
        <Kicker style={{fontSize: 15, letterSpacing: '0.24em'}}>{`CHAPTER ${String(card.n).padStart(2, '0')}`}</Kicker>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', fontFamily: Tokens.sans, fontWeight: 500, fontSize: fitSize(card.title, 1000, 64, 44), lineHeight: 1.05, letterSpacing: '-0.02em', color: Tokens.ink}}>
        {card.title}
      </div>
      <div style={{position: 'absolute', left: 640 - 150 * clamp01((n - 4) / 16), top: 418, width: 300 * clamp01((n - 4) / 16), height: 1, background: Tokens.hair}} />
      {card.tech ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: 442, textAlign: 'center', fontFamily: Tokens.sans, fontWeight: 400, fontSize: 24, color: Tokens.muted, opacity: clamp01((n - 10) / 12)}}>
          {card.tech}
        </div>
      ) : null}
    </div>
  );
};

// ---------- end credit ----------
export const PaperEndCredit: React.FC<{N?: number}> = ({N: NProp}) => {
  const live = useCurrentFrame() + 1;
  const N = NProp ?? live;
  const [a, b] = END_CREDIT_RANGE;
  const c = VIDEO.credit;
  if (!c || N < a || N > b) return null;
  const op = Math.min(clamp01((N - a) / 8), 1 - clamp01((N - (b - 8)) / 8));
  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 296, textAlign: 'center'}}><Kicker>{c.kicker}</Kicker></div>
      <div style={{position: 'absolute', left: 140, right: 140, top: 330, textAlign: 'center', fontFamily: Tokens.sans, fontWeight: 500, fontSize: 36, lineHeight: 1.25, color: Tokens.ink}}>{c.title}</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 448, textAlign: 'center', fontFamily: Tokens.sans, fontWeight: 400, fontSize: 24, color: Tokens.muted}}>{c.byline}</div>
      <div style={{position: 'absolute', left: 640 - 80 * clamp01((N - (a + 6)) / 16), top: 484, width: 160 * clamp01((N - (a + 6)) / 16), height: 1, background: Tokens.hair}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 508, textAlign: 'center', fontFamily: Tokens.sans, fontWeight: 400, fontSize: 20, color: Tokens.muted}}>{c.note}</div>
    </div>
  );
};
