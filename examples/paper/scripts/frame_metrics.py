#!/usr/bin/env python3
"""Per-shot composition/light/motion metrics for the active style pack (see
reference/composition-and-light.md section 6 and agent-qc-rules.md).
Usage:
  python3 scripts/frame_metrics.py [--frames fin_frames] [--style auto|classic|paper|instrument|poster]
      [--storyboard storyboard.md] [--shots SC11:1627-1806,SC12:1852-1965] [--step 4] [--out qc/frame_metrics_vN.md]

Pack models: classic is a dark canvas with purple accents and glow; paper / instrument / poster are
light canvases with one accent colour and no glow. The light packs measure ink (dark pixels) as the
subject and compare accent fragments against the pack accent RGB. `--style auto` reads config.style.

Per shot it reports: hero scale (largest object height; wide objects count as min(w,4h)/2.5; a line
of large type counts as the whole line) median/min, longest empty run, glow area (classic only;
hero/whole) median, accent fragment count median, longest still run, and flags.
Dependencies: numpy pillow scipy.
"""
import argparse, os, re, sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

PACKS = {
    'classic': {'accent': (102, 48, 248), 'light': False},
    'paper': {'accent': (226, 84, 59), 'light': True},
    'instrument': {'accent': (11, 110, 95), 'light': True},
    'poster': {'accent': (29, 63, 191), 'light': True},
}
INK_MAX_LUM = 200  # light packs: pixels darker than this count as subject (paper is ~246)

ap = argparse.ArgumentParser()
ap.add_argument('--frames', default='fin_frames')
ap.add_argument('--storyboard', default='storyboard.md')
ap.add_argument('--shots', default='')
ap.add_argument('--step', type=int, default=4)
ap.add_argument('--out', default='')
ap.add_argument('--style', default='auto', help='auto reads config.style; classic|paper|instrument|poster override')
ap.add_argument('--rail-top', type=int, default=100, help='content-area top edge (shots with a rail can pass 175)')
ap.add_argument('--bg', default='auto', help="classic backdrop stars|dots|auto (auto reads bg from src/config.ts); ignored by light packs")
a = ap.parse_args()

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def cfg_val(pattern, default):
    try:
        m = re.search(pattern, open(f'{ROOT}/src/config.ts', encoding='utf-8').read())
        return m.group(1) if m else default
    except OSError:
        return default

STYLE = cfg_val(r"style:\s*'(paper|instrument|poster)'", 'classic') if a.style == 'auto' else a.style
PACK = PACKS.get(STYLE, PACKS['classic'])
LIGHT = PACK['light']
ACCENT = PACK['accent']

BG = 'light' if LIGHT else (cfg_val(r"bg:\s*'(stars|dots)'", 'stars') if a.bg == 'auto' else a.bg)

def dot_mask(W=1280, H=720, r=5):
    """Screen-coordinate mask for the classic dot-field backdrop (same constants as
    src/common/DotFieldBg.tsx: design space 960x540, step 36, origin (24,18), scaled uniformly)."""
    m = np.zeros((H, W), bool)
    if LIGHT or BG != 'dots':
        return m
    sc = max(W / 960, H / 540); ox = (W - 960 * sc) / 2; oy = (H - 540 * sc) / 2
    yy, xx = np.ogrid[-r:r + 1, -r:r + 1]; disc = (xx * xx + yy * yy) <= r * r
    for y in range(18, 540, 36):
        for x in range(24, 960, 36):
            cx = int(round(ox + x * sc)); cy = int(round(oy + y * sc))
            y0, y1 = max(0, cy - r), min(H, cy + r + 1); x0, x1 = max(0, cx - r), min(W, cx + r + 1)
            if y1 <= y0 or x1 <= x0: continue
            m[y0:y1, x0:x1] |= disc[(y0 - cy + r):(y1 - cy + r), (x0 - cx + r):(x1 - cx + r)]
    return m
DOT_MASK = dot_mask()
# The classic dot-field base colour #0b0c11 is slightly blue (sat~.35, lum~12) and falls into the
# soft-glow rule across the whole screen, so in dots mode the soft-glow floor rises to 22.
SOFT_LO = 22 if BG == 'dots' else 10

def parse_shots():
    if a.shots:
        out = []
        for tok in a.shots.split(','):
            sid, rng = tok.split(':'); lo, hi = re.split(r'[–-]', rng)
            out.append((sid, int(lo), int(hi)))
        return out
    out = []
    for line in open(a.storyboard, encoding='utf-8'):
        m = re.match(r'^\|\s*(SC\d+)[^|]*\|\s*(\d+)\s*[–-]\s*(\d+)\s*\|', line)
        if m:
            out.append((m.group(1), int(m.group(2)), int(m.group(3))))
    seen = {}
    for s in out:
        seen.setdefault(s[0], s)
    return list(seen.values())

def frame_path(i):
    p = os.path.join(a.frames, f'f_{i:04d}.jpg')
    return p if os.path.exists(p) else os.path.join(a.frames, f'frame_{i:04d}.jpg')

Z = slice(a.rail_top, 621)

def analyze(i):
    im = Image.open(frame_path(i)).convert('RGB'); arr = np.asarray(im).astype(np.int32)
    r, g, b = arr[..., 0], arr[..., 1], arr[..., 2]
    lum = (r * 299 + g * 587 + b * 114) // 1000
    mx = arr.max(2); mn = arr.min(2); sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1), 0)
    if LIGHT:
        subject = lum[Z] < INK_MAX_LUM
    else:
        subject = (lum[Z] > 120) & ~DOT_MASK[Z]
    # Horizontal 41 / vertical structuring element: joins letters of one large-type line into one
    # object, but not capsule rows with >= 50px gaps. Light packs draw thin rules and dot matrices,
    # so their vertical reach is larger (37): a 36px-pitch matrix or a tight paragraph of rules is
    # one visual unit there.
    obj = ndi.binary_dilation(subject, structure=np.ones((37 if LIGHT else 13, 41), bool))
    lab, n = ndi.label(obj)
    hero_h = 0; hero_box = None; small = 0
    if n:
        ink = ndi.sum(subject, lab, index=np.arange(1, n + 1))
        for k, s in enumerate(ndi.find_objects(lab)):
            if s is None or ink[k] < 30: continue
            h = s[0].stop - s[0].start; w = s[1].stop - s[1].start
            if h < 60 and w < 60: small += 1
            size = max(h, min(w, 4 * h) / 2.5)
            if size > hero_h: hero_h = size; hero_box = s
    if LIGHT:
        soft = np.zeros(subject.shape, bool)  # light packs have no glow model
    else:
        soft = (sat[Z] > 0.25) & (lum[Z] > SOFT_LO) & (lum[Z] < 110) & ~DOT_MASK[Z]
    glow_total = int(soft.sum())
    glow_hero = 0
    if hero_box is not None:
        y0 = max(0, hero_box[0].start - 30); y1 = hero_box[0].stop + 30
        x0 = max(0, hero_box[1].start - 30); x1 = hero_box[1].stop + 30
        sub = soft[y0:y1, x0:x1]
        if sub.any():
            lab2, n2 = ndi.label(sub)
            glow_hero = int(np.bincount(lab2.ravel())[1:].max()) if n2 else 0
    # Accent fragments: solid accent colour (excludes haze and dashed ripples), no dilation,
    # >=80px counts as one fragment
    if LIGHT:
        cr, cg, cb = ACCENT
        acc = ((r[Z] - cr) ** 2 + (g[Z] - cg) ** 2 + (b[Z] - cb) ** 2) < 70 ** 2
    else:
        acc = (b[Z] > r[Z]) & (r[Z] > g[Z]) & (sat[Z] > 0.45) & (lum[Z] > 45)
    lab3, n3 = ndi.label(ndi.binary_dilation(acc, structure=np.ones((7, 25), bool)))
    nacc = int((np.bincount(lab3.ravel())[1:] >= 80).sum()) if n3 else 0
    return hero_h, glow_hero, nacc, small, int(subject.sum()), glow_total

def diff_series(lo, hi):
    prev = None; out = []
    for i in range(lo, hi + 1):
        im = Image.open(frame_path(i)); im.draft('L', (320, 180)); l = np.asarray(im.convert('L').resize((320, 180))).astype(np.int32)
        out.append(0 if prev is None else float(np.abs(l - prev).mean())); prev = l
    return out

shots = parse_shots()
if not shots:
    sys.exit('no shot ranges parsed: check --storyboard or pass --shots')
accent_col = 'Accent' if LIGHT else 'Purple'
lines = [f'| Shot | Frames | Hero scale med/min px | Longest empty run | Glow hero/all med px2 | {accent_col} frags med | Longest still | Flags |', '|---|---|---|---|---|---|---|---|']
flags_total = {'high': 0, 'mid': 0, 'low': 0}
for sid, lo, hi in shots:
    hh = []; gl = []; pp = []; sm = []; gt = []
    for i in range(lo, hi + 1, a.step):
        h, g, p, s, inkpx, g_all = analyze(i)
        if inkpx < 200: h = 0
        hh.append(h); gl.append(g); pp.append(p); sm.append(s); gt.append(g_all)
    hh = np.array(hh); gt = np.array(gt); run = 0; best = 0
    for h, g_all in zip(hh, gt):
        run = run + 1 if (h < 110 and g_all < 10000) else 0; best = max(best, run)
    low_run = best * a.step
    d = diff_series(lo, hi); srun = 0; sbest = 0
    for v in d[1:]:
        srun = srun + 1 if v < 0.15 else 0; sbest = max(sbest, srun)
    flags = []
    solid = hh[(hh > 0) & ~((hh < 110) & (gt >= 10000))]
    med_h = float(np.median(solid)) if len(solid) else 0.0; min_h = int(hh.min())
    if low_run > 45:
        low_vals = hh[(hh < 110) & (hh > 0)]
        flags.append('high:empty(hero<80px>45f)' if len(low_vals) and np.median(low_vals) < 80 else 'mid:empty(hero<110px>45f)')
    elif med_h < 170:
        flags.append('low:hero<170px')
    if not LIGHT and float(np.median(gl)) < 800: flags.append('low:hero unlit')
    if float(np.median(pp)) >= 8: flags.append(('low:accent fragments>=8' if LIGHT else 'low:purple fragments>=8'))
    if float(np.median(sm)) >= 10: flags.append('mid:background clutter>=10')
    if sbest > 45: flags.append(f'low:still {sbest}f')
    for f in flags:
        flags_total[f.split(':')[0]] += 1
    lines.append(f'| {sid} | {lo}-{hi} | {med_h:.0f} / {min_h} | {low_run} | {np.median(gl):.0f} / {np.median(gt):.0f} | {np.median(pp):.0f} | {sbest} | {"; ".join(flags) or "OK"} |')
head = f'# Composition/light/motion metrics ({a.frames}, step {a.step}, pack {STYLE}, backdrop {BG})\n\nFlag totals: high {flags_total["high"]} / mid {flags_total["mid"]} / low {flags_total["low"]}. Criteria: reference/composition-and-light.md section 6.\n\n'
txt = head + '\n'.join(lines) + '\n'
if a.out:
    os.makedirs(os.path.dirname(a.out) or '.', exist_ok=True); open(a.out, 'w', encoding='utf-8').write(txt); print(a.out)
print(txt)
