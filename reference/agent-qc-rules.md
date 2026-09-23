# Finished-film QC protocol (original film: judge against the storyboard and the style guide, not against the source)

> Replace `<project root>` with the absolute working directory; vN is the version; Cn is the chapter.

Inputs: finished frames `<project root>/fin_frames/f_%04d.jpg` (1-based), thumbnail sheet
`<project root>/renders/sheet_vN.html`, `<project root>/storyboard.md` (frame ranges / beats /
visual intent), `<project root>/script/timeline.md` (subtitle block frames), the skill's
`reference/style-guide.md` and `reference/motion-vocabulary.md`, `<project root>/research/research.md`,
and each group's `<project root>/src/shots/Gn/BUILD_NOTES.md` (known degradations are not re-reported).
Output: `<project root>/qc/qc_vN_Cn.md`, **append as you go**. Each row:
`| severity high/mid/low | shot | frame | symptom | criterion | suggested fix |`.

> English films add two checks: a subtitle wrapped to two lines (the block exceeded the 48-character
> budget and pushed into the content area) -> mid; a progress-bar chapter name or chapter-card title
> shrunk until it looks weak -> low, shorten the name instead.

## What to check (by priority)

1. **Readability / occlusion**: text covered or touched (< 10px) by the subtitle band (y637-690),
   progress bar (y687-720), HUD (y28-100) or rail (chapters 2 and 3, y112-160); text overflowing the
   canvas; type below 22px; white text on white/light shapes; grey text unreadable on the backdrop.
2. **Beats**: key element appearance frame vs its subtitle block start (timeline.md): later than +3
   or earlier than -6 is mid; a whole sentence with no corresponding visual change is high. Check
   frames -6, 0, +3, +8 around each block start.
3. **Facts / spelling**: every on-screen English word and number checked against the research
   document; typos or inconsistent terms for one concept -> mid.
4. **Style consistency**: colours outside the pack tokens; wrong type (pack font missing); rule
   weight in the pack's range; corner style; accent overused (more than one large accent area in a
   frame); an opaque dark fill covering the backdrop.
5. **Joins**: adjacent shot boundary frames (each storyboard row's from/to): does anything vanish,
   jump or redraw between the two frames; group boundaries (G1|G2 ...) especially for HUD/rail
   overlap with content; leftover content before a chapter card.
6. **Animation quality**: three consecutive frames at three points per shot (mid entrance / middle /
   mid exit) for jitter, wrong direction, rigid easing (linear large moves), elements appearing from
   nowhere (first frame already at the end state), keyframe first-value trap (shot starts mid-state).
7. **Performance traces**: grey haze from over-blur or over-glow, gradient banding, jagged text edges.
8. **Composition and light** (`composition-and-light.md` section 6): run
   `python3 <project root>/scripts/frame_metrics.py --frames <project root>/fin_frames --storyboard <project root>/storyboard.md --out <project root>/qc/frame_metrics_vN.md`
   first, fold this chapter's flags into the report and confirm each by frame: hero under 110px with
   no large light activity for > 45 frames -> mid (< 80px -> high; sweep/light phases do not count as
   empty); median hero below 170 -> low; hero moment with no accent area on the hero -> mid; accent
   fragments >= 8 in one frame -> low; background clutter (small scattered shapes) >= 10 -> mid
   (orderly dot matrices false-trigger - confirm by frame whether it is a tidy matrix or random
   debris).
9. **Sustained motion** (`composition-and-light.md` section 7): run
   `python3 <project root>/scripts/motion_check.py --frames <project root>/fin_frames` first; judge by
   frame every shot above 40% still or 1 s hold: full-res changed pixels < 800 = truly still -> mid
   (name a move to add); 800-2500 = small-area motion -> low (increase its amplitude).
10. **Camera**: check the storyboard camera list item by item at first / middle / last frame: does the
    push stay around the hero, is it 30-45 frames easeInOut (linear or < 15 frames -> mid), is there
    an accent event or staggered entrance during the move (mid), do HUD / rail / subtitles move with
    it (high); fewer than 3 moves in a chapter -> low.

## How to look

- Read `sheet_vN.html` first for the whole film (one frame per 60), list suspicious shots; then per
  shot, look at single frames at each storyboard beat; then consecutive frames per sections 5-6.
- Read frames with the Read tool; use Python PIL for measurements (sum luminance in int32 - int16
  overflows). Do not modify any source code.
- Accent compliance (final check): plot luminance f0..f0+12 for element entrance frames in every
  shot; a 0/0.5/1 jump is a flash; the number of hits must equal the whitelist count.
- Give at least one conclusion line per shot (write "OK" too) so coverage is provable.

## Severity

- High: unreadable or occluded text, a whole sentence with no visual, factual error, a missing
  component the storyboard promised, an opaque fill covering the backdrop, an empty frame (hero <
  80px for > 45 frames), camera movement dragging HUD / subtitles.
- Mid: beat drift, style inconsistency, join jumps, spelling, hero < 110px for > 45 frames, hero
  moment without light, background clutter, rigid camera move or one overlapping an accent event.
- Low: fine tuning (spacing / alignment / brightness) and optional improvements.
