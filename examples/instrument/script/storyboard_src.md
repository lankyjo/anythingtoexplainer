# RAG in 30 seconds - storyboard

Frame numbers are 1-based and inclusive, filled from `script/timeline.json` by
`scripts/render_storyboard.py`. Total {TOTAL} frames (33.0 s at 30 fps).
Title card 1-{S01.from-9}. Chapter 2 card {C2-53}-{C2-9}. Ending veil from {S06.to-30}; credit
{S06.to+1}-{TOTAL-26}. Shot range = [sentence from-8, last sentence to+2]; elements enter within
-6..+3 frames of their subtitle block start.

## Chrome layer (main session)

| Element | Frames | Notes |
|---|---|---|
| Title card | 1-{S01.from-9} | kicker `EXPLAINER · 01`; accent word `Retrieval`; second line `augmented generation`; full name; hairline; tagline |
| HUD | {S01.from}-{S06.to} | `01 · THE PROBLEM` {S01.from}->{S03.to}; `02 · THE PIPELINE` {C2}->{S06.to} |
| Progress | 1-{TOTAL} | hairline track, ink fill to the current frame, 2px coral tick at the fill edge |
| Chapter card 2 | {C2-53}-{C2-9} | `CHAPTER 02` / `The pipeline` / hairline wipe / `Retrieval & Generation` |
| Ending veil | {S06.to-30}-{TOTAL} | paper-coloured fade over the content |
| Credit | {S06.to+1}-{TOTAL-26} | kicker `BASED ON`; the 2020 paper; Lewis et al. · NeurIPS 2020; `all visuals drawn in code` |

## P1 (chapter 1: S01-S03; chapter 2: S04-S06)

| Shot | Frames | Beat (subtitle block start) | Visual | Motion | Hero and size | Accent |
|---|---|---|---|---|---|---|
| SC01 Memory and the cutoff | {S01.from-8}-{S01.to+2} | {S01.c1} memory / {S01.c2} cutoff | 22x5 dot grid (x200 y300, 36px pitch) = memory; vertical hairline at x760 with a coral tick and the label `cutoff` | grid dots light column by column across the block; the cutoff line draws down over 16 frames at the second beat; dots right of the line dim to 0.2; a soft column wave travels the grid throughout | dot grid, 792x180 (scale ~288) | coral tick on the cutoff line; label `cutoff` muted |
| SC02 Ask about last week | {S02.from-8}-{S02.to+2} | {S02.c1} question / {S02.c2} invented | question line `Ask about last week` with a hairline under it; below it two paths from the same origin: a straight ink line labelled `from memory`, a coral zigzag labelled `invented` | the question rises in on the beat; a coral dot travels the straight path during the first block; at the second beat both paths draw on (22 frames) and the zigzag keeps a travelling phase for the rest of the shot | path pair, 720x160 (scale ~256) | the travelling dot and the coral zigzag; label `invented` |
| SC03 RAG arrives | {S03.from-8}-{S03.to+2} | {S03.c1} RAG / {S03.c2} open book | three concentric rings centred (640,380); `RAG` in 120px ink; a 160px coral rule and the label `an open book` below | rings scale 0.9 -> 1 over 26 frames; the word rises and lands on the first beat; at the second beat the coral rule wipes and the label fades | outer ring 480px across (scale ~192) plus the 120px word | the coral rule and the accent-free word (accent event is the rule) |
| SC04 Index | {S04.from-8}-{S04.to+2} | {S04.c1} index / {S04.c2} chunks / {S04.c3} vectors | document card (300x380, hairline, ink text rules at 0.35) cut by a coral vertical line at x490; three chunk rows (470x78) with an ink rule and a muted rule; eight dots per chunk at the right | the document fades in and dims to 0.45 as the cut line draws; chunks slide right from under the document (staggered 4 frames, easeOut); at the third beat each chunk's dot row lights in sequence; label `stored as vectors` fades | document, 380 tall | coral cut line; dot rows light as the third-beat accent |
| SC05 Retrieve | {S05.from-8}-{S05.to+2} | {S05.c1} retrieve / {S05.c2} closest | 22x5 dot grid at 0.26 opacity; four dots (cols 9-10, rows 2-3) darken; a coral query dot travels in; a ring target (r 44/70) around the neighbour pair, label `closest chunks` | the query dot travels 230px over 22 frames; at the second beat the leader line and ring draw on, the neighbour dots darken and the label fades; a soft column wave keeps the grid alive | dot grid, 792x180 (scale ~288) | the coral query dot and the ring target |
| SC06 Generate | {S06.from-8}-{S06.to+2} | {S06.c1} generate / {S06.c2} answer / {S06.c3} citations | three answer rules (760/660/360) at x180; two coral citation marks at the end of rules 1 and 2; leader hairlines down to two source blocks (`SOURCE 01` Lewis et al. · NeurIPS 2020; `SOURCE 02` arxiv.org/abs/2005.11401) | rules 1 and 2 wipe in on their beats; the third rule comes with the citation beat; at the third beat the two coral marks pop, the leader hairlines draw and the source blocks fade in | answer block, ~760x140 (scale ~224) | the two coral citation marks |

## Global constraints

- Example context: none; this is a concept film and all copy is generic ("ask about last week").
- Fact list (allowed on screen): `2020`, `Lewis et al.`, `NeurIPS 2020`, `arxiv.org/abs/2005.11401`,
  `retrieval-augmented generation`, `RAG`, `index`, `retrieve`, `generate`, `cutoff`,
  `from memory`, `invented`, `an open book`, `stored as vectors`, `closest chunks`,
  `SOURCE 01`, `SOURCE 02`.
- **Flash whitelist**: SC01 cutoff tick · SC02 travelling dot and `invented` label · SC03 coral rule ·
  SC04 coral cut line and vector dots · SC05 query dot and ring · SC06 citation marks.
- Hero moments: SC03 (subject lands) and SC06 (grounded answer with citations).
- Camera list: every shot carries one slow push (1.0 -> 1.03-1.05) centred on its hero, 30-45
  frames easeInOut equivalent; HUD and subtitles stay still.
- Sustained motion (section 9 of `composition-and-light.md`): every block's verb has an action that
  lasts to the next beat (column wave, travelling phase, dot rows, leader lines); after its entrance
  nothing is fully still for more than 30 frames; shots without another camera move carry the 1.0 ->
  1.05 push; still frames <= 40%, longest hold <= 1.0 s, verified with
  `python3 scripts/motion_check.py --frames fin_frames`.
