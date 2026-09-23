# Paper pack

Warm paper, ink type, hairlines, one coral accent, concentric rings. Editorial diagram, not a
poster: the layout carries the meaning, colour is an event.

Tokens: `src/styles/paper/tokens.ts`. Chrome: `src/styles/paper/chrome.tsx`. Primitives:
`src/styles/paper/primitives.tsx`. Demo composition: `Paper`.

## 1. Tokens

| Name | Value | Use |
|---|---|---|
| `bg` | `#F6F4F1` | full-bleed canvas |
| `ink` | `#141414` | headlines, row labels, subtitles |
| `muted` | `#8A857E` | notes, kickers, time, secondary labels |
| `hair` | `#DAD5CE` | rules, separators, progress track |
| `ring` | `#E7E2DA` | backdrop circles only |
| `accent` | `#E2543B` | the current step, the key word, one rule under a big number |

No other colours. No white cards, no grey boxes: separation is made with space and hairlines.

## 2. Backdrop

Four concentric hairlines, radii 150 / 235 / 320 / 405, centred at (640, 368), stroke 1px `ring`,
plus a 12px centre dot. It is structure, not decoration: put the focal point near the centre and
let rings crop at the frame edge. Never animate the rings.

## 3. Type (Manrope, weights 100-900)

| Role | Size / weight | Notes |
|---|---|---|
| Kicker | 14 / 700, letterSpacing .2em, muted | `EXPLAINER · 01`, `CHAPTER 02` |
| Headline | 76 / 500, letterSpacing -.025em, ink | accent word at 600 |
| Chapter title | max 64 / 500 | shrinks to fit 1000px |
| Row label | 36 / 400; active 600 accent | the step-list workhorse |
| Row index | 15 / 700, muted; active accent | `01`, `02`, width 30 |
| Row note | 19 / 400, muted | right-aligned |
| Big number | up to 196 / 300, letterSpacing -.045em | unit in accent at 400 |
| Number caption | 24 / 400, muted | below the number |
| HUD / time | 14 / 700 letterSpacing .18em ink / 14 / 400 muted | |
| Subtitle | 38 / 600, ink | centred, no outline, transparent band |
| Credit | 36 / 500 title, 24 / 400 byline, 20 / 400 note | |

Content text floor is 22px; kickers, HUD and notes are chrome and may be smaller. English only:
never squeeze Latin (`scaleX`), never set a whole sentence in caps.

## 4. Chrome geometry

- **HUD** - left `CHAPTER 0N · SECTION` at y34, right `mm:ss / mm:ss` at y34, 1px hairline at y66
  spanning x60-1220.
- **Subtitle** - centred x640, CSS top 637 (ink y644-684), no band, no outline. Hidden when
  `config.subtitles` is false, layout unchanged.
- **Progress** - 4px at the bottom: hairline track, ink fill up to the current frame, 2px coral
  tick at the fill edge. No chapter labels (the HUD carries the section).
- **Title card** - left 128, top 208: kicker, big accent word at 76, full name at 25 ink, hairline,
  tagline at 20 muted. Enters with a 22-frame rise (26px) and fades; exits rising 130px over 12.
- **Chapter card** - `CHAPTER 0N` kicker centred y240, title centred y300 (max 64), 300px hairline
  at y418 wiped from the centre over 16 frames, tech subtitle y442. Same enter/exit as the title.
- **End credit** - kicker y296, title y330 (36, max two lines), byline y448, 160px hairline y484,
  note y508; holds about three seconds.

All timings come from `src/common/chromeSpec.ts`; never hand-place a card in a shot.

## 5. Primitives

Import from `src/ui.tsx` (the active-pack facade), never from the pack folder directly.

| Primitive | Props | Use |
|---|---|---|
| `HairlineRow` | `index label note active first width` | one ranked/step row |
| `StepList` | `steps[{label,note}] active left top width` | 3-5 rows, exactly one active |
| `BigNumber` | `value unit caption top size rule` | the frame's focal point |
| `RingTarget` | `cx cy r[] dot` | mark a point with nested hairline circles |
| `RankedBar` | `items[{label,value,display,accent}] left top width max` | comparisons, one accent bar |
| `LeaderLabel` | `x y tx ty text anchor` | small label with a hairline leader to a target dot |

## 6. Composition patterns

- **Step list frame** - `StepList` centred, one active row; the frame's motion is the accent
  moving from row to row plus a hairline wipe.
- **Number frame** - `BigNumber` upper-centre, caption and 120px accent rule below; nothing else
  except an optional `LeaderLabel`. One number per frame.
- **Comparison** - two columns separated by a 1px vertical hairline at x640 (a rule, never a box),
  one `RankedBar` or `StepList` per side, at most one accent per side.
- **Pointing** - `LeaderLabel` from a note in the margin to a dot on the object; the leader is a
  1px hairline, the dot is 3px accent.
- **Density** - at most four rows, or one number, or two columns. A frame that needs a fifth row
  is two frames.

## 7. Motion

Calm and mechanical: rises and fades, hairline wipes, counters. No bounce, no overshoot, no glitch,
no glow. Entrance 20-24 frames, exit 12 frames. Every sentence moves something; after the entrance,
hold with a wipe, a counter or a 1.0 -> 1.03 push. Frame budgets and the still-frame rules are in
`composition-and-light.md`.

## 8. Contrast pairs

`examples/paper-contrast/` shows the four rules as BAD/GOOD pairs: one focal point, density (rows
breathe), accent dosage (current step only), type scale (three sizes, not one). Read them before
composing a shot.
