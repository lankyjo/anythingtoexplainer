# Lessons and root causes (each one is a real rework; append new lessons after each film)

## Build artefacts (best practice)

- `public/` holds only this film's assets (template 18MB, bundle ~38MB). Render stills only through
  `scripts/still.sh`, one fixed tag per group, and `rm -rf build_dev_<tag>` after code changes.
  Never call `npx remotion still src/index.ts ...` directly (it leaves a temp bundle in $TMPDIR).
- Background scripts always use absolute paths (the shell cwd drifts).

## Storyboard writing

- "Stays 2 frames then hard cut" gets read by both sides as "I stay still, you enter on the beat" ->
  6-8 empty frames at the join (5 places in one film). Write "A fades to zero over its last N frames;
  B enters from its first frame".
- Exits before a hard cut must reach zero: a 6.7%/frame fade still shows 40-57% on the last frame
  and snaps. Use `1-(n/N)^1.5`.
- A slide-up with delta ~300 crosses y637-690 when subtitles are on (6 places in one film). Use
  delta <= 120, or a sideways slide plus a fade over the first 6 frames.
- Do not stagger entrances with a loud emphasis (five capsules flashing randomly reads as dropped
  frames); stagger a slide+fade instead.
- The accent word is written in exactly one cell per shot; otherwise build agents accent everything
  (102 places in one film - rejected by the user).
- Storyboard coordinates are reference values; build groups may adjust to the safe areas, but the
  example copy, colour meaning and primitives are binding.

## Chrome and structure

- The ending fade must sit above the content (end of the SHOTS array or aboveBar); otherwise the
  last shot disappears when its own Sequence ends.
- Exit animations need enough frames: an 8-frame exitAccel(1.2) travels only 59px at 63% brightness
  before the cut; 12 frames at 440px with opacity to zero is clean.
- HUD entries in one chapter must have no gap (extend the previous to next from-1); fade the last 8
  frames before a chapter card; keep HUD word changes 4 frames away from a large content event.
- Rails fade out over their last 8 frames, never vanish in one frame.
- Per-group preview compositions (chrome + this group's shots) let build agents see how the HUD and
  rail relate to their content.

## Code

- Keyframe first-value trap: `kf` returns the first value below the first key; entrance tables must
  start with `[shot start frame, off-screen value]` or elements sit in frame early.
- Draw-on marks such as Check/Cross must return null at p=0 (linecap leaves a dot).
- Colour mixing must parse both `rgb()` and hex (nested parsing produced NaN and made 25 cards
  invisible).
- Blur with sigma < 0.8 does nothing in Chromium; `feConvolveMatrix` runs on the CPU at 0.13 fps;
  SVG filters need `colorInterpolationFilters="sRGB"`.
- CJK line boxes push ink 3-7px below `top`; centred CJK text pre-compensates (dy -2..-5). Latin
  needs no compensation.
- Minimum type 22px (QC measures ink height); superscript citation marks may be 20px.

## Voiceover and timeline

- Never change words after approval: shot code hard-codes frame numbers. Re-word first, then
  re-align everything.
- TTS word boundaries sit within about one frame of the audio onset; when detecting onsets, do not
  let the window reach into the previous sentence's tail (it reads 15 frames early).
- Joining `|` blocks back into a sentence needs the space between blocks; the block-start cursor must
  skip that space too.

## Multi-agent

- One heavy task per agent (a 5-7 shot build / one chapter of QC / 1-2 groups of fixes); a second
  task should be light. An agent that has read many images and then gets a heavy task dies of
  "input too long" about 30% of the time.
- An agent killed by an API error usually wakes with one message; if not, stop and re-dispatch.
- Build groups make reasonable deviations (different example copy, fuller names, topology changes,
  fewer frames); approve anything with a source in one line and record the ruling in BUILD_NOTES.
- QC reads luminance in int32 (int16 overflows to all zeros).

---

# Film 2, "eCPM and ad auctions" (2026-09-07, 48 shots / 4'16") - new lessons

## Beats and readable time (the two most systematic defect classes)

- **Source notes must not hang off the last subtitle block.** The storyboard put them on the final
  beat, so 40-70 character grey notes held 50%+ alpha for only 0.97-1.7 s - unreadable, including a
  correction that stopped viewers misreading a formula as the current definition (QC: high).
  **Criterion: a source note needs >= 2.5 s (>= 75 frames) at >= 50% alpha inside its shot; attach
  it to the shot's 1st-2nd subtitle block** (it is background, it does not follow the voice).
  All 8 cases were reworked.
- **The first 8 frames of `[sentence from-8, sentence to+2]` are entrance budget - use them.** If the
  first elements wait for the block start, the shot opens empty; at group boundaries (previous shot
  already at zero) this stacks into 11-16 fully black frames. 9 shots hit this. **First elements'
  f0 = the shot's first frame.**
- **A late-beat animation overflows the shot end.** The last block to the shot end may be only 20
  frames; a 22-frame slide-up or a 14-frame Cross does not fit - the film shows an element missing
  for the whole shot and suddenly full on the next shot's first frame. Compute the remaining frames
  per shot at dispatch time.

## Fades and the first frame

- `fadeIn(n, len)` returns 0 at n=0, so using it for a shot's first frame always leaves one empty
  frame. Use `softOp` (first frame ~25%).
- Subtler: `softOp(0, 8)` = 25%, and a white stroke at 25% has luminance 65, below the "> 70" empty
  criterion - use `softOp(n+1, 6)` (first frame ~57%) when the first frame must measure. A purple
  stroke `#A175F1` (luminance 144) at 43% alpha is 62, also unmeasurable; use a white stroke or a
  higher starting alpha.
- Do not wrap a component that already ramps opacity in another `fadeIn` (double fades dip for a
  frame at transitions).
- Never render the same element twice (one steady + one flashing): the steady copy hides the flash
  entirely. Either use a single instance with `glitchOpacity(n)` multiplied in, or hide the steady
  copy during the flash window.

## Fact compliance for numbers

- **Intermediate values of a counter are on-screen numbers too.** A year counting 1995 -> 1998 makes
  1995/1996/1997 readable for 4-6 frames; milliseconds 0 -> 120 flashes `37 ms`/`88 ms`; eCPM
  0 -> 30 flashes `8`. None are in the fact list. **Rule: if an intermediate value looks like a fact
  but has no source, make it unreadable or do not count.**
- Making years unreadable needs commitment: blur `6.3 -> 1.3px` leaves middle years readable;
  `12 -> 2px` still shows the second-to-last year for about 2 frames; only **`12 -> 9px` (>= 9px for
  the whole roll) plus zero on the settle frame** is clean. Packaged as `YearRoll`.
- **An illustrative calculation must agree with every other label in frame.** Two failures: a
  "this second +2405" counter directly above a grey "billions per day" note (30x apart), and a value
  bar whose 8th bar computed to ~34 while the frame labelled it "~1/5" (should be 24). **Check every
  self-made calculation in the storyboard before dispatch.**
- One more scan: **statically extract every on-screen literal from the source and reconcile it with
  the fact list.** Pixel QC only sees sampled frames; the source scan covers all 8 groups at once and
  caught the counter that four QC passes missed.

## Fonts (classic pack)

- `Orbitron[wght].ttf` lacks `¥` (U+00A5), `!=` (U+2260) and `~=` (U+2248) (verifiable with
  fontTools). Keep the fallback chain (`'Orbitron','Audiowide'`) - Audiowide is geometric and its ¥
  matches Orbitron's digits; falling back to Noto looked worse. Use `FONT_HEAVY` for `!=` / `~=`.
- Orbitron's slashed zero is fine inside multi-digit numbers but reads as an icon when a single `0`
  stands alone ("0 clicks" read as "Ø clicks"). **A lone `0` uses `FONT_HEAVY`; `1`-`9` are
  unambiguous.**
- `Counter`'s default family was `FONT_HEAVY`, not Orbitron, contradicting the style guide - four
  groups reported it and each built its own. Default changed to `FONT_ORB` with a `family` prop.

## Primitives and layering

- **Verify the geometry of rotating primitives before drawing.** A gavel icon had the head 76 units
  above the pivot and the block 101 units below - the head's radius exceeded the pivot-to-target
  distance, so any small rotation swung the head in an arc that could never reach the block (the
  head's centre moved upward, y 507 -> 499). Not a parameter problem. Correct shape: the struck
  object lies horizontally above the target, the handle is vertical, the pivot sits at the handle's
  top.
- **Do not park a struck pose at contact.** With `angle=0` meaning "handle vertical, head pressed on
  the block", holding it reads as a rubber stamp. Return to -18..-24 degrees after the strike.
- **Do not put a draw-on cross/check and an arrow in the same `<Svg>` when it must sit above a
  card.** If that `<Svg>` precedes the card component, the card's fill covers the cross - it looks
  like the cross never appears and is easily misdiagnosed as a timing bug. **Any mark that must lie
  above a card needs its `<Svg>` after the card.**
- When a primitive draws `title` above the card, say so in a comment or rail chapters will collide;
  a label drawn at `cy = h-8` lets 18px CJK ink sit on the card's bottom border.

## Chrome

- **The progress bar's current-chapter highlight switches at the chapter-card start, not the first
  sentence.** Otherwise the card announces chapter 02 for 45 frames while the bar still highlights
  chapter 01.
- **Do not switch the rail's current step with a 1-frame flip**; it contradicts the "HUD words fade
  over 8 frames" rule. Add a 7-frame crossfade.
- A rail's entrance rise must be <= 22px: a 40px rise pushes capsules down to y184, breaking the
  "rail chapters keep content out of y<175" contract.
- The ending fade's frame count decides how long the final black is: 20 frames leaves 11 black
  frames; 10 frames leaves 19-21.
- **The ending fade's start frame eats the last shot's closing action.** With `endingFade=30` the
  fade begins 30 frames before the last sentence ends; a closing action placed after that is
  invisible. Schedule the last shot's action before the fade, or reduce `endingFade`.

## Multi-agent

- **Sessions have a hard limit and it is shared machine-wide.** 13 other sessions were running; the
  8th build group failed with `respawn pane failed: fork failed: Device not configured` twice and the
  main session had to absorb a whole 6-shot group. **Check machine load before dispatch; keep 1-2
  slots for QC/fix rounds; stop finished agents promptly.**
- **"Append as you check" is a hard requirement for QC agents, not a suggestion.** One QC agent
  saved everything for the end, ran an hour with zero output and stopped answering; re-dispatch it
  with the main session's findings and let it do QC + fixes together - faster.
- **Do not copy an agent's self-assessment.** Spot checks found one group's "middle years unreadable"
  was wrong (the render was readable) and another report that looked inconsistent was actually
  correct. **Spot-check reports, but do not assume the agent is wrong - look at the whole evidence
  first.**
- **Build groups find storyboard errors; encourage it and rule quickly.** The three most valuable
  improvements came from build groups: a value-bar formula contradicting its label, the year-roll
  fact gap, and their proactive decision not to count milliseconds. Promoting a fix to a film-wide
  rule beats approving a one-off.
- The main session should keep **checks that complement QC**: static frame coverage (ranges, holes,
  overlaps), source literals against the fact list, accent-event counting in source. All three run
  in seconds without rendering and catch what pixel QC cannot.

## Style transfer (2026-09-08 retrospective: skill film vs the RAG sample)

- **The skill wrote prohibitions, not taste drivers.** Safe areas, whitelists, zero-exits and beats
  transferred (the new film was even more disciplined), but "how big, what carries the light, how a
  hero moment is staged" lived only in the sample maker's head -> median hero height 172px vs 219px,
  29% of the time with the largest object below 110px, heroes as unlit white outlines, hero moments
  as "capsule + icon + one line". Fix: `composition-and-light.md` hard rules + hero-size and accent
  columns in the storyboard + the hero-moment list.
- **Nobody read the sample source.** Eight BUILD_NOTES files mentioned `shots_src` zero times and the
  light-effect primitives stayed inside the sample's group files, so a new group reinvented them.
  Fix: promote the effects into the template; the pattern table names source paths and the build
  prompt says "must read" instead of "can reference".
- **QC only checked defects, not "empty / small / dim".** Four QC rounds passed while the film stayed
  small and dark. Fix: `scripts/frame_metrics.py` measures hero height, accent area and fragment
  counts, wired into QC and the final check.
- **The docs themselves suppressed camera movement**: an older build-rules said "mostly static
  shots", and both films ended with 2.2-2.5 moves per minute and zero pushes, while the style
  reference ran 6.6 per minute at 16 frames average. Fix: a camera wrapper + the >= 3 moves per
  chapter budget + the storyboard camera list.
- The two films had almost identical motion counts and total glow (0.47 vs 0.56 change per frame,
  72 vs 76 events per minute) - **the gap was not "more motion"**; do not fix it by adding effects.

---

# Film 3, "Cinematography" (2026-09-08, 50 shots / 4'00", after one QC round high 0 / mid 0 / low 14)

## When the topic itself is geometric: build a real one, do not fake it with CSS

- The film's central claim was "perspective depends only on camera position, not focal length". **A
  CSS `scale` fake makes a push and a zoom look identical, which makes the whole chapter wrong.** So
  a real pinhole projection was implemented (`project3` / `FrameScene` / `camOrbit` /
  `camDollyZoom`): push changes only `cam.z`, zoom only `cam.f`, pan only `cam.yaw`. QC verified
  pixel by pixel: two frames had equal figures (275/275px) but doors 197 vs 158px (20% apart), and
  the figure stayed 164px while the back wall went 506 -> 360px. **The claim was proven by the
  picture, not asserted by the narration.**
- General rule: **whenever two things "look alike but differ" (push vs zoom, tilt vs rise, a real
  long take vs a fake one), the underlying mechanics must actually differ**, or the viewer sees the
  same two images.
- The cost: real projection brings a new defect class (empty frame, objects leaving the frame,
  figures leaving the safe band).

## Before dispatching 8 agents, probe the shared system

- A one-frame-per-state probe (`_probe.tsx`) rendered 8 camera states into 8 images. **It caught two
  problems that would have broken all 8 groups**: at `pitch=-22` the frame was almost empty (the
  figure was 180px inside a 332px frame, one pitch step swept it out), and at the default
  `personZ=520` the figure and back wall were 165cm apart, so a push vs zoom differed by only 12% -
  invisible; moving to `personZ=320` gave 26%.
- **Probe cost 10 minutes; the rework would have cost 3 groups.**
- The probe's output became a measured "camera parameter" table in the storyboard (`cam.z` -> figure
  screen height, safe band 150-300px) so groups start from numbers.

## Cross-group consistency: put constants in the shared layer, do not make agents align

- v1 initially had "G6 builds the matrix, G7 reuses it" and "G5 reuses G3's spacing labels" - G7
  needed a cross-group import, G6 and G3 each kept a parameter-copied `PinCross`, and changing G3
  changed G5.
- The better way (used later): the main session **puts cross-group shared things into `ui.tsx`
  first** - layout constants, bounding boxes computed with the same projection, `ACTION_WORDS`,
  `softOp` / `exitZero` / `mix` / `Vignette` / `MarkBox`. Eight groups import them; consistency is
  automatic.
- The concrete form of the lesson: **`softOp` was written by four groups with four different
  formulas.** Repeating "use softOp, not fadeIn" in the protocol while not providing it forces every
  group to invent it. **A tool named in the protocol must actually exist in the shared layer.**

## A "clear frame -> light sweep" opening can itself read as an empty frame

- Both "high" items in v1 were this shape: a claim-type hero moment whose first 79 frames held only
  a stage line and one thin sweep band (largest object <= 46px), and another whose first 66 frames
  were five inactive dark boxes and one capsule.
- `composition-and-light.md` section 6 exempts "sweep / stage-light phases" at >= 10000px2 glow, but
  **one sweep round measured 5004px2** - so a by-the-book clear opening tripped the empty criterion.
- Two fixes, best together: (1) **three sweep rounds** and a doubled stage-line radius, reaching the
  exemption; (2) **give the first beat a temporary hero** (carry the previous shot's headline in at
  120px, or make the beat's key word a 96px headline and shrink it on the next beat).
- General rule: **for entrance/claim hero moments, compute the largest object over the first 60-80
  frames explicitly**; do not assume "clear frame + light effects" passes on its own.

## Ending fade vs the last subtitle block: compute it twice

- The lessons already had "the ending fade eats the last shot's action"; this film hit its upgraded
  form: **the film's conclusion headline was fully readable for only 6 frames (0.20 s).**
- Three causes stacked: the last block started at f7067, a 12-frame entrance (7 of them dark), and
  the fade from f7085. Of an 18-frame window, 6 were readable.
- **Criterion: `(S_last.to - endingFade) - last block start >= 30 frames`**, or the conclusion
  cannot be read. A 12-frame entrance is half dark, so budget double for a closing headline.
- Fix: move the **whole sentence** conclusion to the second-to-last beat (f7043) and let the last
  beat carry perceptible change through motion (denser ring ripples, an accent pulse, a stroke
  fading in). **The moved landing point must not sit on a flash frame** - the proposed f7040 was the
  first frame of a camera flash.
- Compute this table at dispatch time for the last shot: last block start / fade start / flash frames
  in between / effective readable frames.

## Transform scaling takes font size down with it

- Ten action capsules were scaled to 0.72 for a carried displacement: 26px text became **18.7px**,
  under the 22px floor. Pixel QC cannot see it (it measures ink height, and 18.7px CJK ink is ~14px,
  easy to dismiss as a small label); a build group computed it and reported it.
- **Rule: wherever a group is scaled/transformed, multiply every font size inside by the factor and
  check the 22px floor.** Fix the source size (26 -> 31, so 31 x 0.72 = 22.3), not the scale.

## Split layouts: both halves must be the same camera

- The main layout was "top-down plan on the left, viewfinder on the right". In v1 the plan drew the
  door on the left wall while the viewfinder had it on the back wall - contradictory, and the plan's
  frustum did not contain the door at all.
- Cause: the plan's anchors were hand-written to look good, while the scene was written from world
  geometry; they were never reconciled. Fix: derive the plan's door position from the scene.
- Know the cost: **making the plan a strict projection moves every group's calibrated frustum
  angles.** This film fixed the low-risk half and declared the rest a schematic in the delivery
  notes. **Either do this before dispatch or admit it is a schematic.**
- The same class: one primitive's default colour was purple, one group passed grey, another used the
  default -> chapter 3 had two different frustum colours, and it was the main cause of a "purple
  fragments >= 8" flag. **Defaults must follow the rules (secondaries unlit -> neutral grey); style
  must not depend on whether a prop was passed.**

## Scene geometry must be designed for the most extreme camera move

- The scene initially had only a back wall reaching x=+/-440. Large yaw (|yaw| >= 8 degrees),
  orbits and pans exposed pure black at the leading edge - one group had to cut its whip from +42 to
  +22 degrees, another its yaw difference from 60 to 26, while a third needed a 55-degree orbit
  (the back wall covered only 61% of the frame).
- Adding two side walls (drawn in segments with per-segment visibility, degrading gracefully behind
  the push) saved three groups at once, and their perspective convergence became the best evidence
  of parallax.
- General rule: **design scene geometry for the most extreme camera move**, not for the default
  framing. List every camera angle and displacement before dispatch and ask what each frame edge
  shows at that angle.

## Multi-agent (this film)

- **The session limit was hit again, earlier**: 14 other sessions running, and the 5th agent failed
  with `respawn pane failed: fork failed`. **Dispatch in waves of 4, stop a wave before the next;
  check machine load first.**
- **Two QC agents were killed by API errors** and both woke with one message. **But waking only
  preserves what reached disk** - hence "append as you check" is a hard requirement: one agent ran
  46 minutes with 0 bytes.
- **Quantitative QC beats "looks OK".** The most valuable output was two sets of pixel readings that
  turned "the claim holds" into reviewable evidence.
- **QC corrects the main session's fixes.** The proposed fix for the closing shot was directionally
  right but QC found the landing frame sat on a flash and the icon's entrance crossed the headline;
  its three-line correction was better.
- **The main session's static checks (`scripts/selfcheck.py`) are worth keeping every film**: frame
  coverage, accent whitelist counting in source, on-screen literals against the fact list. Seconds
  to run, and they catch what pixel QC cannot. **Write the noise filter well** (drop import paths,
  CSS values, camelCase identifiers) or nobody reads the output.

## One-minute film "Agentic RL" (2026-09-09)

- A newer edge-tts defaulted to sentence boundaries while the old script only collected word
  boundaries, silently leaving an empty list and degrading subtitles to character estimates. (Edge is
  retired; the lesson stands: check that word-boundary data is non-empty, and fail loudly rather than
  pretending to be precise.)
- After shortening the chapter gap, the "gap < 30 frames means same chapter" HUD rule let the
  previous chapter's capsule cover the next chapter's card. Compare sentence chapter numbers instead
  of guessing from gaps. The progress highlight must track the chapter card.
- A 40-frame title needs its own motion budget; do not cram a long-title's glitch, subtitle line and
  push into it.
- `mktemp` directories with a dot suffix are rejected as output extensions by Remotion 4.0.507; use a
  dot-free template like `explainer_test_TAG_XXXXXX`.
- Ring graphics and labels need magnified frames: contact sheets hide a white ring touching white
  text. This film moved ringed chip labels down 25px.

---

# Film 4, "The AI Systems Performance Engineer" (2026-09-10, English, 48 shots / 5'07", 9 groups, one QC round high 0)

## English pace and pronunciation

- **kokoro `am_liam` at speed 1.0 measures ~2.3 words/second (2.25 in prose, 1.4-1.8 in
  abbreviation-dense sentences), not edge-tts's 2.96.** A 5-minute English film is ~640 words / 48
  sentences; writing 700+ words overruns to 6'17". Synthesise the full draft once and read the
  `speech=` figure before settling the length (this film cut 733 words to 642).
- Kokoro spells out CUDA / NIXL / MIG / DeepGEMM letter by letter and reads v5.0 as "v five zero".
  The `[word](/ipa/)` override syntax works and is now the `PRONOUNCE` table in `tts_build.py` (it
  changes only the TTS text, not the subtitles). Ask the researcher for the full abbreviation list
  and dump phonemes before synthesis.
- **Noto Sans SC's curly quotes and ellipsis are 1em full-width glyphs**, leaving a big gap in
  English; use straight quotes and three periods on screen.
- `Pill`'s default `textDy` of -2 is CJK baseline compensation; English films follow `TEXT_DY`.

## "Enters and stops" is a defect: verb-driven sustained motion

- The user's first reaction to a 30-second sample was not style but "can the motion describe this
  passage more richly". Measured: 4 of 6 shots held 42-72% still frames with a 2.8 s longest hold;
  the one hero moment that moved throughout looked clearly better. **The sample had the same
  weakness, so "match the sample" cannot catch it.**
- Rule (user ruling, now storyboard global constraint section 9): every block's verb has an action
  lasting to the next beat; nothing fully still for > 30 frames after entrance; shots without
  another camera move get a 1.0 -> 1.05 push. Boundaries unchanged (one hero, one accent event, no
  debris). Measured: content area 320x180, mean gray change below 0.35 is a still frame; still
  <= 40%, longest <= 1 s (`scripts/motion_check.py`).
- **Group-level detection (low-resolution render) is lenient; the finished-film `fin_frames` pass is
  the verdict**: v1 passed 48/48 at group level and failed 11 shots full-resolution (3 truly still,
  8 small-area motion - packets, cursors). Group renders now use 0.5x + JPEG q80, and `--frames`
  mode adds a full-resolution changed-pixel column distinguishing true still (< 800) from small-area
  motion. Fix small-area motion by **increasing amplitude** (brighter, larger, denser motion
  elements; hero breathing +/-2% over 30 frames), not by adding elements.
- A 1.05 push contributes almost nothing to a 320x180 sample; it is a "constant motion layer" for
  the viewer, not for the metric.

## Shared layer: build cross-group pieces into `ui.tsx` before dispatch

- Before dispatching G1, a probe rendered 8 topic primitives in one frame pass; zero rework. The
  running example's `ProfilerPanel` (plus row constants) went into `ui.tsx` before G3/G4 dispatch,
  and shared cursors plus `glowIdleK` followed.
- **A tool named in the protocol must exist in the shared layer** (film 3's lesson repeated): G1
  rebuilt softOp / exitOp / glowOffK / mixHex / GlowBlob / Vignette; the main session promoted them
  before G2 and later groups had zero duplication. But camZoomAbout / ArrowPulse / LLMIconLive /
  FilmPanel were still written 3-4 times each - **promote them into the template before the next
  film.**
- `mixHex` returned `rgb()`, and feeding that back produced `rgb(NaN)` with no error (strokes
  silently vanished). Either accept `rgb()` input or return `#hex`.
- A `TimelineBar`'s idle glow was clipped inside an `overflow:hidden` container; glowing children
  must sit outside the clipping container. `TiltPlane`'s children get flattened by `scaleY(.5)`;
  text and icons must be placed upright on the plane.
- A `Vignette` starting at y0 dims the HUD capsule; a bottom band reaching 720 dims the translucent
  progress bar. The template now uses y100-200 / y560-687.
- A `CodeCard` tag at 16px is below the 22px floor; four groups used it before QC caught it. **Shared
  primitives must respect the 22px floor too.**

## Camera and safe areas

- After a 1.05 push around (640,360), content must stay inside **x 89-1191 / y 122-607**; a 1.25-1.3
  push scales proportionally; a layout that fills the width (a panel from x190 to x1090) should skip
  the push. Capsules must not scale with their group during a carried displacement (font size drops
  below 22 or the capsule becomes too wide) - interpolate geometry separately.
- **Camera moves should end before the beat, not start on it.** "No new elements during a move" only
  binds elements outside the moving layer: a capsule travelling with a rigid group may fade in
  during the move.
- A carried displacement spanning two shots must make its push continuous (1.0 -> 1.02, then
  1.02 -> 1.05), or the boundary frame jumps.

## Chrome

- **The progress bar's current-chapter highlight switches at the chapter-card start** (the template
  now does this: previous chapter's last sentence to+3).
- A 42-character tagline was fully readable for only 13 frames of a 77-frame title; it now starts
  earlier, and an `EndCredit` card was added after the last subtitle (aboveBar, ~56 frames at full
  opacity). The progress bar must not float alone on a black film: the ending fade now covers it.
- The credit card must start after the last subtitle's `to` (an early version overlapped the last
  subtitle and the last shot's remains for 20 frames).

## Multi-agent (this film)

- With 13 other sessions running, dispatching 9 build groups + 4 QC + 4 fix agents in waves of 4
  never hit the session limit; every agent was stopped on completion.
- One build agent was killed by ENOTFOUND after SC02 but had already written through SC06 on disk -
  **check the disk before deciding to re-dispatch or wake**; one message woke it.
- The most valuable build-group reports were still **errors in the storyboard itself**: coordinates
  outside the canvas, contradictions between carry-over and zero-exit, capsules too small for their
  text, source notes at 20px, beats conflicting with camera moves. Nine groups reported 40+ items;
  nearly all were approved. **Estimating text width with `textW` at storyboard time halves them.**
- `test_render.sh`'s mktemp template with a dot was rejected by Remotion. **Template bugs written
  into lessons must be fixed in the template immediately.**

## Final check and wrap-up (film 4)

- **A "missing flash" verdict needs a frame check**: a fixed-box luminance measurement of a moving
  element flattens the flash. Following the bounding box showed the element really was dark on two
  frames. Rendering four stills beat dispatching a fix.
- **HUD word changes need more than a fade**: a single entry switching with a hard cut and a capsule
  restarting at 25% leaves one blank frame. The template's `Hud` now keeps the capsule, transitions
  its width over 10 frames, fades the old word over 6 and fades in the new one.
- **Group-level motion_check passing does not mean the film passes** (above), so the full-resolution
  pass is mandatory.
- Wrap-up order: v2 recheck + final check in parallel -> the main session does v3 small fixes itself
  -> render v3 -> the main session numerically spot-checks only the changed frames instead of
  dispatching more QC.

---

# Film 5, "Frontier AI, September 2026" (2026-09-18, English, 33 shots / 3'02", 6 groups, fully inline in the main session, one QC round high 0 / mid 0 / low 17)

## Inline build (no sub-agents): the process worth keeping

- With an unstable network and repeatedly interrupted sub-agents, an inline main session completed
  all 33 shots: **write group by group -> tsc -> Read sampled stills -> `motion_check <Gn>` -> next
  group**; each group cost about 15 minutes and rework stayed inside the group. At the end,
  `selfcheck + frame_metrics + motion_check --frames` still found four classes of problem (below).
- When inline, sample **problem frames** rather than even ones: the first frame of each new
  primitive (soft entrance, accent landing, counter start) and the boundary frames after a layout
  change, one or two each; add contact sheets at QC time.

## Known false positives in the measurement scripts (QC looks at frames before dispatching fixes)

- **`frame_metrics`'s "accent fragments >= 8" systematically false-positives on orderly matrices and
  ring scales**: a crowd matrix (27 blocks), a 7-tick week ring (9 blocks) and an 8x4 bubble matrix
  (10 blocks) were all counted. The criterion itself says matrices are not debris; QC decides by
  frame.
- **"Hero scale < 170px" systematically under-reads single-line headlines**: under min(w,4h)/2.5, a
  one-word display headline (0.72-0.79em cap height) almost always reads low. Either accept the low
  flag or pair the line with a >= 170px shape - do not just raise the font size (width hits the 1220
  boundary first).
- **A counting shot starting at "0" always trips Orbitron's slashed zero**: the general fix is
  `family={val === '0' ? FONT_HEAVY : FONT_ORB}` inside the counter template.

## Idle windows (before an entrance / typing / counting) are the main full-resolution failure source

- Two shots with 1.4s and 1.1s idle windows read 2% / 0% at group level but failed full-resolution
  (1385 / 2069 changed pixels). **Fix by giving the window a full-width scan band and a larger
  waiting dot or light band (more amplitude), not more elements**; fade the scan band with
  `sin(pi*t)` on a 45-70 frame cycle.
- Swapping a counter's entrance for an emphasis makes the number appear only on the beat and opens
  the shot empty. Correct: **a single instance with `softOp(n,8) * glitchOpacity(N-C)`** - it appears
  early and is emphasised on the beat, and `selfcheck` still counts one event.
- Counting shots that start at 0 need the `family` fix above.

## `selfcheck`'s whitelist parsing is format-sensitive

- The regex expects `**Flash whitelist**: SC01 ...` on one line. A different shape silently parses as
  0 entries and every event is reported as an error. **Write that line, punctuation included, into
  the storyboard template.** (The parser now accepts any text after the colon on that line.)

## English length and voice

- kokoro `am_liam` measured 2.19 words/second here (355 words / 161.8 s of speech); with gaps the
  film averaged ~1.95 words/second. A 3-minute film is **350-360 words / 33 sentences**. Dense
  abbreviations still slow it down; **synthesise once and read `speech=` before settling**.
- Measured headline widths: Orbitron ~0.82em per character, Audiowide ~0.79em (including letter
  spacing). An 11-digit number at 100px is ~900px wide and, centred at x400, crosses the left
  boundary; a 12-character Audiowide line at 110px is ~1100px, already at the 1220 boundary.
  Multiply every headline at storyboard time.

---

# Film 6, "How noise-cancelling headphones work" (2026-09-23, first film on the rewritten pipeline, 13 shots / 56 s, one build pass inline)

- **The 1-minute tier was missing from SKILL.md.** A user asked for 1 minute; the table started at
  2-3. Added: 100-130 words, 11-15 sentences/shots, 1-2 build groups, ~20 minutes. The first draft
  came out 18% short and two sentences were added (the rule already said >15% off -> adjust).
- **Every shot needs one continuously moving element, not just entrances.** SC07 looked fine frame by
  frame and passed the composition metrics, but motion_check caught a 1.2 s static stretch after the
  frequency bar finished wiping (80% still frames). Adding the reading rule fixed it. In Paper that
  rule is now written into the pack guide; treat it as part of the grammar, not a hack.
- **Read stills at every beat, not just the first frame.** Two layout defects survived the code
  review and were only visible in stills: two labels landing on the same baseline (SC04 `trough` /
  `zero`) and a headset band floating away from its cups (SC12). Both were one-line fixes before the
  final render.
- **The metric agrees with the eye when the design is right.** Final numbers for the film:
  frame_metrics high 0 / mid 0 / low 0, motion_check 13/13 - the first film on this pipeline to hit
  zero composition flags, and the run took about 40 minutes including research.

## Objects are not diagrams (2026-09-25, from user review of film 6)

- The film explained noise-cancelling headphones and never showed a headphone: waves, rings and
  hairlines carried every beat, and the one "microphone" was a rounded rectangle. The user's verdict
  was blunt and correct: "I did not see one proper SVG of a headphone."
- **The failure was not drawing skill, it was vocabulary.** The packs shipped abstract primitives and
  nothing else, so every topic got abstracted into the same grammar. Fix: `reference/drawing-objects.md`
  plus a real kit - `project3` / `Wire` / `Box3` / `Cylinder` / `Poly` / `SOLIDS` / `Marks` in
  `common/draw.tsx`, and `Headphones` / `Mic` / `Person` in `common/objects.tsx` - and a rule in
  SKILL.md stage 4: if the narration names a physical object, draw the object.
- **How to get detail without hand-written paths**: parameters and loops (a colonnade is `count`
  columns, a crowd is a seeded `Marks` call, a solid is vertices + an edge rule). The token cost of a
  complex SVG is a function of how many *parameters* it has, not how many points.
- **Verify recognisability at final size**: render one still and name the object without reading the
  caption. If you cannot, an identifying detail is missing (the headphone needs band + cups + pads;
  the mic needs capsule + grille + basket).
- Re-render after the fix: same film, same timing, QC unchanged (0/0/0, motion 13/13) with the
  objects in - richer frames did not cost a single composition flag.
