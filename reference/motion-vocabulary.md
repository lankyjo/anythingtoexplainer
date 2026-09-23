# Motion vocabulary (n = N - f0, N is the film frame; all pure functions, randomness only via `rnd`)

## Entrance

| Name | Formula / component | Frames | Use |
|---|---|---|---|
| **Rise + fade (default)** | `opacity = clamp01(n/20)` easeOut, `translateY(26 -> 0)` | 20-24 | all text, labels, rows, HUD word changes, small icons |
| Accent word landing | the hero element arrives on the beat with a short scale settle (1.04 -> 1) | 12 | the shot's one accent event |
| Slide in from below | `top = yEnd + delta*(1-n/22)^2.5`, **delta <= 120**, with a 6-frame fade | 22 | cards, shapes |
| Sideways slide | `left = xEnd - delta*powOutRemain(n,18,2.5)`, delta 260-320 | 18 | elements coming from outside the safe area |
| Scale in | `scale = scaleIn(n)` (cubic-bezier(.1,.1,.35,1)) | 21 | icons, balls, cards |
| Stagger | element i starts at f0 + i*2 | 2 each | lists, card arrays; never stagger accent events |
| draw-on line/arrow | `<LineArrow p={clamp01(n/20)}>`, arrow grows from the root | 16-28 | connections, pointing |
| draw-on shape | SVG stroke-dasharray + dashoffset, or a clip-path wipe | 20-30 | rings, paths, ticks |
| Typewriter | `text.slice(0, floor(n/2))` - one character per 2 frames | by length | questions, replies, prompt lines |
| Counter | `value = kf(n, [[0,a],[20,b]])` rounded | 14-26 | years, percentages, token counts |
| Line-by-line wipe | each line clips 0 -> 100% over 2 frames | 2 per line | document-card text lines |

## Emphasis

| Name | Formula | Frames |
|---|---|---|
| Pulse | `scale = emphasisPulse(n, {peak: 1.11, up: 13, hold: 4, down: 13})` | 30 |
| Grey -> accent | `mix(muted, accent, clamp01(n/11))` for fill and rule together | 11 |
| Hairline wipe | a rule's width 0 -> 300px from its centre | 16 |
| Brightness flash | element filter brightness 1 -> 1.6 -> 1 | 3-6 (events only) |
| Accent tick | a 2px accent bar slides to the new position on the beat | 12 |

## Accent (what carries the eye; rules in `composition-and-light.md`)

| Name | Formula / component | Frames | Use |
|---|---|---|---|
| Hero carries the accent | accent word, accent unit, accent tick or a ring target on the hero | permanent | **every shot's hero**; secondaries never |
| Ring target | `RingTarget` rings scale 0.92 -> 1 and fade in | 20 | focus point, hero moments |
| Hairline plane stack | 2-3 stacked rules/planes, each entering 4 frames after the one behind | 24 | depth, hierarchy, index shots |
| Accent leaves first | on exit the accent fades (6 frames) before the element fades | 6+8 | any accented element |
| Colour shift | the current row / step takes the accent over 11 frames, the previous one returns to ink | 11 | step lists, rails |
| Flash | brightness 1 -> 1.6 -> 1 | 3-6 | an event: hit, result, payoff |

Per frame: one hero accent plus at most one focus accent. No other colour.

## Exit (**must reach zero before a hard cut**)

| Name | Formula | Frames |
|---|---|---|
| Fade to zero | `opacity = 1 - (n/N)^1.5` (N = 6-12), last frame 0 | 6-12 |
| Accelerating rise | `translateY(-(n/N)^2 * 130)` plus fade to zero | 12 |
| Accelerating drop | `translateY(exitAccel(n, c))`, c 0.2-1.2, plus fade to zero | 6-12 |
| Slide left | `translateX(-c*n^2)` plus fade to zero | 12-15 |
| Grey out and sink | 11 frames to muted + 12 frames down 12px (a memory becomes secondary) | 12 |

Never: a bare 6.7%/frame exit fade before a hard cut (the last frame still shows 40-60% - it snaps);
never end a Sequence with visibility above 20%.

## Camera (numbers are the contract; the sample wraps content in a transform)

> Baseline (2026-09-08): the style reference cut 6.6 whole-frame camera moves per minute (average 16
> frames, including pushes, pull-backs, parallax and a 150-frame scroll); two of this skill's films
> had only 2.2-2.5 per minute, 5-8 frames long, and **zero pushes**. "Mostly static shots" was the
> reason.

**Budget**: >= 3 moves per chapter, at most 1 per shot; each 30-45 frames easeInOut; no accent event
and no staggered entrance during a move (entrances finish, then a >= 10-frame hold, then the move);
readability first, scale <= 1.33 (strokes thicken with the group; above 1.4 they look heavy); HUD,
rail and subtitles stay in screen space - only the content layer moves.

| Name | Formula | Frames | When |
|---|---|---|---|
| Push in | `kf` transform: (640,360,s1) -> (px,py,s1.33) | 30-40 | the hero still speaks for >= 60 frames after its second beat; add a top/bottom vignette fading in over 18 frames |
| Pull back | the same reversed | 37-45 | returning from a detail, closing a chapter, revealing a second subject that was cropped |
| Carried displacement | the previous hero shrinks to 0.6 and moves to a corner (16 frames easeInOutPow(2.5)); both shots share one component and parameters | 16 | every "it stays on screen" hand-off - never disappear and redraw |
| Group pan | the whole group translates one screen left / 110px up as a rigid body | 20-30 | one screen is finished and the next sits beside it; lists longer than one screen |
| Full-page scroll | y displacement easeInOutPow(2.5), optionally with a scrollbar | 43 | long lists / long document cards |
| Parallax | 2-3 layers at different speeds (reference: 6.4 / 9.6 / 12.8 px/frame; background layer darkened x0.43) | 26+ | "many", "the world is big": screenshot walls, document walls, log streams |
| Accelerating exit | the scene translates down/left with acceleration, everything out on the last frame | 12-25 | clearing a chapter, ending an analogy |
| Whip | a hollow copy offsets -63 / +38px for 1-3 frames and resets, or the whole group moves 3 frames with directional blur | 1-3 | a conflict or comparison flip, at most twice per chapter |
| Screen-space vignette | top/bottom linear-gradient, black alpha .38-.42, 18-frame fade-in | 18 | with a push; pulls attention to the centre |

A camera move also counts as the "perceptible change per sentence": when a sentence has no new
element, use a 30-frame push instead of forcing one in.

## Beats

- An element appears at its subtitle block start (`script/timeline.md`, every `|` block); tolerance
  -6..+3.
- Every sentence has at least one perceptible visual change; a hold longer than 45 frames needs a
  breath (a 20-frame bulb cycle, a 30-frame accent breath, drifting dots).
- The 10 blank frames between sentences: the previous shot uses 2 for its exit, the next uses 8 for
  its entrance (shot range = [sentence from-8, last sentence to+2]).
- The 45 blank frames before a chapter belong to the chapter card: the previous chapter's last shot
  fades to zero -> the card enters 3 frames later -> the last 12 frames rise out -> the new chapter's
  HUD fades in on the frame after the card ends.

## Joins (the storyboard must describe both sides)

- Write it out: "A's last 8 frames fade to zero with a slight drop; B fades in its first elements on
  its first frame". Never write just "hard cut" - both sides will each assume "I stay still, you
  enter on the beat" and produce 6-8 empty frames.
- Group boundary frames (between two build groups): each group implements its own storyboard side;
  QC lists the boundary separately; adjacent Sequences may overlap by 0-4 frames.
- Carrying one element across shots (a document card from one shot into the next): both shots share
  the same component and parameters so the boundary frames match pixel for pixel.

## Accent event whitelist

- At most one accent event per shot, on the word or element the shot is about; the storyboard writes
  it in that row only, everything else says "fade".
- HUD word changes, rails, numbering, citation marks, small labels, numbers and icons always fade or
  scale in.
- The final check scans the whole film and the hit count must equal the whitelist count.
