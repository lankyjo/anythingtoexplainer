# Style packs: the contract

A film uses exactly one pack. `config.style` selects it; shot code imports everything from
`src/ui.tsx` and never switches style itself.

## 1. Canvas and safe areas (global, every pack)

1280x720 at 30 fps. Frame numbers start at 1 and are inclusive.

| Area | Pixels | Rule |
|---|---|---|
| Top HUD band | y 28-79 | Pack chrome draws here; keep the height so chapter/time stays put |
| Content area | x 60-1220, y 110-620 | all key information; chapters with a rail use y 175-620 |
| Subtitle band | CSS top 637, ink y 644-684 | **no content, no entrance path may cross it** |
| Progress band | y 687-720 | only full-width background or large shapes may cross; it brightens what it covers |
| z-order | backdrop < footage < overlay chrome < shots < ending fade < progress < aboveBar shots < subtitles | |

## 2. What a pack defines

| Part | Lives in | Contract |
|---|---|---|
| Tokens | `src/styles/<pack>/tokens.ts` | `bg`, `ink`, `muted`, `hair`, `ring`, one `accent`; font family |
| Fonts | `src/styles/<pack>/fonts.tsx` | loads its own FontFace files with `delayRender`; OFL notice committed next to the font |
| Backdrop | `src/styles/<pack>/Rings.tsx` etc. | one structural motif, drawn from tokens, no animation budget of its own |
| Chrome | `src/styles/<pack>/chrome.tsx` | HUD, subtitle line, progress bar, title / chapter card / end credit |
| Primitives | `src/styles/<pack>/primitives.tsx` | hairline row, step list, big number, ring target, ranked bar, leader-line label |
| Demo | `src/styles/<pack>/Demo.tsx` | one composition showing every piece, for stills |

Chrome **timings** are global: `src/common/chromeSpec.ts` decides when the title, chapter cards,
HUD, rails, ending fade and credit appear. Packs only draw them, so two packs cannot drift apart.

## 3. Global law (applies to every pack)

- One focal point per frame; if two things compete, delete or mute one.
- Type floor 22px for anything on screen; on-screen numbers and terms must be traceable to the
  research document.
- The accent colour marks the current step or key word only - at most one large accent area per
  frame. Everything else is ink, muted or hairline.
- Motion: every sentence gets a visible change; nothing sits completely still for more than 30
  frames after its entrance; shots use snap -> hold -> build, never a single ease over the whole
  shot. Entrance lands within -6..+3 frames of its subtitle block start. Details and frame budgets:
  `composition-and-light.md` and `motion-vocabulary.md`.
- One running example context across the whole film (the sample uses expense reports).
- Subtitles: at most 48 characters per block; `config.subtitles` may hide the band, but the layout
  does not change when it is off.

## 4. The packs

| Pack | Status | Guide |
|---|---|---|
| `paper` | default | `reference/styles/paper.md` |
| `instrument` | planned | dial structure, teal data colour, measured readout |
| `poster` | planned | type-led, asymmetric, one committed colour |

The classic pack (black canvas, purple, star field, glitch) is legacy: it still renders until it is
retired, but it is documented by its code (`src/styles/classic/`) and gets no guide.

## 5. Adding a pack

1. Copy `src/styles/paper/` to `src/styles/<pack>/`, replace tokens, fonts and backdrop.
2. Implement chrome and primitives with the same export names.
3. Point `config.style` at it and render `npx remotion still src/index.ts <pack>Demo`.
4. Add its contrast pairs under `examples/<pack>-contrast/`.
5. Write `reference/styles/<pack>.md`: tokens, chrome geometry, primitives, what the pack avoids.
