// Pack demo: one composition showing title, chapter card, chrome (HUD + subtitle + progress), a step
// list, a big number and the end credit, so stills of each piece can be rendered and compared.
// The diagram and number scenes are the approved prototype shots rebuilt from the exported primitives.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import type {ChapterCardSpec} from '../../common/chromeSpec';
import {PaperFonts} from './fonts';
import {Rings} from './Rings';
import {Tokens} from './tokens';
import {PaperChapterCard, PaperEndCredit, PaperHud, PaperProgress, PaperSubtitleLine, PaperTitle} from './chrome';
import {BigNumber, StepList} from './primitives';

const DEMO_CARD: ChapterCardSpec = {n: 2, title: 'Retrieval & Generation', tech: 'Indexing', from: 41, to: 80};
const DEMO_STEPS = [
  {label: 'Query', note: 'the question, embedded'},
  {label: 'Retrieve', note: 'top-k chunks, by similarity'},
  {label: 'Rerank', note: 'cross-encoder reorders'},
  {label: 'Generate', note: 'answer, grounded in context'},
];

export const PaperDemo: React.FC = () => {
  const N = useCurrentFrame() + 1;
  return (
    <AbsoluteFill style={{background: Tokens.bg}}>
      <PaperFonts />
      <Rings />
      {N <= 40 ? <PaperTitle N={N} /> : null}
      {N > 40 && N <= 80 ? <PaperChapterCard card={DEMO_CARD} N={N} /> : null}
      {N > 80 && N <= 140 ? (
        <>
          <PaperHud N={N} override={{left: '02 · RETRIEVAL', right: '01:24 / 03:10'}} />
          <PaperSubtitleLine text="Each query is embedded and matched against the index" />
          <PaperProgress N={N} />
        </>
      ) : null}
      {N > 140 && N <= 180 ? <StepList steps={DEMO_STEPS} active={1} left={180} top={180} width={920} /> : null}
      {N > 180 && N <= 240 ? <BigNumber value="92" unit="%" caption="of answers cite a retrieved source" top={196} /> : null}
      {N > 240 ? <PaperEndCredit N={N} /> : null}
    </AbsoluteFill>
  );
};
