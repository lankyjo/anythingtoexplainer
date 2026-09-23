// Instrument pack demo: title, chapter card, readout, step list, number and credit in one
// composition so stills of each piece can be compared.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import type {ChapterCardSpec} from '../../common/chromeSpec';
import {Dial} from './Dial';
import {InstrumentFonts} from './fonts';
import {Tokens} from './tokens';
import {ChapterCard, EndCredit, Hud, Progress, SubtitleLine, Title} from './chrome';
import {BigNumber, MagBars, StepList} from './primitives';

const DEMO_CARD: ChapterCardSpec = {n: 2, title: 'Retrieval & Generation', tech: 'INDEXING', from: 41, to: 80};

export const InstrumentDemo: React.FC = () => {
  const N = useCurrentFrame() + 1;
  return (
    <AbsoluteFill style={{background: Tokens.bg}}>
      <InstrumentFonts />
      <Dial sweep={N > 180 && N <= 240 ? Math.min(1, (N - 180) / 60) * 0.62 : 0} />
      {N <= 40 ? <Title N={N} /> : null}
      {N > 40 && N <= 80 ? <ChapterCard card={DEMO_CARD} N={N} /> : null}
      {N > 80 && N <= 140 ? (
        <>
          <Hud N={N} override={{left: 'CH.02 — RETRIEVAL', right: '01:24 / 03:10'}} />
          <div style={{position: 'absolute', left: 596, top: 220, width: 620}}>
            <div style={{fontFamily: Tokens.mono, fontSize: 13, color: Tokens.accent, letterSpacing: '0.1em'}}>RETRIEVE</div>
            <div style={{fontFamily: Tokens.sans, fontWeight: 400, fontSize: 30, color: Tokens.ink, marginTop: 14, lineHeight: 1.3}}>
              Similarity search over the vector index returns the top-k chunks for this query.
            </div>
            <MagBars values={[1, 2, 3, 4, 5]} top={140} />
          </div>
          <SubtitleLine text="Each query is embedded and matched against the index" />
          <Progress N={N} />
        </>
      ) : null}
      {N > 140 && N <= 180 ? (
        <StepList
          steps={[
            {label: 'QUERY', note: 'embed', timing: '42 ms'},
            {label: 'RETRIEVE', note: 'top-k', timing: '84 ms'},
            {label: 'RERANK', note: 'cross-encoder', timing: '126 ms'},
            {label: 'GENERATE', note: 'grounded', timing: '0.9 s'},
          ]}
          active={1}
        />
      ) : null}
      {N > 180 && N <= 240 ? <BigNumber value="1,024" caption="tokens per chunk, median" stats="recall 0.86 · precision 0.71 · latency 42 ms" /> : null}
      {N > 240 ? <EndCredit N={N} /> : null}
    </AbsoluteFill>
  );
};
