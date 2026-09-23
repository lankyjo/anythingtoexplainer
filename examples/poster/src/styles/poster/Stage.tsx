// Poster film stage: cropped arcs backdrop, shots, pack chrome.
// Layer order: backdrop < shots < HUD < progress < aboveBar shots < ending veil < subtitles < credit.
import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import type {ShotDef} from '../../common/types';
import {clamp01} from '../../common';
import {ENDING_RANGE, CHAPTER_CARDS} from '../../common/chromeSpec';
import {VIDEO} from '../../config';
import {Arcs} from './Arcs';
import {PosterFonts} from './fonts';
import {Tokens} from './tokens';
import {ChapterCard, EndCredit, Hud, Progress, Subtitles, Title} from './chrome';

const PosterEnding: React.FC = () => {
  const N = useCurrentFrame() + 1;
  const [a, b] = ENDING_RANGE;
  const op = clamp01((N - a) / Math.max(1, b - a));
  return <div style={{position: 'absolute', inset: 0, background: Tokens.bg, opacity: op, pointerEvents: 'none'}} />;
};

export const PosterStage: React.FC<{shots: ShotDef[]; audio?: boolean}> = ({shots, audio = false}) => (
  <AbsoluteFill style={{background: Tokens.bg}}>
    <PosterFonts />
    <Arcs />
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
    <PosterEnding />
    {VIDEO.subtitles ? <Subtitles /> : null}
    <EndCredit />
  </AbsoluteFill>
);
