// Paper contrast pairs: four rules, each as one BAD / GOOD panel pair, one scene per rule.
// Render 4 stills (frames 45 / 135 / 225 / 315) into examples/paper-contrast/.
// Rules: focal point, density, accent dosage, type scale.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {PaperFonts} from './fonts';
import {Tokens} from './tokens';
import {BigNumber, HairlineRow, StepList} from './primitives';

const PANEL_W = 560;
const PANEL_H = 560;
const PANEL_Y = 96;

const Panel: React.FC<{x: number; title: string; good: boolean; children: React.ReactNode}> = ({x, title, good, children}) => (
  <div style={{position: 'absolute', left: x, top: PANEL_Y, width: PANEL_W, height: PANEL_H, background: '#FBF9F7', border: `1px solid ${Tokens.hair}`}}>
    <div style={{position: 'absolute', left: 28, top: 24, fontFamily: Tokens.sans, fontWeight: 700, fontSize: 13, letterSpacing: '0.18em', color: good ? Tokens.accent : Tokens.muted}}>{good ? 'GOOD' : 'BAD'}</div>
    <div style={{position: 'absolute', left: 28, top: 44, fontFamily: Tokens.sans, fontWeight: 400, fontSize: 15, color: Tokens.muted}}>{title}</div>
    <div style={{position: 'absolute', left: 28, right: 28, top: 92}}>{children}</div>
  </div>
);

const RuleTitle: React.FC<{text: string}> = ({text}) => (
  <div style={{position: 'absolute', left: 40, top: 44, fontFamily: Tokens.sans, fontWeight: 600, fontSize: 22, color: Tokens.ink}}>{text}</div>
);

const S = ({children, size = 20, weight = 400, color = Tokens.ink, top = 0, accent = false}: {children: React.ReactNode; size?: number; weight?: number; color?: string; top?: number; accent?: boolean}) => (
  <div style={{fontFamily: Tokens.sans, fontWeight: weight, fontSize: size, color: accent ? Tokens.accent : color, marginTop: top}}>{children}</div>
);

// 1 - focal point: one hero, everything else subordinate
const FocalBad = () => (
  <>
    <S size={26} weight={500}>Retrieval accuracy</S>
    <S size={26} top={10}>Index size</S>
    <S size={26} top={10}>Latency</S>
    <S size={26} top={10}>Cost per query</S>
  </>
);
const FocalGood = () => (
  <div style={{transform: 'translateY(-14px)'}}>
    <BigNumber value="92" unit="%" caption="of answers cite a retrieved source" top={0} size={132} />
  </div>
);

// 2 - density: fewer rows, more air
const DensityBad = () => (
  <>
    {['Query', 'Retrieve', 'Rerank', 'Generate', 'Cite'].map((t) => (
      <div key={t} style={{fontFamily: Tokens.sans, fontSize: 15, color: Tokens.ink, padding: '3px 0'}}>{t}</div>
    ))}
    <S size={13} color={Tokens.muted} top={6}>five rows squeezed into the panel, no rules, no margins</S>
  </>
);
const DensityGood = () => (
  <div style={{transform: 'scale(0.82)', transformOrigin: '0 0', width: PANEL_W / 0.82}}>
    <StepList
      steps={[{label: 'Query', note: 'embedded'}, {label: 'Retrieve', note: 'top-k chunks'}, {label: 'Rerank', note: 'cross-encoder'}, {label: 'Generate', note: 'grounded answer'}]}
      active={1}
      left={0}
      top={0}
      width={500}
    />
  </div>
);

// 3 - accent dosage: colour marks the current step only
const AccentBad = () => (
  <>
    {['Query', 'Retrieve', 'Rerank', 'Generate'].map((t, i) => (
      <HairlineRow key={t} index={String(i + 1).padStart(2, '0')} label={t} active first={i === 0} width={500} />
    ))}
  </>
);
const AccentGood = () => (
  <>
    {['Query', 'Retrieve', 'Rerank', 'Generate'].map((t, i) => (
      <HairlineRow key={t} index={String(i + 1).padStart(2, '0')} label={t} active={i === 1} first={i === 0} width={500} />
    ))}
  </>
);

// 4 - type scale: label / value / note at three sizes
const ScaleBad = () => (
  <>
    <S size={21}>Cached answers</S>
    <S size={21} top={12}>41</S>
    <S size={21} top={12}>share of queries answered from cache</S>
  </>
);
const ScaleGood = () => (
  <>
    <S size={13} weight={700} color={Tokens.muted}>KICKER</S>
    <S size={64} weight={300} top={8}>41</S>
    <S size={18} color={Tokens.muted} top={6}>share of queries answered from cache</S>
  </>
);

const SCENES: Array<{title: string; bad: React.ReactNode; good: React.ReactNode}> = [
  {title: '01 · One focal point', bad: <FocalBad />, good: <FocalGood />},
  {title: '02 · Density: rows breathe', bad: <DensityBad />, good: <DensityGood />},
  {title: '03 · Accent marks the current step only', bad: <AccentBad />, good: <AccentGood />},
  {title: '04 · Three type sizes, not one', bad: <ScaleBad />, good: <ScaleGood />},
];

export const PaperContrast: React.FC = () => {
  const N = useCurrentFrame() + 1;
  const i = Math.min(SCENES.length - 1, Math.floor((N - 1) / 90));
  const s = SCENES[i];
  return (
    <AbsoluteFill style={{background: Tokens.bg}}>
      <PaperFonts />
      <RuleTitle text={s.title} />
      <Panel x={40} title="what not to do" good={false}>{s.bad}</Panel>
      <Panel x={680} title="what to do" good>{s.good}</Panel>
    </AbsoluteFill>
  );
};
