import React from 'react';
import {Stage} from './ui';
import {SHOTS_P1} from './shots/P1';

// Same RAG script and shots as the Paper sample; the Poster pack supplies the look.
export const Video: React.FC = () => <Stage shots={SHOTS_P1} audio />;
