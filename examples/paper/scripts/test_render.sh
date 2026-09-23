#!/usr/bin/env bash
# Render 30 frames to test fps: test_render.sh <Comp> <start_frame, 1-based> [tag]
# 30 frames normally take 3-12 s; below 3 fps check filters/DOM size.
set -e
ROOT=$(cd "$(dirname "$0")/.." && pwd); cd "$ROOT"
COMP=$1; A=$2; TAG=${3:-$COMP}; B=build_dev_$TAG
[ -n "$COMP" ] && [ -n "$A" ] || { echo "usage: test_render.sh <Comp> <start_frame> [tag]"; exit 1; }
[ -d "$B" ] || npx remotion bundle src/index.ts --out-dir "$B" --log=error
OUT=$(mktemp -d "${TMPDIR:-/tmp}/explainer_test_${TAG}_XXXXXX")   # no dots: Remotion reads .XXXXXX as an image-sequence extension and refuses to render
trap 'rm -rf "$OUT"' EXIT
time npx remotion render "$B" "$COMP" "$OUT" --sequence --image-format=jpeg --frames=$((A-1))-$((A+28)) --log=error
ls "$OUT" | wc -l
