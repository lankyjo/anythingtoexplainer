// Poster pack demo: title, chapter card, readout, step row, big number and credit in one
// composition so stills of each piece can be compared.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import type {ChapterCardSpec} from '../../common/chromeSpec';
import {Arcs} from './Arcs';
import {PosterFonts} from './fonts';
import {Tokens} from './tokens';
import {ChapterCard, EndCredit, Hud, Progress, SubtitleLine, Title} from './chrome';
import {BigNumber, StepList} from './primitives';

const DEMO_CARD: ChapterCardSpec = {n: 2, title: 'Retrieval & Generation', tech: 'Indexing and ranking', from: 41, to: 80};

export const PosterDemo: React.FC = () => {
  const N = useCurrentFrame() + 1;
  return (
    <AbsoluteFill style={{background: Tokens.bg}}>
      <PosterFonts />
      <Arcs r0={N > 180 && N <= 240 ? 320 : 250} filled={N > 180 && N <= 240} />
      {N <= 40 ? <Title N={N} /> : null}
      {N > 40 && N <= 80 ? <ChapterCard card={DEMO_CARD} N={N} /> : null}
      {N > 80 && N <= 140 ? (
        <>
          <Hud N={N} override={{left: '02 · RETRIEVAL', right: '01:24 / 03:10'}} />
          <div style={{position: 'absolute', left: 96, top: 250, width: 620}}>
            <div style={{fontFamily: Tokens.sans, fontWeight: 300, fontSize: 46, lineHeight: 1.2, letterSpacing: '-0.015em', color: Tokens.ink}}>Top-k chunks, ranked by similarity.</div>
          </div>
          <StepList steps={['embed', 'search', 'rerank']} active={1} />
          <SubtitleLine text="Each query is embedded and matched against the index" />
          <Progress N={N} />
        </>
      ) : null}
      {N > 140 && N <= 180 ? <StepList steps={['query', 'retrieve', 'rerank', 'generate']} active={2} left={96} top={360} size={34} /> : null}
      {N > 180 && N <= 240 ? (
        <BigNumber
          value="10x"
          caption="more grounded answers when every response cites a retrieved source"
          compare={[{label: 'with retrieval', w: 210, active: true}, {label: 'baseline', w: 42}]}
        />
      ) : null}
      {N > 240 ? <EndCredit N={N} /> : null}
    </AbsoluteFill>
  );
};
