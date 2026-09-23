import React from 'react';
import {Stage} from './ui';
import {SHOTS_G1} from './shots/G1';
import {SHOTS_G2} from './shots/G2';
import {SHOTS_G3} from './shots/G3';
import {SHOTS_G4} from './shots/G4';
import {SHOTS_G5} from './shots/G5';
import {SHOTS_G6} from './shots/G6';
import {SHOTS_G7} from './shots/G7';
import {SHOTS_G8} from './shots/G8';

// Build groups G1-Gn fill src/shots/<Gn>/index.ts; the array order is layer order.
const SHOTS = [...SHOTS_G1, ...SHOTS_G2, ...SHOTS_G3, ...SHOTS_G4, ...SHOTS_G5, ...SHOTS_G6, ...SHOTS_G7, ...SHOTS_G8];

/** The film: active pack stage, voiceover plus subtitle band (audio needs public/assets/<slug>/audio.wav). */
export const Video: React.FC = () => <Stage shots={SHOTS} audio />;
