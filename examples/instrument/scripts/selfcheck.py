#!/usr/bin/env python3
"""Static self-check for the main session (no render, a few seconds; complements pixel QC):
  1) Frame coverage: {id, from, to} in each group's index.ts vs the shot ranges in storyboard.md;
     reports holes / overlaps / missing shots.
  2) Flash whitelist: GlitchIn occurrences per SCxx.tsx vs the storyboard whitelist line.
  3) On-screen literals: strings that appear in shot files, filtered of CSS/identifier noise,
     listed when they do not appear in storyboard.md, for human review.
Usage: python3 scripts/selfcheck.py [G1 G2 ...] (no args = every built group)"""
import re, os, sys, glob, json
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sb = open(f'{ROOT}/storyboard.md', encoding='utf-8').read()

# ---- shot ranges from the storyboard ----
sb_shots = {}
for m in re.finditer(r'^\| (SC\d\d)[^|]*\| (\d+)[–-](\d+) \|', sb, re.M):
    sb_shots[m.group(1)] = (int(m.group(2)), int(m.group(3)))

# ---- flash whitelist ----
wl_line = re.search(r'^\*\*Flash whitelist\*\*:?(.*)$', sb, re.M)
whitelist = {}
if wl_line:
    for part in wl_line.group(1).split('·'):
        mm = re.match(r'\s*(SC\d\d)\s+(.*)', part.strip())
        if mm: whitelist[mm.group(1)] = mm.group(2).strip()

groups = sys.argv[1:] or sorted(os.path.basename(p) for p in glob.glob(f'{ROOT}/src/shots/G*'))
problems = 0

# ---- 1) frame coverage ----
built = {}
for g in groups:
    idx = f'{ROOT}/src/shots/{g}/index.ts'
    if not os.path.exists(idx): continue
    src = open(idx, encoding='utf-8').read()
    for m in re.finditer(r"id:\s*'([^']+)'\s*,\s*from:\s*(\d+)\s*,\s*to:\s*(\d+)", src):
        built[m.group(1)] = (int(m.group(2)), int(m.group(3)), g)
    if not re.search(r"id:\s*'", src):
        print(f'[coverage] {g}: index.ts has no literal from/to (constants?) -> check by hand')
print(f'[coverage] storyboard shots {len(sb_shots)}; built {len(built)}')
for sid, (a, b) in sorted(sb_shots.items()):
    if sid in built:
        ba, bb, g = built[sid]
        if (ba, bb) != (a, b):
            print(f'  x {sid} ({g}) range {ba}-{bb} != storyboard {a}-{b}'); problems += 1
_tl = json.load(open(f'{ROOT}/script/timeline.json'))
_chapter_starts = {c['from'] for c in _tl['chapters']}
ids = sorted(built, key=lambda k: built[k][0])
for p, q in zip(ids, ids[1:]):
    gap = built[q][0] - built[p][1]
    # Chapter cards occupy (previous chapter's last sentence to+3 -> this chapter's first from-9);
    # a hole exactly there is by design
    if gap > 1 and any(built[q][0] == cs - 8 for cs in _chapter_starts):
        print(f'  . chapter-card gap {p}->{q}: {built[p][1]}->{built[q][0]} (overlay takes over)'); continue
    if gap > 1: print(f'  x hole {p}->{q}: {built[p][1]}->{built[q][0]} ({gap-1} frames unshot)'); problems += 1
    if gap < -4: print(f'  x overlap {p}->{q}: {-gap+1} frames'); problems += 1

# ---- 2) flash (classic pack only: the new packs have no glitch effect) ----
STYLE = re.search(r"style:\s*'(paper|instrument|poster)'", open(f'{ROOT}/src/config.ts', encoding='utf-8').read())
STYLE = STYLE.group(1) if STYLE else 'classic'
if STYLE == 'classic':
    print(f'[glitch] whitelist entries {len(whitelist)}')
    for g in groups:
        for f in sorted(glob.glob(f'{ROOT}/src/shots/{g}/SC*.tsx')):
            sid = os.path.basename(f)[:4]
            src = open(f, encoding='utf-8').read()
            n = len(re.findall(r'<GlitchIn\b', src)) + len(re.findall(r'glitchOpacity\(', src))
            want = 1 if sid in whitelist else 0
            flag = '' if n == want else '  x'
            if n != want: problems += 1
            print(f'  {sid} GlitchIn x{n} (whitelist {whitelist.get(sid, "-")}){flag}')
else:
    print(f'[glitch] skipped: {STYLE} pack has no glitch effect')

# ---- 3) literals ----
noise = re.compile(r'^(#|rgb|[0-9.\s%pxem-]+$|[a-z][A-Za-z0-9]*$|\.\./|src/|[A-Z_]+$|none|auto|absolute|relative|center|left|right|top|bottom|solid|dashed|round|butt|square|nowrap|hidden|visible|inherit|bold|italic|normal)')
print('[literals] on-screen strings not found in storyboard.md (review by hand):')
seen = set()
for g in groups:
    for f in sorted(glob.glob(f'{ROOT}/src/shots/{g}/*.tsx')):
        src = open(f, encoding='utf-8').read()
        for s in re.findall(r"(?:'|\"|`)([^'\"`\n]{3,80})(?:'|\"|`)", src):
            s2 = s.strip()
            if not s2 or noise.match(s2) or s2 in seen: continue
            if '${' in s2 or 'px' in s2 or 'rgba' in s2 or 'gradient' in s2 or re.fullmatch(r'[\d.,\s]+', s2) or s2.startswith('./') or re.match(r'^[a-zA-Z-]+\(', s2) or s2 in ('border-box','content-box'): continue  # CSS / template strings / paths
            if re.fullmatch(r'[\d.,x×%+\-–\s]+', s2): pass  # always list numeric strings
            elif not re.search(r'[A-Za-z]{3}', s2): continue
            if s2 in sb: continue
            seen.add(s2); print(f'  {os.path.basename(f)}: {s2}')
print(f'\nproblems: {problems}')
