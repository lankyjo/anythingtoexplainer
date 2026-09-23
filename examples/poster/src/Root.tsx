import React from 'react';
import {Composition} from 'remotion';
import {W, H, FPS, TOTAL_FRAMES} from './common';
import {Video} from './Main';
import {Demo} from './ui';
import {PaperContrast} from './styles/paper';

// Main composition Video + the active pack's demo + the Paper contrast sheet.
export const Root: React.FC = () => (
  <>
    <Composition id="Video" component={Video} durationInFrames={TOTAL_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="Pack" component={Demo} durationInFrames={300} fps={FPS} width={W} height={H} />
    <Composition id="PaperContrast" component={PaperContrast} durationInFrames={360} fps={FPS} width={W} height={H} />
  </>
);
