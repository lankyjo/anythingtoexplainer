#!/usr/bin/env bash
# English-only gate. Fails when:
#   1. any tracked text file contains a CJK character;
#   2. any bundled font carries CJK glyph coverage;
#   3. docs/image-inventory.md does not list every committed image.
#
# Binary media (images, video, fonts, archives) are skipped for the text scan; fonts are checked by
# glyph coverage instead. Run from the repo root: bash check_english.sh
set -uo pipefail
ROOT=$(cd "$(dirname "$0")" && pwd)
cd "$ROOT"
fail=0

echo "== text files =="
while IFS= read -r f; do
  case "$f" in
    *.png|*.jpg|*.jpeg|*.gif|*.webp|*.mp4|*.mov|*.ttf|*.otf|*.woff|*.woff2|*.ico|*.pdf|*.zip|*.gz) continue ;;
  esac
  [ -f "$f" ] || continue
  if hit=$(grep -nP '[\x{3400}-\x{4dbf}\x{4e00}-\x{9fff}\x{f900}-\x{faff}]' "$f" 2>/dev/null | head -3); then
    if [ -n "$hit" ]; then
      echo "CJK in $f:"
      echo "$hit"
      fail=1
    fi
  fi
done < <(git ls-files)
[ "$fail" = 0 ] && echo "ok: no CJK in tracked text files"

echo "== bundled fonts =="
PY=python3
[ -x "$HOME/.venvs/a2e/bin/python3" ] && PY="$HOME/.venvs/a2e/bin/python3"
"$PY" - <<'PY' || fail=1
import glob, sys
try:
    from fontTools.ttLib import TTFont
except ImportError:
    print('fontTools missing: pip install fonttools'); sys.exit(1)
bad = []
for path in sorted(glob.glob('template/public/fonts/*.ttf') + glob.glob('template/public/fonts/*.otf')):
    try:
        f = TTFont(path, fontNumber=0, lazy=True)
        cmap = f.getBestCmap()
        cjk = [c for c in (0x4E2D, 0x56FD, 0x65E5) if c in cmap]
        if cjk:
            bad.append(f'{path}: CJK glyphs {[hex(c) for c in cjk]}')
        f.close()
    except Exception as e:
        bad.append(f'{path}: cannot read ({e})')
if bad:
    print('\n'.join(bad)); sys.exit(1)
print('ok: bundled fonts have no CJK glyph coverage')
PY

echo "== image inventory =="
INV=docs/image-inventory.md
if [ ! -f "$INV" ]; then
  echo "missing $INV"; fail=1
else
  missing=0
  while IFS= read -r img; do
    grep -qF "$img" "$INV" || { echo "not in inventory: $img"; missing=1; }
  done < <(git ls-files | grep -E '\.(png|jpg|jpeg)$')
  [ "$missing" = 0 ] && echo "ok: every committed image is listed in $INV" || fail=1
fi

echo "== markdown links =="
"$PY" - <<'PY' || fail=1
import os, re, subprocess, sys
files = subprocess.check_output(['git', 'ls-files', '*.md'], text=True).split()
bad = []
for f in files:
    text = open(f, encoding='utf-8').read()
    text = re.sub(r'`[^`]*`', '', text)  # ignore link-like syntax inside inline code
    for m in re.finditer(r'\[[^\]]*\]\(([^)]+)\)', text):
        target = m.group(1).strip().strip('<>').split('#')[0].strip()
        if not target or target.startswith(('http://', 'https://', 'mailto:', '#')):
            continue
        p = os.path.normpath(os.path.join(os.path.dirname(f), target))
        if not os.path.exists(p):
            bad.append(f'{f}: {target}')
if bad:
    print('\n'.join(bad)); sys.exit(1)
print('ok: relative links in tracked markdown resolve')
PY

echo
if [ "$fail" = 0 ]; then echo "check_english: PASS"; else echo "check_english: FAIL"; exit 1; fi
