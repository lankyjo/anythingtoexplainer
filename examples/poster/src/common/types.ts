import type {FC} from 'react';

/**
 * Shot definition: from/to are film frame numbers (1-based, inclusive). The stage mounts each shot
 * with <Sequence from={from-1} durationInFrames={to-from+1}>.
 * layer:'aboveBar' renders the shot above the progress bar and below the subtitles.
 */
export type ShotDef = {id: string; from: number; to: number; Comp: FC; layer?: 'aboveBar'};
