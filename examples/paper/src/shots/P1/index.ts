import type {ShotDef} from '../../common';
import {SC01} from './SC01';
import {SC02} from './SC02';
import {SC03} from './SC03';
import {SC04} from './SC04';
import {SC05} from './SC05';
import {SC06} from './SC06';

// Shot ranges = [sentence from-8, sentence to+2]; frame numbers in the film timeline.
export const SHOTS_P1: ShotDef[] = [
  {id: 'SC01', from: 78, to: 209, Comp: SC01},
  {id: 'SC02', from: 210, to: 323, Comp: SC02},
  {id: 'SC03', from: 324, to: 453, Comp: SC03},
  {id: 'SC04', from: 499, to: 639, Comp: SC04},
  {id: 'SC05', from: 640, to: 742, Comp: SC05},
  {id: 'SC06', from: 743, to: 892, Comp: SC06},
];
