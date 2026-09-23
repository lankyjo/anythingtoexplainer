// Instrument film stage: dial backdrop, shots, pack chrome.
// Layer order: backdrop < shots < HUD < progress < aboveBar shots < ending veil < subtitles < credit.
import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import type {ShotDef} from '../../common/types';
import {clamp01} from '../../common';
import {ENDING_RANGE} from '../../common/chromeSpec';
import {CHAPTER_CARDS} from '../../common/chromeSpec';
import {VIDEO} from '../../config';
import {Dial} from './Dial';
import {InstrumentFonts} from './fonts';
import {Tokens} from './tokens';
import {ChapterCard, EndCredit, Hud, Progress, Subtitles, Title} from './chrome';

const InstrumentEnding: React.FC = () => {
  const N = useCurrentFrame() + 1;
  const [a, b] = ENDING_RANGE;
  const op = clamp01((N - a) / Math.max(1, b - a));
  return <div style={{position: 'absolute', inset: 0, background: Tokens.bg, opacity: op, pointerEvents: 'none'}} />;
};

export const InstrumentStage: React.FC<{shots: ShotDef[]; audio?: boolean}> = ({shots, audio = false}) => (
  <AbsoluteFill style={{background: Tokens.bg}}>
    <InstrumentFonts />
    <Dial />
    <Title />
    {CHAPTER_CARDS.map((c) => (
      <ChapterCard key={c.n} card={c} />
    ))}
    {audio ? <Audio src={staticFile(`assets/${VIDEO.slug}/audio.wav`)} /> : null}
    {shots.filter((s) => s.layer !== 'aboveBar').map((s) => (
      <Sequence key={s.id} from={s.from - 1} durationInFrames={s.to - s.from + 1}>
        <s.Comp />
      </Sequence>
    ))}
    <Hud />
    <Progress />
    {shots.filter((s) => s.layer === 'aboveBar').map((s) => (
      <Sequence key={s.id} from={s.from - 1} durationInFrames={s.to - s.from + 1}>
        <s.Comp />
      </Sequence>
    ))}
    <InstrumentEnding />
    {VIDEO.subtitles ? <Subtitles /> : null}
    <EndCredit />
  </AbsoluteFill>
);
