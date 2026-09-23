# Composition and light (visual-drive rules)

> This file answers "how big, what carries the accent, how is a hero moment staged". It was added
> after comparing two films frame by frame: motion counts, rhythm and total soft glow were nearly
> identical, and the whole gap sat in the rules below. Build groups read it after the pack guide;
> QC uses section 6.

| Metric (finished frames, content area) | Weak film | Sample |
|---|---|---|
| Mean change per frame / motion events per minute | 0.47 / 72 | 0.56 / 76 |
| Median largest-object height | 172px | 219px |
| Share of time with largest object < 110px for >= 1.5 s | 29% | 12% |
| Source light devices (halo / sweep / ghost) | 0 / 0 / 0 | 14 / 12 / 5 |
| Source skew / perspective / rotate | 1 / 0 / 4 | 7 / 1 / 15 |

## 1. Hero hierarchy: one hero per shot

- **A hero is required**: one object at least one third of the content area's height - a shape
  >= 170px tall, or a >= 96px headline/number with a line width >= 300px (a 96px line of two or
  three words cannot carry the frame; go to 110-150px or add a shape). The hero enters on the first
  or second beat; later elements arrange around it.
- **Three size tiers**: hero >= 170 / secondary 60-110 / labels and notes 22-30. At most four
  secondaries and six labels. There is no fourth tier.
- **Size quick reference**: phone mock >= 300x520 with a readable first row; human figure >= 96;
  server/database/document card >= 160 tall; book/exam paper >= 240 wide; formula main term >= 48px,
  result term >= 72px; years and big numbers 96-150px; chart card >= 440x300.
- **Naturally small subjects need a hero**: timelines, formulas, tables and pipelines are not big
  enough on their own. Pair them with a hero - a big number ("0.1 seconds" at 96px, not 34px), a
  highlighted current row (scale 1.15 plus the accent), or a magnified detail. A single line and a
  few 34px capsules holding 100 frames is a defect.
- **Show "many" as a matrix, not as debris**: use a grid of >= 6px squares or dots, ordered, lit on
  the beat. Never scatter small icons in the background. **The background is the pack backdrop
  only**; ambient elements dilute the hero.
- **Empty-frame criterion**: largest object < 110px for > 45 frames -> mid defect; < 80px for
  > 45 frames -> high.

## 2. The accent follows the hero

- **The hero carries the accent**: the hero gets the pack's accent treatment - an accent rule or
  tick, an accented word, an accented unit, or the pack's focus device (the classic pack used a
  purple glow or halo; Paper uses the coral accent on the current element plus a hairline ring
  target). White-line shapes with a soft bloom alone are not enough.
- **Secondaries get no accent**: capsules, rails, labels, table rows and notes stay ink/muted; only
  the current focus may take one accent treatment, at most one per frame. When the focus moves, the
  previous accent leaves within 8 frames.
- **Three levels**: structure (hairlines, ink) < accent (hero and current focus) < event (a 3-6
  frame flash or the accent landing). Use only these.
- **The accent moves**: when the focus activates, the accent arrives over 8 frames; before an exit,
  the accent leaves first (6 frames) and then the element fades - never cut with the accent still on.
- **Heavy numbers**: a >= 96px number always sits with its accent rule or accent unit; never let a
  bare number float on an empty frame.

## 3. Hero moments (set pieces)

One or two per chapter: the chapter claim, the hero's entrance, the closing payoff. The storyboard's
global section lists them; build groups stage them properly instead of reusing a normal shot pattern.

**Standard choreography (entrance type, >= 90 frames)**

| Relative frame | Action |
|---|---|
| T0 | clear frame: the previous shot has reached zero, only the backdrop remains |
| T0+4 / +22 / +40 | the backdrop motif scales in or a hairline rule sweeps (three staggered passes, 16 frames each) |
| T0+18 | the focus ring / target expands to its final radius, then breathes |
| T0+37 | the hero's outline appears faintly (10%) as a premonition |
| T1 (beat) | the hero lands: accent word or number enters with a short emphasis |
| T1+12 | emphasis pulse 1.03-1.11 |
| T1+16 | the subtitle line rises in |
| T1+24 | labels / split words fade in, staggered 2 frames |

**Variants**
- Big-number type: count to the value over 20 frames, with the unit in accent, one comparison
  object, and a conclusion that lands on the beat. Sample SC39 "1,000,000 tokens".
- Symbol type: the symbol slides up by <= 170px, a ring target draws on over 20 frames, and the
  conclusion headline lands in the accent. Sample SC44 "knowledge base = moat".
- Year/source type: a 96px year counts and settles, with an institution capsule and a paper/result
  card >= 240 wide beside it; a year may not stand alone on an empty frame for more than 30 frames.

## 4. Depth and carry-over

- Shots about space, hierarchy and indexes use stacked planes (skewed 2-3 layers, 90px apart, paths
  drawn on between them); filtering uses a funnel; rotation is reserved for gears, dials and
  turntables. An all-flat film is a defect.
- **Carry-over**: the previous hero shrinks and moves aside to make room for the new one (16 frames,
  easeInOutPow(2.5), down to scale 0.6) instead of disappearing and being redrawn small. Both shots
  share the same component and parameters.
- **Camera**: >= 3 whole-frame moves per chapter, at most one per shot, 30-45 frames easeInOut; HUD
  and subtitles do not move; do not overlap a move with an accent event or a staggered entrance.
  Budgets and frame counts: `motion-vocabulary.md` section on camera.

## 5. Build self-check (shot table in BUILD_NOTES, one row per shot)

| Shot | Hero | Hero height px | Hero's accent treatment | Hero moment | Secondary / label counts |
|---|---|---|---|---|---|

A row with hero height < 170 or "no accent" must state why. Empty-frame criteria must not appear.

## 6. QC criteria (with `scripts/frame_metrics.py`)

The script's hero scale = the height of the largest connected ink object; wide-and-solid objects (a
line of large type, a wide card) count as min(width, 4 x height)/2.5; letters of one line
(letter-spacing <= 40px) merge into one object; backdrop dots do not count. The classic pack's dot
backdrop is masked by its own grid coordinates, and sweep / stage-light / halo phases (content-area
glow >= 10000px2) do not count as empty frames; the hero median ignores those frames. The light
packs measure ink and accent fragments instead of glow.

- Median hero scale < 170 -> low; < 110 with no large light activity for > 45 frames -> mid;
  < 80 for > 45 frames -> high.
- Classic only: a hero moment with less than a 3000px2 glow patch on the hero -> mid; a normal shot
  with hero-region glow < 800px2 -> low (unlit hero). Light packs instead read the accent:
  >= 8 accent fragments in one frame -> low, meaning the accent is scattered over secondaries.
- Background clutter: >= 10 scattered shapes smaller than 60px (backdrop dots excluded) -> mid.
  **Ordered dot matrices (vector space, exposure wall) also trigger this rule and are allowed by
  design - QC judges by frame: regular and lit on the beat is a matrix, randomly scattered small
  icons are debris.**

## 7. Verb-driven sustained motion ("enters and stops" is a defect)

- Symptom: elements arrive on the subtitle beat and then sit still waiting for the next one, with
  only a glow breathing. It was the user's first reaction to a 30-second sample; measured, 4 of 6
  shots held 42-72% still frames with 2.8 s longest holds. The RAG sample had the same weakness, so
  "match the sample" cannot catch it.
- Rule: **whatever verb a subtitle block speaks, the frame carries an action that lasts to the next
  beat** (data flowing, a pulse running along an arrow, a line typing on, cells lighting in order,
  growth, rotation, a gate opening, a queue compressing); after its entrance **nothing is fully
  still for more than 30 frames** (a breathing glow does not count); a shot with no other camera
  move gets one 1.0 -> 1.05 push for its whole duration (counts as that shot's camera move; after
  the push the content must stay inside x 89-1191 / y 122-607). Boundaries unchanged: one hero, one
  accent event, backdrop-only background, no debris, motion serves the verb.
- Measurement (`scripts/motion_check.py`): content area (HUD / subtitles / progress bar removed)
  sampled at 320x180; a mean gray change below 0.35 is a still frame; per shot still <= 40% and
  longest <= 1.0 s (build groups aim for <= 0.7 s). **The finished-film `fin_frames` pass is the
  verdict**: group-level low-resolution readings are lenient (one film passed 48/48 at group level
  and failed 11 shots full-resolution). `--frames` mode adds a column for the full-resolution
  changed-pixel count inside the longest hold: < 800 truly still (-> mid, add an action), 800-2500
  small-area motion (-> low, **increase amplitude**: brighter/larger/denser motion elements, hero
  breathing +/-2% over 30 frames - do not add new elements).
- Storyboard: every shot's motion cell ends with a "continuous: ..." line; the global constraints add
  a section 9; the group BUILD_NOTES shot table adds "motion_check still% / longest hold" columns.
