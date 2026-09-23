#!/usr/bin/env bash
# Stills: still.sh <Comp: Video|Overlay|G1..G8> <frame numbers, 1-based, comma separated> <out_dir_abs> [tag]
# Note: one tag per build group (e.g. g3). After changing code, rm -rf build_dev_<tag> and rerun;
# do not use a fresh tag every time (each bundle is ~40MB).
set -e
ROOT=$(cd "$(dirname "$0")/.." && pwd); cd "$ROOT"
COMP=$1; FRAMES=$2; OUT=$3; TAG=${4:-$COMP}
[ -n "$COMP" ] && [ -n "$FRAMES" ] && [ -n "$OUT" ] || { echo "usage: still.sh <Comp> <frames> <out_dir_abs> [tag]"; exit 1; }
B=build_dev_$TAG
[ -d "$B" ] || npx remotion bundle src/index.ts --out-dir "$B" --log=error
mkdir -p "$OUT"
IFS=',' read -ra FRAME_ARR <<< "$FRAMES"
for N in "${FRAME_ARR[@]}"; do
  npx remotion still "$B" "$COMP" "$OUT/f_$(printf %04d "$N").png" --frame=$((N-1)) --log=error
done
# Clean up remotion temp bundles older than 4 hours (only clearly dead ones: other remotion
# projects/agents on this machine may be rendering right now, so a short threshold would delete
# bundles still in use). Set CLEAN_TMP=0 to disable.
[ "${CLEAN_TMP:-1}" = 1 ] && find "${TMPDIR:-/tmp}" -maxdepth 1 -name 'remotion-webpack-bundle-*' -mmin +240 -exec rm -rf {} + 2>/dev/null
ls "$OUT" | wc -l
