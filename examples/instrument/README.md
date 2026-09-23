# Instrument sample: "Retrieval-Augmented Generation" (33 s)

The same narration, storyboard and shots as `examples/paper`, re-rendered with the Instrument pack
(`config.style: 'instrument'`). This is the apples-to-apples style comparison: only the pack
(chrome, backdrop, fonts, primitives, accent colour) differs.

- `sample.mp4` - the rendered film (1280x720, 30 fps, 991 frames = 33.0 s, kokoro `am_liam`)
- `frames/ref_*.jpg` - reference stills
- `script/`, `research/`, `storyboard.md` - identical content to the Paper sample
- `src/shots/P1/` - the same six shots (they import from `src/ui.tsx`, the active-pack facade)
- `qc/frame_metrics_v1.md` - composition/light metrics for this render

## QC readings

- `frame_metrics.py`: high 0 / mid 0 / low 1 (SC06 `low:hero<170px`, 150px: the answer block's ink
  rules read just under the threshold while the frame's focal point is clear in the stills).
- `motion_check.py`: 6/6 shots OK (still frames 0-8%, longest hold <= 0.1 s).
- `selftest.py --project examples/instrument`: guard cases, width table and audio onsets pass
  (the audio file is shared with the Paper sample).

## Notes

- The dial backdrop is the pack's structural motif; the shots' dot grids, paths and rules stay the
  same because they are written against the pack facade.
- Rendering another pack is one config value: `style: 'instrument'` (or `poster`).
