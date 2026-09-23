# Poster sample: "Retrieval-Augmented Generation" (33 s)

The same narration, storyboard and shots as `examples/paper`, re-rendered with the Poster pack
(`config.style: 'poster'`). With the Instrument sample this completes the three-way comparison:
identical content, identical timing, three different packs.

- `sample.mp4` - the rendered film (1280x720, 30 fps, 991 frames = 33.0 s, kokoro `am_liam`)
- `frames/ref_*.jpg` - reference stills
- `script/`, `research/`, `storyboard.md` - identical content to the Paper sample
- `src/shots/P1/` - the same six shots (imported from `src/ui.tsx`, the active-pack facade)
- `qc/frame_metrics_v1.md` - composition/light metrics for this render

## QC readings

- `frame_metrics.py`: high 0 / mid 0 / low 0.
- `motion_check.py`: 6/6 shots OK (still frames <= 6%, longest hold <= 0.1 s).
- `selftest.py --project examples/poster`: guard cases, width table and audio onsets pass
  (the audio file is shared with the Paper sample).

## Notes

- Poster is type-led: the 124px extra-light headline, the cropped arcs and one committed blue
  replace the Paper pack's hairlines and coral, and the Instrument pack's dial.
- Local focus rings are drawn at reduced opacity so the solid blue dot remains the only accent.
