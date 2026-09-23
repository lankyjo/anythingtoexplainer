// Style-independent chrome ranges: when the title, chapter cards, HUD, rails, ending fade and credit
// card appear. Each pack draws them its own way; the timings live here so packs cannot drift apart.
import {SENTENCES, TOTAL_FRAMES, CHAPTER_STARTS} from './timeline';
import {VIDEO} from '../config';

export const S = (id: string) => {
  const s = SENTENCES.find((x) => x.id === id);
  if (!s) throw new Error(`config references unknown sentence id ${id} (see script/timeline.md)`);
  return s;
};

// ---------- title ----------
// Falls back to a fixed range when the voiceover has not been generated yet (placeholder timeline),
// so probe stills can render.
export const TITLE_RANGE: [number, number] = [1, (SENTENCES[0]?.from ?? 100) - 9];

// ---------- chapter cards ----------
/** Chapter card (from chapter 2 on): previous chapter's last sentence +3 -> this chapter's first sentence -9 */
export type ChapterCardSpec = {n: number; title: string; tech: string; from: number; to: number};
const lastSentenceBefore = (frame: number) => [...SENTENCES].reverse().find((x) => x.to < frame)!;
export const CHAPTER_CARDS: ChapterCardSpec[] = CHAPTER_STARTS.slice(1).map((c, i) => {
  const first = SENTENCES.find((x) => x.chapter === c.n)!;
  const prev = lastSentenceBefore(first.from);
  return {n: c.n, title: c.title, tech: VIDEO.chapterTech[i + 1] ?? '', from: prev.to + 3, to: first.from - 9};
});

// ---------- HUD ----------
export type HudEntry = {from: number; to: number; text: string; tech?: string; w?: number};
/** HUD entries resolve from config.hud sentence ids; a chapter's first entry starts 8 frames before
 *  its sentence (after the chapter card), its last ends 2 frames after. */
export const HUD: HudEntry[] = (SENTENCES.length ? VIDEO.hud : []).map((h) => {
  const a = S(h.fromS), b = S(h.toS);
  const isChapterFirst = SENTENCES.find((x) => x.chapter === a.chapter)!.id === a.id && a.chapter > 1;
  const from = a.from + (h.fromOffset ?? (isChapterFirst ? -8 : 0));
  const isChapterLast = [...SENTENCES].reverse().find((x) => x.chapter === b.chapter)!.id === b.id;
  const to = b.to + (h.toOffset ?? (isChapterLast ? 2 : 0));
  return {from, to, text: h.text, tech: h.tech, w: h.w};
});
// No gap between adjacent entries of one chapter (extend the previous to the next from -1);
// across a chapter card (gap >= 30) keep the gap - the card takes over.
for (let i = 0; i < HUD.length - 1; i++) if (HUD[i + 1].from - HUD[i].to < 30) HUD[i].to = HUD[i + 1].from - 1;
export const HUD_RANGE: [number, number] = HUD.length ? [HUD[0].from, HUD[HUD.length - 1].to] : [0, 0];

// ---------- pipeline rail ----------
export type RailSpec = {steps: string[]; switches: number[]; from: number; to: number};
export const RAILS: RailSpec[] = (SENTENCES.length ? VIDEO.rails : []).map((r) => ({
  steps: r.steps, switches: r.switchS.map((id) => S(id).from), from: S(r.fromS).from - 8, to: S(r.toS).to + 2,
}));

// ---------- ending ----------
export const LAST_TO = SENTENCES[SENTENCES.length - 1]?.to ?? TOTAL_FRAMES - 60;
export const ENDING_RANGE: [number, number] = [LAST_TO - VIDEO.endingFade, TOTAL_FRAMES];
export const ENDING_TOP_RANGE: [number, number] = [LAST_TO - VIDEO.endingFade, TOTAL_FRAMES];
/** Credit card after the content is fully dark; ~3 s hold, then pure black */
export const END_CREDIT_RANGE: [number, number] = [LAST_TO + 1, TOTAL_FRAMES - 26];
