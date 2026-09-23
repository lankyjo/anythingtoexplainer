#!/usr/bin/env bash
# Preview the first N seconds (checkpoint 3: show the style before rendering the whole film):
#   preview.sh [seconds=30] [start_second=0]
#   -> renders/<slug>_preview_<a>-<b>s.mp4 (voiceover/subtitles/progress bar included; groups
#      that are not built yet render as empty frames, which is normal)
set -e
ROOT=$(cd "$(dirname "$0")/.." && pwd); cd "$ROOT"
NCPU=$(getconf _NPROCESSORS_ONLN 2>/dev/null || echo 6); [ "$NCPU" -gt 6 ] && NCPU=6
SEC=${1:-30}; FROM=${2:-0}
SLUG=$(python3 -c "import re;print(re.search(r\"slug:\\s*'([^']+)'\", open('src/config.ts').read()).group(1))")
TOTAL=$(python3 -c "import re;print(re.search(r'TOTAL_FRAMES\s*=\s*(\d+)', open('src/common/timeline.ts').read()).group(1))")
A=$((FROM * 30)); B=$((A + SEC * 30 - 1))
[ $B -gt $((TOTAL - 1)) ] && B=$((TOTAL - 1))
mkdir -p renders
OUTF="renders/${SLUG}_preview_${FROM}-$((FROM + SEC))s.mp4"
[ "${SKIP_BUNDLE:-0}" = 1 ] && [ -d build_prev ] || { rm -rf build_prev && npx remotion bundle src/index.ts --out-dir build_prev --log=error; }
npx remotion render build_prev Video "$OUTF" --codec=h264 --crf=18 --frames=$A-$B --concurrency=${CONC:-$NCPU} --timeout=${RTIMEOUT:-300000} --log=error
[ -s "$OUTF" ] || { echo "PREVIEW FAILED"; exit 1; }
[ "${KEEP_BUNDLE:-0}" = 1 ] || rm -rf build_prev
echo "$OUTF"
