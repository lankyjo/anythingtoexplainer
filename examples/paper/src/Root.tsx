import React from 'react';
import {Composition} from 'remotion';
import {W, H, FPS, TOTAL_FRAMES} from './common';
import {Video} from './Main';

// The sample film. The Paper pack's demo and contrast compositions live in the template.
export const Root: React.FC = () => (
  <>
    <Composition id="Video" component={Video} durationInFrames={TOTAL_FRAMES} fps={FPS} width={W} height={H} />
  </>
);
