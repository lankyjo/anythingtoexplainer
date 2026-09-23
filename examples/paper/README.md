# Paper sample: "Retrieval-Augmented Generation" (33 s)

The 30-second class sample film for the Paper pack, built through the full pipeline. The same
narration script is re-rendered by the instrument and poster samples so the three looks can be
compared directly.

- `sample.mp4` - the rendered film (1280x720, 30 fps, 991 frames = 33.0 s, kokoro `am_liam`)
- `frames/ref_*.jpg` - reference stills (title, cutoff, invented, rag, vectors, retrieve, citations, credit)
- `script/narration.txt` - the script; `script/storyboard_src.md` -> `storyboard.md` - the storyboard
- `research/research.md` - the fact source (every on-screen number and term is traceable there)
- `src/shots/P1/` - the six shots; `src/config.ts` - film config (style `paper`)
- `qc/frame_metrics_v1.md` - the composition/light metrics for the finished film

## Pipeline (how it was built)

```bash
bash template/scripts/new_project.sh examples/paper rag-paper   # scaffold + npm install + tsc
~/.venvs/a2e/bin/python3 scripts/tts_build.py                   # voiceover + timeline + subtitles
~/.venvs/a2e/bin/python3 scripts/render_storyboard.py           # storyboard_src.md -> storyboard.md
VER=v1 bash scripts/render.sh                                   # mp4 + fin_frames + contact sheet
```

## QC readings (finished film)

- `frame_metrics.py --frames fin_frames --storyboard storyboard.md`: high 0 / mid 0 / low 2.
  - SC02 `low:hero<170px` (128px) and SC06 `low:hero<170px` (126px) are known gaps: the Paper pack
    draws thin rules and dot matrices, and the metric derives hero size from ink extents, so a wide
    but low block of rules reads under the threshold. The captions and the stills show both frames
    carry a clear focal point.
- `motion_check.py --frames fin_frames`: 6/6 shots OK (still frames 0-6%, longest hold <= 0.1 s).
  The sustained motion is a 3px "reading rule" that sweeps each composition on an 80-frame cycle,
  plus the per-shot motion (column wave, travelling phase, dot rows, leader lines).
- `selfcheck.py P1`: frame coverage 6/6, chapter-card gap recognised, no unknown on-screen literals.
- `selftest.py --project examples/paper`: 6/6 (guard cases, width table, audio onsets vs timeline).

## Notes

- The film uses the Paper pack's title, chapter card, HUD, subtitle band, progress bar, ending veil
  and credit (`src/styles/paper/`); no classic-pack elements are used.
- All visuals are drawn in code; the only quoted facts are the 2020 paper, its authors and its URL.
