# Narration, voiceover, storyboard

## 1. Narration (`script/narration.txt`)

Format:
```
# CHAPTER 1 Title           (short - it becomes the progress-bar chapter name)
One sentence|split by pipes into subtitle blocks|each block <= 48 characters
## gap 20                   (optional: extra blank frames before the next sentence)
```

Writing rules:
- Structure: chapters follow the content, not the duration - one deep chapter is as valid as a
  multi-chapter overview (3-5 is common). Chapter 1 is "why" (problem -> analogy -> the subject
  arrives -> source); middle chapters are "how" (one step per pipeline stage, each sentence opening
  with "Step N + action"); the last chapter is "evaluation + advanced + controversy + return to the
  analogy". Squeeze evaluation and advanced material into the last chapter when there are few
  chapters; when there are many, split "how" more finely instead of padding.
- Length: **take the tier the user chose in checkpoint 1** (3-5 minutes -> 40-50 sentences,
  420-700 words). Kokoro runs ~2.3 words/second; with gaps the finished film averages ~2.1
  words/second, so write at ~125 words/minute; if the first draft is more than 15% off the target,
  add or cut sentences.
- One running analogy (open-book exams) and one running example (expense reports), echoed at the
  start and the end.
- Numbers only from the research document's numbers list, with the source institution and year
  ("an Anthropic experiment in 2024"); volatile numbers get "at release / as of <year>".
- First mention of a term uses the full name plus the abbreviation in brackets
  (`retrieval-augmented generation (RAG)`), then the abbreviation; abbreviations must be
  pronounceable (RAG / HNSW / BM25 are read as letters).
- Every sentence must be drawable: while writing, decide what the frame shows; rewrite or cut
  anything that cannot be drawn.
- Chapter titles are the progress-bar names; section names inside a chapter are the HUD words
  (written into `config.ts` later).

## 2. Voiceover (`scripts/tts_build.py`)

- Pass checkpoints 2 (narration final) and 3 (voice) first: ask once whether the user has a
  preferred TTS; if not, use the default without presenting a menu.
- Engine: **kokoro-82m**, local. `KOKORO_VOICE=am_liam` (Liam, male), `KOKORO_LANG=a`,
  `KOKORO_SPEED=1.0`. Needs `pip install kokoro soundfile`.
- Kokoro has no word boundaries, so each subtitle block is synthesised separately and concatenated:
  block start frames are therefore exact, but the seam between blocks is slightly clipped
  (`CHUNK_PAD` sets the silence).
- A user-supplied voice (recorded or a different TTS) does not run this script: put the finished wav
  at `public/assets/<slug>/audio.wav` and hand-fill `src/common/timeline.ts` and `subs.ts` (format in
  the script header); the interface is identical.
- Per-sentence synthesis; GAP 10 frames between sentences, CHAPTER_GAP 45 before a chapter, LEAD 40
  at the head, TAIL 90 at the tail; mixed down to peak 0.89.
- Output: `public/assets/<slug>/audio.wav`, `src/common/timeline.ts` (TOTAL_FRAMES / CHAPTER_STARTS /
  SENTENCES), `src/common/subs.ts`, `script/timeline.json|md`.
- Per-sentence cache in `audio/cache/`: changing one sentence re-synthesises only that block.
  **Never change words after storyboarding starts** - every frame number moves and shot code
  hard-codes frames.
- Verification: subtitle block starts sit within about one frame of the audio onsets
  (`selftest.py --project <dir>` checks this with numpy).

## 3. Storyboard (`script/storyboard_src.md` -> `storyboard.md`)

Tokens: `{S12.from}` `{S12.to}` `{S12.c3}` (start frame of subtitle block 3) `{C2}` (start frame of
chapter 2) `{TOTAL}`, each with an optional offset: `{S12.from-8}`.
`python3 scripts/render_storyboard.py` fills the numbers.

Structure:
1. Head: total frames, chapter frames, join rules (shot range = [sentence from-8, last sentence
   to+2]; element entrances align to the subtitle block start, -6..+3).
2. Chrome layer table (main session): title, chapter cards, HUD entry ranges, rail steps and switch
   frames, ending; rail chapters mark "content area y175-620".
3. One table per group, one row per shot:
   `| Shot | Frames | Beat (subtitle block start) | Visual | Motion | Hero and size | Accent |`.
   Visual: elements, positions (reference coordinates), colour meaning. Motion: entrance + which
   beat it aligns to + exit + **camera** (>= 3 per chapter: push in / carried displacement / group
   pan / parallax) + **a closing "continuous: ..." line** (the action that carries this block's verb
   to the next beat: data flow / pulse along an arrow / line-by-line typing / cells lighting in
   order / growth / gate opening / queue compressing; shots without another camera move write
   "continuous: 1.0->1.05 push"; rules in `composition-and-light.md` section 7). Hero and size: the
   shot's single hero and its height (shape >= 170px or number >= 96px, entering on beat 1 or 2).
   Accent: what carries the accent treatment and which element is the current focus.
4. Global constraints: the example context (question / answer / source copy verbatim), the fact list
   (numbers and English allowed on screen), the accent-event whitelist (one key element per shot),
   the reused-primitive list, the **hero-moment list** (1-2 shots per chapter: chapter claim / hero
   entrance / closing payoff, typed as entrance / big-number / symbol, staged per
   `composition-and-light.md` section 3, >= 90 frames), the **camera list** (>= 3 per chapter, which
   shot, which beat, which kind) and **section 9 sustained motion** (copy the rules and thresholds
   from `composition-and-light.md` section 7: nothing still for > 30 frames after entrance, still
   frames <= 40%, longest hold <= 1 s; build groups self-test with `scripts/motion_check.py <Gn>`).

## 4. Shot design patterns

Pick by concept type. Build groups must read the sample source for each pattern they use (the Paper
sample lives at `examples/paper/shots_src/`).

| Concept | How to draw it | Hero / size / accent | Sample |
|---|---|---|---|
| Subject with several weaknesses | subject on the left, numbered hairline rows filling in on the right | subject 110-170px, accent on the current row | G1 |
| Analogy | a concrete object (exam paper, book) plus a big label | object >= 240 wide, one accent label | G2 |
| **Hero entrance (set piece)** | clear frame -> backdrop motif / rule sweep -> focus ring -> hero lands on the beat -> pulse -> subtitle line -> staggered labels | number >= 96px or shape >= 170, accent on the hero | G2 |
| Source | paper card (title + authors) plus a counting year | paper card >= 240 wide; year 96px, never alone on an empty frame | G2 |
| Pipeline stage | `StepList` with one active row plus a leader label into a diagram | active row is the accent focus; diagram 60-110 | G3 |
| Chunking / granularity | three columns (too big / common / too small) with a rule between | middle card active, one accent | G3 |
| Vector space | dot matrix plus a ring target around the neighbour pair | plane ~800x410; query point accented | G4 |
| Index / depth | stacked hairline planes with a path drawn between them | top plane ink, lower planes muted | G4 |
| Storage / permissions | cylinder plus cards flying in plus labels and user marks | cylinder >= 160 tall, accent on its top face | G4 |
| Two paths fusing | two columns plus a centre formula | result term >= 72px, accent on it | G5 |
| Filter / rank | funnel plus `RankedBar` | current step accent, bars 60-110 | G6 |
| Study finding | curve chart card plus a muted source note (hold >= 2.5 s) | chart 440x300, accent dot | G6 |
| Prompt / output | typing card plus a reply card with citation marks plus leader lines | hero 110-170px | G6 |
| Evaluation metrics | two columns of labels plus a framework name | framework name carries the accent | G7 |
| Trade-off | a balance that tilts or an equals comparison | balance >= 400 wide | G7 |
| Graph / loop | nodes lighting in order, edges drawn on, a loop with a runner | ring >= 300 diameter | G7 |
| **Scale / threshold (big-number set piece)** | counter to the value plus unit plus one comparison object | number >= 96px, accent unit | G8 |
| **Closing (symbol set piece)** | return to the analogy, symbol rises, conclusion lands | symbol >= 260 tall | G8 |
| Timeline / slow motion | axis plus cursor, **always with a hero**: a 96px number or an enlarged current tick | number 96px, cursor accented | paper-contrast |
| Formula | tokens appear one at a time (one per 3 frames), result term >= 72px | result term accented | G5 |
| Table / leaderboard | current row scales 1.15 and takes the accent, rows >= 54 high, a hero number or icon beside the table | current row is the hero | paper-contrast |
| "Many" / world is big | 2-3 layer parallax wall (screenshots, documents, logs), background layer darkened x0.43 | parallax is a camera move, not debris | - |
