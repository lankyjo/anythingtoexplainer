// Active style-pack facade. Shot code imports everything from here and never switches style itself;
// config.style picks the pack. Packs live in src/styles/<pack>/ and expose the same canonical names.
import {VIDEO} from './config';
import * as paper from './styles/paper';
import * as instrument from './styles/instrument';

const PACK = VIDEO.style === 'instrument' ? instrument : paper;

export const Tokens = PACK.Tokens;
export const PackFonts = PACK.PackFonts;
export const Backdrop = PACK.Backdrop;
export const Stage = PACK.Stage;
export const Demo = PACK.Demo;
export const HairlineRow = PACK.HairlineRow;
export const StepList = PACK.StepList;
export const BigNumber = PACK.BigNumber;
export const RingTarget = PACK.RingTarget;
export const RankedBar = PACK.RankedBar;
export const LeaderLabel = PACK.LeaderLabel;
export const Hud = PACK.Hud;
export const Subtitles = PACK.Subtitles;
export const SubtitleLine = PACK.SubtitleLine;
export const Progress = PACK.Progress;
export const Title = PACK.Title;
export const ChapterCard = PACK.ChapterCard;
export const EndCredit = PACK.EndCredit;
export const SUB_TOP = PACK.SUB_TOP;
