# Paper style: good / bad pairs

Four rules, one BAD / GOOD pair each, rendered from `PaperContrast` in the template
(`npx remotion still src/index.ts PaperContrast out.jpg --frame=45|135|225|315`).

| Pair | Rule | Bad | Good |
|---|---|---|---|
| `01_focal_point.jpg` | One focal point | four statements at the same size, nothing wins | one big light number + caption + accent rule |
| `02_density.jpg` | Rows breathe | five rows squeezed in, no rules, no margins | four hairline rows with notes and space |
| `03_accent_dosage.jpg` | Accent marks the current step only | every row coral | one active row coral, the rest ink |
| `04_type_scale.jpg` | Three type sizes, not one | label, value and note all 21px | 13px kicker / 64px value / 18px note |

Rules that cannot be shown in a still (motion hold, snap -> hold -> build, entrance timing) live in
`reference/composition-and-light.md`; the frame checks in `scripts/frame_metrics.py` and
`scripts/motion_check.py` enforce them.
