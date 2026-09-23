import React from 'react';
import {PaperStage} from './styles/paper';
import {SHOTS_P1} from './shots/P1';

// The sample film: Paper pack, voiceover plus subtitle band.
export const Video: React.FC = () => <PaperStage shots={SHOTS_P1} audio />;
