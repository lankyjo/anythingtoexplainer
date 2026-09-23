# Raising visual craft in `anything2explainer`
### Installed skill evaluation · external 2026 skills · ranked art-direction upgrades

**Date:** 2026-09-21
**Scope:** How to raise the visual craft of the anything2explainer pipeline (Remotion, code-drawn motion graphics, fixed black/purple style) using the agent skills installed on this machine plus better external ones.
**Method:** Read the pipeline's own docs and sample frames; read the skill files themselves (not names); verified every external candidate against its upstream repo or raw `SKILL.md`; every claim is cited to a file path or URL. Claims not verifiable from a primary source are listed in §6 UNVERIFIED.
**Constraint honoured:** this report recommends craft upgrades *inside* the existing style (black canvas, star/dot field, white 2–3 px line art, purple accent, ultra-bold type, 44 px outlined subtitles, HUD pills, chapter bar). It does not propose web aesthetics or a stack switch.

---

## 0. Verdict first

**The pipeline does not have a rules problem; it has a budgeting and direction problem.** `SKILL.md` and `reference/composition-and-light.md` already contain unusually good *quantitative minima* (hero ≥170 px, hero must carry glow, purple focus ≤1 large area, no background debris, ≤1 glitch per shot, motion density thresholds). What they lack is:

1. **ceilings** — nothing caps how many objects, type sizes, or how much ink a frame may carry. "at most 4 secondaries and 6 labels" is the only ceiling, and it is not measured.
2. **a direction layer above the shot** — there is no per-shot composition contract (focal point, archetype, camera move, hold window) signed off before a build agent writes code, so 44 shots written by 8 agents converge on the same grammar: HUD pill + icon + dashed rows + caption.
3. **motion contrast** — the current rule "never fully still >30 frames" (SKILL.md hard principle 6, composition-and-light §7) pushes toward *uniform* gentle motion, which is itself a slop signature. Commissioned motion has fast moves, hard holds and clear accents; constant medium motion reads amateur. The pipeline's own docs admit the RAG sample has this defect ("enters and then stops" → fixed, but the fix over-corrected toward "always something moving").
4. **texture** — the stage is literally `#000000` with a `#000000 → #212121` fog gradient (`template/src/Main.tsx`, `common/Fog.tsx`), pure `#FFFFFF` type, and no grain/dither on the star-field path. Dark gradients + wide soft glows + pure white on pure black is exactly the combination that bands and rings after an H.264/AV1 encode and reads as a "flat void" on OLED. Only the `dots` backdrop gets grain (`common/DotFieldBg.tsx:69`, opacity .06).

**Are web-design skills the right tool? Partly — as a diagnostic layer only.** [certain] Their transferable core is small but real (hierarchy through 2–3 dimensions at once, scale ratios, restraint, distinct easings, the "AI slop test"). Their bulk (hover/focus/disabled states, responsive breakpoints, DOM performance, glassmorphism, Tailwind, reduced-motion) does not exist in a clock-driven, non-interactive, pre-rendered frame. Worse, importing the *web animation* paradigm into Remotion is a known failure mode: "Without this [Remotion skill], Claude tries to use web animation patterns that break during rendering" (`wilwaldon/Claude-Code-Video-Toolkit`, README). The strongest additions available in 2026 are not web-design skills at all — they are motion-design and video-craft skills (§3).

**Single change with the biggest effect on the "AI slop" read:** add a **per-shot direction card + hard frame budget** (§4 rank 1–3): one hero on a rule-of-thirds power point, ≤3 support objects, ≤2 type sizes in the frame, ≥35 % of the content area empty, one camera move, one declared hold — filled in *before* the shot is coded and verified on stills. It attacks clutter, missing focal hierarchy and sameness at the same time, and unlike taste it is measurable, so a QC agent can fail a shot.

---

## 1. Evidence base (what was read)

**Pipeline docs**
- `/home/ikeji/Documents/anything2explainer/SKILL.md` (hard principles, quality bar, stage flow)
- `reference/style-guide.md`, `reference/composition-and-light.md`, `reference/motion-vocabulary.md`, `reference/narration-storyboard.md`
- `examples/rag/frames/overview_1.jpg`, `ref_title_f0058.jpg`, `ref_vector_space_f2990.jpg`, `ref_moat_f8100.jpg`
- `examples/contrast/README.md`, `01_hero_size_bad_f0128.jpg`, `05_clutter_bg_bad_f1651.jpg`
- `template/src/common/easing.ts`, `common/Fog.tsx`, `common/DotFieldBg.tsx`, `src/ui.tsx`, `src/fx.tsx` (component inventory + greps for `scale(0)`, `#000`, grain)

**Frames examined directly** — the quality bar is high on hero shots (`ref_title`, `ref_moat`) and visibly weaker on dense diagram shots (`ref_vector_space`: flat grid, floating labels, no depth). The `overview_1` contact sheet shows the real risk: 44 shots sharing one grammar (purple HUD pill, white-outline object, dashed boxes, caption), even when the subject changes.

**Installed skills read in full or in substance**
- `/home/ikeji/.agents/skills/impeccable/SKILL.md` + `reference/{craft,critique,polish,heuristics-scoring,motion-design,animate,overdrive,typography,colorize,spatial-design,brand,delight,distill}.md`
- `/home/ikeji/.agents/skills/{apple-design,emil-design-eng,review-animations,improve-animations,find-animation-opportunities,animation-vocabulary,web-design-guidelines}/`
- `/home/ikeji/.claude/skills/taste-high-end-visual-design/SKILL.md`, `taste-minimalist-ui/SKILL.md`, `taste-industrial-brutalist-ui/SKILL.md` (note: the `taste-*` skills live under `~/.claude/skills/`, not `~/.config/opencode/skills/`; `~/.config/opencode/skills/` contains only `gsd-*` plus an `anything2explainer` symlink)

**External primary sources** — listed with links in §3.

---

## 2. Installed skills: what transfers to code-drawn motion graphics

Legend: **[T]** = transferable, **[N]** = does not transfer. Directive numbering is for cross-reference from §4.

### 2.1 `impeccable` — the most useful installed skill, ~40 % transferable
`~/.agents/skills/impeccable/` (Apache-2.0, based on Anthropic's frontend-design skill; upstream `pbakaus/impeccable`, ~286 K installs on skills.sh)

**[T] Directives for a shot-builder**
1. **Declare a colour strategy, then obey its dosage.** Four steps: Restrained (one accent ≤10 %), Committed (one saturated colour on 30–60 % of the surface), Full palette, Drenched (`SKILL.md:62-69`; dosage 60/30/10 in `reference/colorize.md:105-112`). The pipeline is permanently Restrained, which is why purple reads as "accent sticker" rather than brand. Give each chapter one designated payoff frame where the strategy flips to Committed (purple as the frame, e.g. a flood behind a big number). Constraint: the style guide's "one large purple area per frame" stays for narration shots.
2. **Two-altitude slop test** (`SKILL.md:111-118`). First-order: if the look is guessable from the topic ("AI/tech explainer → black + neon purple + glow + generic icons"), it is the training reflex. Second-order: the *opposite* reflex (editorial serif + mono labels) is the trap one tier deeper. Pass condition: name the film's single distinctive visual move in one sentence and show it inside the first 20 s.
3. **Cap the type scale.** "Use fewer sizes with more contrast", 5 steps, ratios 1.25 / 1.333 / 1.5 (`reference/typography.md:14-23`; `reference/brand.md:59`). The pipeline currently publishes 22/24/26/28/30/33/44/56/80/96/110/150 px — 12 steps, several 1.08× apart, i.e. a flat scale that reads uncommitted.
4. **Hierarchy through 2–3 dimensions at once**, and hero ≥3:1 over support by size alone (`reference/spatial-design.md:32-42`). A heading that is larger *and* bolder *and* has more space reads; a 24 px label next to a 26 px label does not.
5. **Squint test each hero frame** (same file, 20–28). Blur the still; you must still name #1 and #2. This is the cheapest human QC filter and it directly targets "no focal hierarchy".
6. **Compensate typography on dark** (`reference/typography.md:29`): +0.05–0.1 line-height, +0.01–0.02 em tracking, and one weight step up, because light-on-dark loses perceived weight on all three axes. Applies to every white-on-black frame and to 44 px subtitles.
7. **Motion: one orchestrated entrance per shot, not per element** (`reference/animate.md:45`); **exits ≈75 % of entrance duration** (`reference/motion-design.md:13`); **no bounce/elastic** (`motion-design.md:39`); **cap total stagger** — 10 items × 50 ms = 500 ms is the ceiling (`motion-design.md:57`). Port to frames: cap a group reveal at ~15–18 frames total.
8. **Remedial hierarchy: delete first, then shorten, then fix easing** (`~/.agents/skills/review-animations/SKILL.md:62-74`). For this pipeline the deletion target is usually the *element*, not the animation.
9. **Distill: one primary per screen; remove decoration that doesn't serve hierarchy; never nest cards** (`reference/distill.md:50-63`). The pipeline's default grammar (Pill inside Box inside dashed frame) is nested-card drift.
10. Small copy rule that transfers to English films: **no em dashes** (`SKILL.md:109`) — on-screen English text is short and benefits from this discipline.

**[N]** OKLCH/design-token machinery *as a system*, dark/light theming, hover/focus/active/disabled/loading/error states, form validation, keyboard paths, touch targets, container queries, `prefers-reduced-motion`, responsive breakpoints, font-loading FOUT/CLS, browser `detect.mjs`, live variant mode, glassmorphism/Tailwind bans, WCAG-as-goal (video needs a *stricter* floor; see §3.2).

### 2.2 `taste-high-end-visual-design` (and the `taste-*` family) — ~15 % transferable
`~/.claude/skills/taste-high-end-visual-design/SKILL.md` (upstream `leonxlnx/taste-skill/high-end-visual-design`, ~369 K installs on skills.sh)

**[T]**
11. **Ban default transitions; require custom curves.** "Never use default transitions", "Banned Motion: standard `linear` or `ease-in-out`" (`SKILL.md:19, 55`). The film already uses a bespoke easings file (`template/src/common/easing.ts`) — the gap is that the *values are a catalogue* (9 entrance types, 4 curves), not a project-wide chosen set.
12. **Macro-whitespace**: double your standard padding; allow the design to breathe (`SKILL.md:50-52`). The video analogue is negative space around the hero (§4 rank 3).
13. **Pre-output checklist** (`SKILL.md:86-98`) — a good pattern to port into `BUILD_NOTES` per shot.
14. **Variance mandate** (`SKILL.md:11, 22-37`): never the same layout twice in a row. **Caution:** the skill says to "roll the dice" per artifact; in video that would break consistency. Adopt variance *between* shots' composition archetypes while holding one motion language — see rank 2 vs rank 9 in §4.

**[N]** glassmorphism, backdrop-blur, bento grids, double-bezel nested containers, mobile collapse, hover/magnetic button physics, `IntersectionObserver`, scroll reveals, Tailwind classes, the banned-font list (a web monoculture rule, irrelevant to a fixed 4-font system), grain-at-0.03-on-a-scrolling-container.

### 2.3 `apple-design` — ~30 % transferable, high-value fragments
`~/.agents/skills/apple-design/SKILL.md` (WWDC-derived)

**[T]**
15. **Spatial consistency: enter and exit along the same path** (`SKILL.md:133-139`). An element that enters from the right must leave to the right. The pipeline mandates "exit to zero" but never path symmetry.
16. **Hint in the direction of the motion** (`SKILL.md:141-143`): intermediate frames should telegraph the outcome, not interpolate blindly (Control Center modules "grow toward your finger"). Video analogue: a connector/arc that visibly points at where the next element will land.
17. **Frame-level smoothness** (`SKILL.md:163-169`): keep per-frame positional change below the strobing threshold; use a subtle motion blur/stretch for very fast motion; animate compositor-friendly properties. Directly relevant to whip-outs (motion-vocabulary camera section already says "3-frame displacement + directional blur" for whip — good) and to the 0.4–3.2 px/frame star drift.
18. **Avoid slow looping oscillations near 0.2 Hz and full-viewport moving backgrounds; make large moving objects semi-transparent during travel; fade big surfaces during a large reposition** (`SKILL.md:199-207`). Directly applicable to `CameraRig` pushes and sweeping light bars: fade a pushed full-bleed diagram slightly while it travels.
19. **Typography is size-specific**: tracking tightens as type grows, leading tightens with size, hierarchy = weight + size + leading as a set (`SKILL.md:218-236`). The pipeline's positive `letterSpacing 6` on 96–150 px Audiowide runs against this, but it is a deliberate display-face choice — keep; do apply **negative tracking (-0.02 to -0.04 em) to Noto 900 headlines ≥80 px**, which currently use scaleX .85 as a crude substitute for proper tracking.
20. **Craft principle: "Nothing is random — every spacing, timing, and alignment value is a deliberate choice you can defend"** (`SKILL.md:249`). This is the single best sentence to put at the top of the build-agent prompt.
21. **Delight is the result of getting the other seven principles right, not confetti on top** (`SKILL.md:250`) — anti-glitch-spam.

**[N]** gestures, 1:1 tracking, velocity handoff, momentum projection, rubber-banding, springs as a *default* (Apple itself: use duration+easing for choreographed, timeline-locked sequences — a statement independently confirmed by `iart-ai` animation-principles), translucency/`backdrop-filter`, haptics, `prefers-reduced-transparency`, Dynamic Type/rem, pointer events.

### 2.4 The Emil Kowalski family (`emil-design-eng`, `review-animations`, `improve-animations`, `find-animation-opportunities`) — ~35 % transferable, mostly as *review* discipline
`~/.agents/skills/emil-design-eng/SKILL.md`; `review-animations/{SKILL,STANDARDS}.md`; `improve-animations/{SKILL,AUDIT}.md`; `find-animation-opportunities/SKILL.md`

**[T]**
22. **Easing decision order**: entering/exiting → ease-out; moving on screen → ease-in-out; constant motion (progress bar, marquee) → linear; default ease-out. **Never ease-in on an entrance** (`emil-design-eng/SKILL.md:95-123`; `review-animations/STANDARDS.md:18-27`). Check the film's `slideUp`/`SoftIn` against this: `SoftIn` uses a 2.5-power ease-out — correct.
23. **Never animate from `scale(0)`** — start 0.9–0.97 + opacity (`emil-design-eng:215-232`). Verified: the template contains **no** `scale(0)` (grep of `template/src`) — keep it that way; add a selfcheck guard so shot code cannot introduce one.
24. **Entrances change 2–3 properties** (opacity + translate + scale). The pipeline's `SoftIn` is only opacity + 10 px rise. For hero-tier elements, add a subtle scale (0.96→1.0) so the entrance has weight.
25. **Asymmetric timing**: slow where the viewer is deciding / the beat is deliberate, fast where the system responds (`emil-design-eng:588-606`). For video: build-ups can run 20–30 frames, but the payoff snap should be 4–8.
26. **Stagger 30–80 ms at 30 fps = 1–3 frames per item**, cap total reveal ~15–18 frames (`emil-design-eng:608-640`; `AUDIT.md:102`). The pipeline already uses 2 frames/stagger — consistent; the missing half is the total cap.
27. **Review format = Before / After / Why table with exact values** (`emil-design-eng:38-60`; `review-animations/SKILL.md:80-90`). Port this verbatim into the QC and fix-agent prompts; it forces specificity.
28. **Plans must be self-contained and executable by a model with zero context and zero taste** (`improve-animations/SKILL.md:20-26`). The build prompts in `reference/prompts.md` should inline exact curves, frame counts and file paths, never "use the easing discussed above".
29. **Slow-motion and frame-by-frame review** (`emil-design-eng:642-661`). The pipeline renders stills; add a 12-frame filmstrip per shot at 2× playback duration for the QC agent.
30. **Frequency gate inverted for video**: the web gate ("100+/day → never animate") does not apply, because a video beat is watched once. Replace it with "does this motion carry meaning?" — and note that the strongest fix is often deletion (`find-animation-opportunities/SKILL.md:12`).
31. **Do not import the "<300 ms" UI rule as a global video cap.** The same source explicitly exempts marketing/explanatory work (`emil-design-eng/SKILL.md:125-135`); at 30 fps, 300 ms = 9 frames, which would forbid almost every entrance in this film. The film's 8–22-frame entrances are correctly in the "explanatory" band.

**[N]** hover/press states, keyboard-initiated-action rules, interruptibility, keyframes-vs-transitions (video is seeked, not retargeted), CSS-variable recalc, `transition: all`, Framer Motion hardware acceleration, tooltips, reduced-motion gating, pointer/hover media queries.

### 2.5 `animation-vocabulary`, `web-design-guidelines`, `taste-minimalist-ui`, `taste-industrial-brutalist-ui`
- **`animation-vocabulary`** — glossary only (`/home/ikeji/.agents/skills/animation-vocabulary/SKILL.md`). Keep it out of the build context; use it only when the human needs a name for an effect. [N] as an authoring tool.
- **`web-design-guidelines`** — fetches Vercel's live web rules (`~/.agents/skills/web-design-guidelines/SKILL.md:23-29`). Pure web a11y/perf. [N] entirely. Do not install into the film pipeline.
- **`taste-minimalist-ui`** — mostly Tailwind, but two [T] fragments: **colour is a scarce resource**, "utilized only for semantic meaning" (`SKILL.md:32`), and no gradients/heavy shadows (`:17`). Reinforces purple discipline.
- **`taste-industrial-brutalist-ui`** — Tailwind too, but three [T] fragments with real value for this style: **macro-typography at massive scale with -0.03…-0.06 em tracking and 0.85–0.95 line-height** (`:26-33`); **bimodal density** — "extreme data density … and vast expanses of calculated negative space" (`:70`); **structure as ornament** (visible grids, rules) (`:65-71`). Bimodal density is the single most useful imported idea for fixing "everything is medium-density and samey".

### 2.6 What no installed skill gives you
- A **per-shot composition contract** (focal point coordinates, archetype, layer map, camera move, hold window).
- A **frame-level negative-space / ink budget**.
- **Type-in-motion timing budgets** (reading time vs hold vs entrance).
- **Video-specific colour constraints** (banding, chroma subsampling, platform recompression, video-safe contrast).
- A **video-medium composition doctrine** (what changes when the "page" is a 1/30 s frame at 1280×720 watched once, with a narrator).
Those gaps are exactly what the external skills in §3 fill.

---

## 3. External skills and systems (verified, ranked by what they add here)

All links verified as of 2026-09-21. Installation is via the open Agent Skills CLI (`npx skills add <owner/repo>`), which supports OpenCode (`skills.sh` lists OpenCode among supported agents). Registry links are given for discoverability; primary sources are the GitHub repos.

| # | Skill / system | Link | Licence | Stack fit | What it adds here |
|---|---|---|---|---|---|
| 1 | **iart-ai/motion-design-skills** (9 skills: `motion-art-direction`, `shot-composition`, `animation-principles`, `color-motion`, `beat-sync-editing`, `remotion-video`, `logo-animation`, `motion-background`, `after-effects`) | [github](https://github.com/iart-ai/motion-design-skills) · [hub](https://github.com/iart-ai/motion-skills) | MIT | Remotion listed; direction layer is tool-agnostic | The missing **direction layer**: motion-language spec, motion personalities, three pillars, hero/support/texture, 1/3 rule, focal placement, camera recipes, parallax layer speeds. Highest fit of anything verified. |
| 2 | **SkillMedev/skills — `kinetic-typography`, `motion-color-and-light`, `visual-hierarchy`, `design-qa-checklist`, `remotion-compose`, `captions-from-transcript`** | [github](https://github.com/SkillMedev/skills) | MIT | Remotion-native (`remotion-compose`), otherwise tool-agnostic | The two things the pipeline has never specified: **reading-time budgets for on-screen text** (with a runnable `type_budget.js`) and **video-safe colour/compression rules** (banding, chroma subsampling, 7:1 motion contrast, noise/dither). |
| 3 | **remotion-dev/skills** (official; `/remotion-best-practices`, `/remotion-create`, `/remotion-markup`, `/remotion-render`, `/remotion-studio`, `/remotion-captions`, `/remotion-interactivity`, `/remotion-maps`, `/remotion-saas`, `/remotion-docs`, `/remotion-upgrade`, `/remotion-multimedia`) | [github](https://github.com/remotion-dev/skills) · [docs](https://www.remotion.dev/docs/ai/skills) · [plugin](https://github.com/remotion-dev/claude-code-plugin) | Remotion licence / MIT (repo) | Exact | **Safety net, not taste.** Prevents web-animation patterns that silently break frame-by-frame rendering; `/remotion-captions` for word-synced subtitle work. ~534 K installs on skills.sh. |
| 4 | **haidrrrry/claude-remotion-skill** (`remotion-motion-graphics`) | [github](https://github.com/haidrrrry/claude-remotion-skill) | MIT | Remotion | The most explicit **anti-"generic AI video"** rule list found (10 non-negotiable rules + pre-delivery checklist), including "render → extract frames → LOOK → fix → re-render". **One rule conflicts** with this style: its mandatory 5-layer stack (bg mesh/grade/grain/vignette) and "never a flat solid background" — adapt, do not adopt. |
| 5 | **heygen-com/hyperframes** (`hyperframes-creative`, `hyperframes-animation`, `motion-graphics`, `faceless-explainer`, +16) | [github](https://github.com/heygen-com/hyperframes) · [creative SKILL](https://github.com/heygen-com/hyperframes/tree/main/skills/hyperframes-creative) | Apache 2.0 | HTML/GSAP/Remotion-adjacent; **not** a drop-in for a Remotion codebase | **Video-medium composition doctrine**: `references/video-composition.md` exists specifically to stop "empty web-page layouts" in video; `house-style.md` lists the lazy web defaults to question; `frame.md` (design system inverted for the camera) is a strong concept; scripts `contrast-report.mjs`, `animation-map.mjs`, golden-render baselines. 51.9 K stars. Reading it is high value; migrating is not recommended. |
| 6 | **acelera-agency/html-animation** | [github](https://github.com/acelera-agency/html-animation) | MIT | HTML/Playwright, not Remotion | Best **failure-mode post-mortem** found: a scene that holds perfectly motionless at 60 fps reads *stuck*; optical vs geometric centring was off by 28–41 px in a 1080 frame; measurement > eyeballing; `scripts/verify.js` measures centring/fluidity instead of guessing. The philosophy transfers even though the stack does not. |
| 7 | **iart-ai/explainer-video-skills** (`explainer-video`, `diagram-animation`, `isometric-animation`, `whiteboard-animation`, `wrapped-video`) | [github](https://github.com/iart-ai/explainer-video-skills) | MIT | Remotion/Manim/HTML | **Scene recipes for the exact genre**: paced narrated explainer structure, progressive node/edge diagram reveals, growing bars and count-ups, isometric/2.5D stacked layers. Useful as a second opinion on `narration-storyboard.md` §4's pattern table. |
| 8 | **iart-ai/kinetic-typography-skills** | [github](https://github.com/iart-ai/kinetic-typography-skills) | MIT | CSS/GSAP/Remotion | Single skill; split granularity, variable-font weight transitions, text-on-path. Overlaps SkillMedev's `kinetic-typography` (which has the stronger artifact, the budget calculator). Pick one. |
| 9 | **lottiefiles/motion-design-skill** | marketplace page: [awesomeskill.ai](https://awesomeskill.ai/skill/lottiefiles-motion-design-skill-motion-design) | unknown | web/Lottie | Director chapters (choreography, Disney principles, timing/easing tables, quality checklist). **Path not verified** — raw `SKILL.md` returned 404 at the guessed location (§6). |
| — | **Not recommended for this pipeline** | | | | `docusphere/claude-skill-motion-graphics` (2★, generates assets via Higgsfield — wrong paradigm); `kevinrivm/seedance-animation` (model-generated loops); `LobzyJay/motion-design-with-claude` (After Effects/Blender MCP); `VasiniDevi/motion-skills` (Python/PIL renderer); `MoussaabBadla/claude-motion-studio` (10★, glass/gradient "premium web" system partially conflicts with the style); `genmedia-labs/skills/video-edit` (model-based video restyle); `wilwaldon/Claude-Code-Video-Toolkit` and `fkimmel25/claude-video-editing-kit` (link lists / Hyperframes starter kits — useful for discovery only). |

**What does not exist (as of 2026-09-21):** Anthropic's own `anthropics/skills` repo (verified by reading its README) contains no motion-graphics, video, or kinetic-typography skill — only document skills (docx/pdf/pptx/xlsx) and general creative/dev examples. There is also **no dedicated agent skill for visual-quality review of rendered video frames** — the closest verified things are HyperFrames' deterministic render snapshots/golden baselines, `html-animation`'s `verify.js`, the iart-ai "deliver-and-verify loop" (freeze a frame → tile a contact sheet → probe the encoded MP4), and this pipeline's own `frame_metrics.py` / `motion_check.py`, which are already ahead of most of the ecosystem.

**Install suggestion (one line each, no repo changes required):**
```bash
npx skills add iart-ai/motion-design-skills      # direction + composition + principles
npx skills add SkillMedev/skills                 # kinetic typography, colour/light, QA (471 skills; install per-skill if the CLI allows)
npx skills add remotion-dev/skills               # official Remotion mechanics
```

---

## 4. Ranked art-direction upgrades for this pipeline

Ranked by (leverage on the slop read) ÷ (effort). Each item: the rule → the failure it fixes → where it belongs → enforcement (script = a deterministic check can gate it; vision = a human/QC agent must look).

### Rank 1 — Per-shot direction card before any code
**Rule:** Before a shot is implemented, its storyboard row is expanded into a card with: focal point in px on a rule-of-thirds power point (not dead centre), the single hero object and its height, the support-object list (≤3) and label list (≤6), the frame's layer map (bg/mid/fg with roles), the one camera move (type, from→to, duration, easing), the hold window (frames, after which HIT), and the motion-language references (which entrance/pulse from the vocabulary). A shot without a card cannot be built.
**Fixes:** "no focal hierarchy", "cluttered frames", per-shot freelancing by 8 parallel build agents; converts art direction from post-hoc QC into an authoring contract. This is the single highest-leverage change.
**Where:** new `reference/shot-direction.md` + a required column in `narration-storyboard.md` §3 + the build prompt in `reference/prompts.md`.
**Enforcement:** script can verify the card exists and is complete (string/field lint in `selfcheck.py`); **vision** verifies the frame actually obeys it (focal point, object count).

### Rank 2 — Composition archetype set + no-repeat rule
**Rule:** Define 8 named archetypes (e.g. centre-hero, asymmetric two-column, hero + orbit, matrix/grid fill, diagonal path, stacked depth layers, type-dominant, symbol scene). Assign one per shot in the storyboard; **no two adjacent shots may share an archetype**, and every chapter must use ≥3. This is imported from `motion-art-direction`'s consistency discipline plus the variance mandate, and it is the direct antidote to the "44 shots, one grammar" sameness visible in `overview_1.jpg`.
**Fixes:** template sameness / "AI made that" read.
**Where:** `composition-and-light.md` §1 as a new table; storyboard template gets an `archetype` column.
**Enforcement:** script (count declared archetypes and adjacent duplicates); **vision** (does the frame match the declared archetype).

### Rank 3 — Hard frame budget: one hero, ≤3 supports, ≤2 type sizes, ≥35 % empty
**Rule:** Measured on the still: one dominant object; ≤3 support objects (excluding HUD/progress/subtitle chrome); ≤2 distinct text sizes in the content area; the hero's bounding box must have ≥40 px clear margin on all sides; ≥35 % of the content area (x60–1220, y110–620) carries no ink. Plus a whole-film cap: ≤5 graphic objects and ≤40 % ink coverage.
**Fixes:** clutter; "everything is the same visual weight"; frames that pass "hero ≥170 px" while still feeling busy.
**Where:** `composition-and-light.md` §1 and §6 with new thresholds; extend `template/scripts/frame_metrics.py` to compute object count, distinct type sizes (from source), hero margin and ink ratio.
**Enforcement:** **script** (the existing metrics script is the right home; it already does connected components).

### Rank 4 — Motion contrast: HIT → hold → build, with a declared hold window
**Rule:** Each shot has ≥1 *snap* moment (4–8 frames) and ≥1 hold (12–20 frames) where only the ambient layer moves (star drift, glow breath, data-flow pulse). Rewrite `composition-and-light.md` §7 so it distinguishes **dead** (no primary and no ambient) from **hold** (ambient only, bookended by events), and rewrite the `motion_check.py` criterion accordingly: still-frames caused by a declared, bookended hold are a pass; still-frames in the middle of a verb are a fail. Imported from `motion-art-direction` ("hold discipline: ≥0.3 s of stillness after each beat") and `haidrrrry` design-rules ("holds are a design tool: fast move → complete stillness → next move; constant motion reads amateur, contrast reads expensive").
**Fixes:** "lifeless motion" and the whole-film sameness of movement. This is the counter-intuitive one: the current "no element still >30 frames" rule is *causing* part of the lifelessness by forcing uniform medium motion.
**Where:** `composition-and-light.md` §7 (rewrite), `motion-vocabulary.md` beat section, `template/scripts/motion_check.py` (two-tier classification), storyboard "continuous" column becomes "continuous + hold".
**Enforcement:** **script** (new metric) + **vision** for "does the hold read as intentional or as a stall".

### Rank 5 — Consolidate the type scale; cap sizes per frame
**Rule:** Reduce the film's scale to ≤6 steps with ratios ≥1.25 (e.g. 22 / 30 / 44 / 72 / 96 / 130) and permit ≤2 steps in a single frame (hero + support); hero must be ≥3× the smallest text on screen. Keep the four families. Replace `scaleX .85` as the universal headline treatment with proper negative tracking (-0.02 to -0.04 em) for Noto 900 display sizes (`apple-design` §15; `brand.md:59`; `typography.md:14-23`).
**Fixes:** muddy hierarchy from 12 near-identical sizes; "nothing stands out".
**Where:** `style-guide.md` §3 (new scale table); `ui.tsx` constants; `frame_metrics.py` / `selfcheck.py` scan the shot sources for font sizes outside the table.
**Enforcement:** **script** (source scan is deterministic here).

### Rank 6 — Video-safe stage and texture (banding/ringing)
**Rule:** Do not use `#000000` as the working stage or pure white for large fills: tint to ~`#0B0B0F` and `#F2F2F5`; keep the deep-black *canvas* only as the outermost frame if the style demands it. Add a 1–3 % noise/dither overlay over the fog gradient and every wide glow (the `dots` backdrop already has one at `DotFieldBg.tsx:69`; the default `stars` path has **none** — that is a verifiable gap in `Main.tsx`/`Fog.tsx`). Verify on a real encode at the target bitrate, not only in Remotion Studio. Source: `SkillMedev/skills/skills/motion-color-and-light/SKILL.md` (banding, 4:2:0 chroma subsampling, 7:1 motion contrast, "the #1 fix is a faint noise/dither").
**Fixes:** flat-void look; banding and muddy neon after YouTube/AV1 recompression; ringing at max-contrast edges.
**Where:** `style-guide.md` §1–2 + `template/src/common/Fog.tsx` / a new `Grain` layer in `Main.tsx`.
**Enforcement:** **script** (hex scan; presence of a grain layer) + one encode check per film.

### Rank 7 — Type-in-motion budget for on-screen text
**Rule:** Every on-screen line gets a *held* readable window of max(0.8 s, words ÷ 3.5 s) with a +0.3 s tax for numbers/names/jargon; entrance (8–15 frames) and exit (≤ entrance) are **added on top**, never carved out of the hold; animate one property per line (two only with intent); never reflow glyphs (no animating font-size/width/tracking); at most one weight/size accent per line; never loop/pulse text. Port from `SkillMedev/skills/skills/kinetic-typography/SKILL.md` (with the runnable `type_budget.js`).
**Fixes:** hero words/labels/annotations that flash past or wiggle; also gives the storyboard a second, independent timing check alongside TTS word boundaries (subtitles themselves are already safe by construction because they follow TTS).
**Where:** new `reference/type-in-motion.md`; QC criteria; a `scripts/type_budget.py` port that reads `timeline.ts` + the storyboard.
**Enforcement:** **script** (timeline-driven), **vision** for "does the animation compete with the read".

### Rank 8 — Purple dosage: accent as light, not paint
**Rule:** At most one large purple fill (>25 % of the content area) per frame; purple is for glow, strokes, small fills, active state; designate ≤2 per chapter as "Committed" frames (rank 1 of §2.1) where purple may become the field behind a big number or a payoff symbol. Widens the film's dynamic range without changing the palette. Sources: `colorize.md:105-132` (60/30/10, "accent is not decoration"), `taste-minimalist-ui:32`.
**Fixes:** "purple everywhere → nothing is highlighted"; monotone intensity across the whole film.
**Where:** `style-guide.md` §2; new `frame_metrics.py` metric (purple area ratio per frame, not just the fragment count).
**Enforcement:** **script**.

### Rank 9 — Declare one motion-language spec per film
**Rule:** At stage 3, write a 6-row spec: easing family (the one curve used for ~90 % of moves), base timing unit (frames), the ≤2 non-default curves, transition family between shots (e.g. "exit-to-zero + soft-in only"), stagger rhythm (2 frames/item, ≤18 frames total), motion intensity budget (travel px, scale range), and hold discipline. Then forbid entrances/camera moves outside the spec. Source: `iart-ai/motion-design-skills/skills/motion-art-direction/SKILL.md` ("Define the motion language first, then animate to it… two eases maximum. A third curve must justify its existence"; "consistency reads as confidence; variety reads as noise").
**Fixes:** every shot inventing its own entry/easing mix = noise; also gives QC a concrete spec to audit against ("same easing family on comparable moves?").
**Where:** header of `motion-vocabulary.md` + a "global constraints" block in `storyboard_src.md`.
**Enforcement:** **script** (whitelist scan of shot sources for entrance/exit/rig components) + **vision**.

### Rank 10 — Hero entrances change 2–3 properties; no `scale(0)`; exits faster and path-symmetric
**Rule:** Hero-tier elements enter with opacity + small translate + 0.96→1.0 scale, settle within 12–18 frames; support-tier keeps the current 8-frame `SoftIn`. Exits use ≤75 % of the entrance duration and leave along the same path they entered (import `apple-design` §7). Verified: the template has no `scale(0)` today — protect that with a check.
**Fixes:** lonely fades, "came from nowhere", elements that vanish in place (the "half-transparent snap" the docs already warn about, now with the missing path rule).
**Where:** `ui.tsx` (`SoftIn` keeps its contract; add `HeroIn`), `motion-vocabulary.md` entrance/exit tables.
**Enforcement:** **script** (grep `scale(0)`; count exit durations vs entrances where declared) + **vision**.

### Rank 11 — Anticipation and follow-through (secondary settle)
**Rule:** A big reveal gets a 4–8-frame pre-move (a light bar starts, a shadow deepens, the previous object shifts 6–10 px away) before the hero lands; support elements settle 3–8 frames *after* the hero stops; light turns on 2 frames before the object and off 6 frames before the exit (already partly in `composition-and-light.md` §2, extend to secondary objects).
**Fixes:** everything stopping on the same frame = mechanical; hero appearing in a vacuum = sticker look.
**Where:** `motion-vocabulary.md` emphasis (add `anticipate`/`settleLag` helpers), `fx.tsx`.
**Enforcement:** **vision** + frame-number audit in QC (differences of 3–8 frames must be visible in the storyboard).

### Rank 12 — Camera discipline: one move per shot, 1/3 rule, no stacked moves
**Rule:** One camera move per shot (push | pan | follow | parallax), ease-in-out, 24–60 frames; never stack push+pan+rotate; no element travels more than ~1/3 of the frame without an intermediate keyframe or a scale/opacity change; do not move the camera during a glitch, stagger, or the subtitle's first 6 frames (already partly stated in `motion-vocabulary.md` camera section budget). Import: `iart-ai shot-composition` §5–6 + `animation-principles` 1/3 rule.
**Fixes:** "the whole template moved" feeling; chaotic combined moves; camera moves that cancel the entrance choreography.
**Where:** `motion-vocabulary.md` camera section (add the 1/3 rule and the stack ban).
**Enforcement:** **script** (keys audit per `CameraRig` usage) + **vision**.

### Rank 13 — Depth map per shot (bg/mid/fg with assigned roles)
**Rule:** Every shot declares three layers with distinct behaviour: background = ambient (0.1–0.3× parallax, low contrast, dimmed 0.43 — already in the docs), midground = the hero (sharp, brightest), foreground = optional (1.0–1.5×, may blur as it crosses). Flat shots (no layer separation) are a declared defect, not a default. Source: `shot-composition` §4 (+ the pipeline's own "an all-flat film is a defect").
**Fixes:** flat diagram frames like `ref_vector_space`; adds the depth that makes a frame feel designed.
**Where:** `composition-and-light.md` §4; storyboard `layer map` field (rank 1 card).
**Enforcement:** **vision** mostly; script can check that ≥X % of shots use `TiltPlane`/`CameraRig`/parallax per chapter.

### Rank 14 — The slop test in QC (three questions + a contact-sheet read)
**Rule:** At each chapter QC, answer in writing: (1) name this chapter's single most distinctive visual move; (2) if all text were removed, would a viewer still know what this shot is about? (3) which shot looks most "AI-made" and why? Then read a 6-up contact sheet of the chapter at a glance before reading individual frames. Sources: `impeccable` AI slop test (`SKILL.md:111-118`), `hyperframes-creative`'s explicit warning that skipping its house-style/video-composition reference "is the single biggest cause of generic, web-page-looking output".
**Fixes:** metrics pass while taste fails — the exact situation this report was commissioned to fix.
**Where:** `reference/agent-qc-rules.md` + QC prompt in `prompts.md`.
**Enforcement:** **vision/human only** (it is the one check that cannot be automated).

### Rank 15 — Textile restraint on effects: one accent event per beat
**Rule:** At any beat, at most one of {glitch, pulse, white flash, light sweep} fires; glitch remains ≤1 per shot and only on the shot's term (existing rule); HUD/label changes stay `SoftIn`. Enforce "the set piece is the shot's only spectacle" (already "per chapter 1–2 hero moments" — now bind it to the *beat* level too).
**Fixes:** competing accents that dilute the one moment that should land; "Vegas" glow.
**Where:** `motion-vocabulary.md` (glitch whitelist becomes an accent whitelist), `selfcheck.py`.
**Enforcement:** **script** (count accent components active per frame from source, as `selfcheck.py` already does for glitch).

### Rank 16 — Hand-drawn inventory only: ban emoji and generic icon fonts
**Rule:** All glyphs come from `ui.tsx` / group `gNui.tsx` (or are newly hand-drawn there); emoji and icon-font glyphs are banned in frame content. Each film adds 2–5 semantic icons (already required in stage 4) and BUILD_NOTES must list which icons and where they are reused.
**Fixes:** emoji render as platform-coloured glyphs that ignore the palette (verified failure mode in `haidrrrry`'s common-failure list) and instantly read as low-effort/AI-generated.
**Where:** `reference/agent-build-rules.md` + `selfcheck.py`.
**Enforcement:** **script** (scan source for emoji code points / icon-font imports).

### Rank 17 — `fitSize()` is a warning, not a layout tool
**Rule:** If a headline has to shrink below its role's minimum size to fit, rewrite the copy; never shrink display type. Kill auto-shrink for hero text; allow it only for subtitles/chapter names where the docs already treat overflow as a copy defect.
**Fixes:** the "type gets small and timid to fit a crowded frame" failure, which directly causes the loss of hierarchy.
**Where:** `style-guide.md` §3.1; `common/textfit.ts` usage rules; `selfcheck.py`.
**Enforcement:** **script** (flag any hero text rendered below its role minimum).

### Rank 18 — Reference-frame citation per shot
**Rule:** For each shot's archetype, BUILD_NOTES must cite the `examples/rag/frames/ref_*.jpg` (or contrast pair) it works from; QC reads that citation and compares. The sample's strongest frames (`ref_title_f0058`, `ref_moat_f8100`) are the designated bar for type-dominant and symbol-scene shots.
**Fixes:** build agents working from prose alone; drift away from the quality bar.
**Where:** `agent-build-rules.md` BUILD_NOTES template.
**Enforcement:** **script** (citation present) + **vision** (does it match).

### Rank 19 — Declare stillness windows per chapter
**Rule:** Each chapter's storyboard lists ≥3 hold windows (frames + what is allowed to move). This is the bookkeeping half of rank 4; without it the new `motion_check` two-tier rule has nothing to pass.
**Where:** storyboard `§global constraints`; `motion_check.py` input format.
**Enforcement:** **script**.

### Rank 20 — Measure optical centring, not geometric centring
**Rule:** For a symbol/scene hero, verify the *ink* centre, not the layout box centre (CJK text boxes carry ascender/descender slack; the pipeline already pre-deducts `TEXT_DY`, but scenes don't). The `html-animation` post-mortem measured 28–41 px of optical offset in a 1080 frame and nobody could name it ("everybody felt it").
**Fix:** "something feels off but I can't say what" — a classic slop tell.
**Where:** `composition-and-light.md` §1; `frame_metrics.py` (compute ink centroid vs bounding-box centre).
**Enforcement:** **script**.

---

## 5. Honest assessment: are web-design skills the right tool for video graphics?

**Short answer: no — not as the authoring layer; yes, as a diagnostic layer. [certain]**

**Steelman of the pro position:** these are the only mature, installed, agent-native taste corpora on this machine; they are free, high-quality (the impeccable and taste families are among the most-installed skills on skills.sh, ~286 K and ~369 K respectively), and they contain the single most portable idea in design — *hierarchy must be visible at a squint, and if the artefact is guessable from its category it reads as machine-made*. Their checklists (Before/After tables, squint tests, "delete the animation first") are directly usable by a QC agent.

**Counter, and it is decisive:** the design of web skills is driven by an *interactive, stateful, resizable, user-paced* medium. Video is *clock-driven, irreversible, fixed-size, narrator-paced*. That difference flips several of their rules:
- "Under 300 ms on UI transitions" would forbid nearly every entrance in a 30 fps film (9 frames). The same source exempts explanatory work; a naive import causes real damage.
- "Frequency-appropriate motion" (`100+/day → never animate`) inverts: a video beat is seen once, so the gate becomes "does it carry meaning?" rather than a frequency count.
- "Never animate everything" is right for the wrong reason in video: the constraint is the *narrator's* attention budget, not interaction latency.
- `/remotion-markup` exists for one documented reason: untrained models write web animation patterns that break during frame-by-frame rendering. That is the ecosystem's own statement that the web paradigm is the wrong authoring grammar for video.

Meanwhile, the installed web skills contain **zero** coverage of the things this pipeline is actually weak on: focal-point placement on a thirds grid, per-shot layer maps, hold discipline, reading-time budgets, chroma subsampling and banding, video-safe contrast, and "the still frame must be readable as a still". Those come from motion-design/video skills (§3 ranks 1–6), which are *undersubscribed* relative to the web skills but much better matched.

**Which single change would most reduce the "AI slop" read?**
**Ranks 1–3 as one change: a mandatory per-shot direction card plus a hard frame budget (one hero on a power point, ≤3 supports, ≤2 type sizes, ≥35 % empty), verified on stills before the shot is accepted.**
Why this one: the sample frames and your test run both fail on the same axis — *too much similar-weight stuff, no focal point*. Every other candidate (motion contrast, palette commitment, texture) affects how the film feels; this one changes what every single frame *is*. It is also the only candidate that is both measurable (so a cheap QC agent can enforce it) and upstream of everything else (camera moves, holds and glitch placement are all decisions relative to the hero). And it is the direct antidote to the pipeline's structural cause: eight parallel agents each reproducing a safe, medium-density layout.

One more honest note [guess, but well-grounded]: the style itself is now a saturated 2026 AI aesthetic — black canvas, neon purple, glow, generic outlined icons is the first-order category reflex for "AI explainer". That does not mean abandon it (it is the requested style). It means the film must buy distinctiveness *inside* the style through composition discipline and one signature move per chapter, not through more effects. Rank 2 (archetype variance) and rank 8 (purple commitment) are the cheapest ways to buy that.

---

## 6. UNVERIFIED / not independently confirmed

1. **Star counts and install counts** quoted in §3 come from GitHub search snippets and skills.sh leaderboard pages on 2026-09-21 and were not re-verified with the GitHub API. Specifically: iart-ai/motion-design-skills 19★, iart-ai/motion-skills 392★, remotion-dev/skills 4,492★, heygen-com/hyperframes 51.9 K★ (skills.sh-rounded), remotion best-practices 534 K installs, impeccable 286.3 K installs, taste-skill high-end-visual-design 368.9 K installs, `haidrrrry/claude-remotion-skill` and `acelera-agency/html-animation` star counts unknown.
2. **`lottiefiles/motion-design-skill`** — existence inferred from a marketplace page (`awesomeskill.ai`); the raw `SKILL.md` at the guessed default-branch path returned 404. Treat its content list as second-hand.
3. **SkillMedev `skills` catalogue size ("471 skills, MIT")** — taken from that repo's own README; not audited skill by skill. The two files I actually read (`kinetic-typography`, `motion-color-and-light`) are real and coherent.
4. **The claim that Remotion's official skills "went viral in January 2026 — 6 M+ views, 25 k+ installs in the first week"** — from `wilwaldon/Claude-Code-Video-Toolkit`'s README (secondary source); not verified.
5. **Whether `npx skills add` installs cleanly into this machine's OpenCode setup** — untested here. skills.sh lists OpenCode as a supported agent; the HyperFrames README notes the registry blob can lag `main` by hours and recommends `npx hyperframes skills update`.
6. **HyperFrames' `frame.md` / `video-composition.md` / `house-style.md` contents** — I verified the file's existence and the surrounding SKILL.md routing text, but did not fetch those three reference files themselves. The claim that they fix "empty web-page layouts" is HyperFrames' own description.
7. **Vibe Skills marketplace blog** ("5-minute kinetic-type workflow", subscription model) — marketing content; used only as a signal that the category exists, not cited as fact.
8. **The diagnosis that the recent test run's slop comes predominantly from element density rather than from the style itself** — my inference from your description plus the sample/contrast frames I read; the test-run frames were not available to me. Rank 1–3 is the hedge against that inference being wrong: the direction card also fixes composition and sameness.
9. **`npx skills add remotion` (bare-repo shorthand) vs `npx skills add remotion-dev/skills`** — both appear in sources; the canonical install command per Remotion's docs is `npx skills add remotion-dev/skills`.
10. **`/home/ikeji/.claude/skills/uncodixfy`** is a broken symlink; the `taste-*` skills are installed under `~/.claude/skills/`, not `~/.config/opencode/skills/`, so whether every agent harness on this machine can load them is unverified.

## Independent verification (main session, 2026-09-21)

External repos checked against the GitHub API — all exist, licences as reported:

| Repo | Stars | Licence | Last push |
|---|---|---|---|
| `iart-ai/motion-design-skills` | 31 | MIT | 2026-06-22 |
| `iart-ai/motion-skills` | 486 | MIT | 2026-06-30 |
| `SkillMedev/skills` | 14 | MIT | 2026-07-05 |
| `remotion-dev/skills` | 4,674 | no SPDX field | 2026-09-17 |
| `haidrrrry/claude-remotion-skill` | 180 | MIT | 2026-08-12 |
| `heygen-com/hyperframes` | 52,130 | Apache-2.0 | 2026-09-21 |
| `acelera-agency/html-animation` | 5 | MIT | 2026-08-12 |
| `iart-ai/explainer-video-skills` | 22 | MIT | 2026-06-22 |
| `iart-ai/kinetic-typography-skills` | 12 | MIT | 2026-06-22 |

Repo claims spot-checked in the working tree and confirmed:

- `grep -rn "scale(0)" template/src` → 0 hits (report's claim holds).
- `DotFieldBg.tsx:69` grain layer, `opacity: 0.06`, `grain = true` default → confirmed.
- Star path (`StarField.tsx` + `Fog.tsx` via `BgTrack`, `Main.tsx`) → **no grain layer**, `Main.tsx:20` background `#000`, `Fog.tsx:10` gradient `#000000 → #212121` → the rank-6 banding gap is real.
- Type scale: the style guide publishes ~20 distinct px sizes (10/12/18/22/24/26/30/33/34/36/38/42/44/48/54/60/80/96/110/150), several within 1.1× of each other — confirms the flat-scale finding (the report's exact 12-step list is a subset).

---

### Appendix — One-page action list if you only do five things
1. Add `reference/shot-direction.md` and require a filled card per shot (rank 1).
2. Add the frame budget + archetype columns, and extend `frame_metrics.py` to measure object count, ink ratio and hero margin (ranks 2–3).
3. Rewrite `composition-and-light.md` §7 into HIT → hold → build, and make `motion_check.py` distinguish dead from hold (rank 4).
4. Add grain/dither to the star-field path and tint the stage off pure black (`Fog.tsx`, `Main.tsx`) (rank 6).
5. Add the three slop-test questions to `agent-qc-rules.md` (rank 14).
