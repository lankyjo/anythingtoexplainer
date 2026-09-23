#!/usr/bin/env python3
"""Motion density self-check (composition-and-light.md section 9, verb-driven sustained motion):
render one group (or the finished film) at low resolution, measure frame-to-frame change in the
content area, and report still-frame share and longest hold per shot from storyboard.md.
Usage: python3 scripts/motion_check.py G3              -> render the group's frame range at 0.5x, every 3rd frame
       python3 scripts/motion_check.py --frames fin_frames   -> read a full-res frame dir (QC; every 3rd frame)
Criteria: still frames (content area 320x180 mean gray change < 0.35) <= 40%, longest hold <= 1.0 s.
Note: group-level readings (low-res render) are lenient; the full-res fin_frames pass is the final
word. --frames mode also prints the full-res changed-pixel count of the longest hold run
(true still < 800 / small-area motion < 2500)."""
import sys, os, re, glob, subprocess, tempfile, shutil
import numpy as np
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
THR = 0.35
sb = open(f'{ROOT}/storyboard.md', encoding='utf-8').read()
shots = [(m.group(1), int(m.group(2)), int(m.group(3))) for m in re.finditer(r'^\| (SC\d\d)[^|]*\| (\d+)[–-](\d+) \|', sb, re.M)]

def load(path):
    im = Image.open(path).convert('L').resize((320, 180))
    return np.asarray(im).astype(int)[28:158, :]   # drop HUD (y<110) and subtitles/progress bar (y>630)

if sys.argv[1] == '--frames':
    d = sys.argv[2]; files = sorted(glob.glob(f'{d}/f_*.jpg'))[::3]
    frames = [(int(re.search(r'f_(\d+)', f).group(1)), load(f)) for f in files]
    step = 3
else:
    comp = sys.argv[1]
    # Group frame range: read the group's shot table from the storyboard (header "## Gn (")
    m = re.search(r'## ' + comp + r'[（(].*?\n(.*?)(?=\n## |\n---)', sb, re.S)
    ids = re.findall(r'^\| (SC\d\d)', m.group(1), re.M) if m else []
    rng = [(a, b) for (i, a, b) in shots if i in ids]
    a, b = min(x[0] for x in rng), max(x[1] for x in rng)
    step = 3
    # Bundle every run: code changes and groups may render in parallel; use a process-private dir
    # and delete it afterwards
    bundle = f'{ROOT}/build_dev_mc_{os.getpid()}'
    subprocess.run(['npx', 'remotion', 'bundle', 'src/index.ts', '--out-dir', bundle, '--log=error'], cwd=ROOT, check=True)
    out = tempfile.mkdtemp(prefix='motion_check_')
    subprocess.run(['npx', 'remotion', 'render', bundle, comp, out, '--sequence', '--image-format=jpeg', '--jpeg-quality=80', '--scale=0.5', f'--every-nth-frame={step}', f'--frames={a-1}-{b-1}', '--concurrency=4', '--log=error'], cwd=ROOT, check=True)
    files = sorted(glob.glob(f'{out}/*.jpeg') + glob.glob(f'{out}/*.jpg'))
    frames = [(a + i * step, load(f)) for i, f in enumerate(files)]
    shutil.rmtree(out, ignore_errors=True)
    shutil.rmtree(bundle, ignore_errors=True)

diffs = [(frames[i + 1][0], np.abs(frames[i + 1][1] - frames[i][1]).mean()) for i in range(len(frames) - 1)]
# Secondary reading (--frames mode only): full-res changed-pixel count (> 25 gray levels over 3
# frames) in the longest hold run; separates a true still (< 800) from small-area motion
# (800-2500, e.g. a packet/cursor)
FULL = sys.argv[1] == '--frames'
def full_changed(s, e):
    d = sys.argv[2]
    imgs = [np.asarray(Image.open(f'{d}/f_{n:04d}.jpg').convert('L')).astype(int)[110:630, :] for n in range(s, e + 1, step)]
    ch = [int((np.abs(imgs[i + 1] - imgs[i]) > 25).sum()) for i in range(len(imgs) - 1)]
    return int(np.median(ch)) if ch else 0
print(f'{"shot":6s} {"len":>5s} {"still%":>7s} {"longest":>8s}  verdict' + ('   longest-run  fullres-changed-px  class' if FULL else ''))
bad = 0
for sid, a, b in shots:
    dd = [(f, v) for (f, v) in diffs if a <= f <= b]
    d = [v for (_, v) in dd]
    if len(d) < 3: continue
    still = sum(v < THR for v in d) / len(d) * 100
    run = best = 0; end = 0
    for i, v in enumerate(d):
        run = run + 1 if v < THR else 0
        if run > best: best = run; end = i
    longest = best * step / 30
    verdict = 'OK' if still <= 40 and longest <= 1.0 else ('x still>40%' if still > 40 else '') + (' x hold>1s' if longest > 1.0 else '')
    if verdict != 'OK': bad += 1
    extra = ''
    if FULL and verdict != 'OK' and best > 0:
        s_ = dd[end - best + 1][0] - step; e_ = dd[end][0]
        cp = full_changed(max(a, s_), e_)
        cls = 'still' if cp < 800 else ('small motion' if cp < 2500 else 'motion')
        extra = f'   {max(a, s_)}-{e_}  {cp:6d}  {cls}'
    print(f'{sid:6s} {(b-a+1)/30:4.1f}s {still:6.0f}% {longest:7.1f}s  {verdict}{extra}')
print(f'shots failing: {bad}')
