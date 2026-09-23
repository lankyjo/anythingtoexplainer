#!/usr/bin/env bash
# Create a new project from the template: new_project.sh <dest_dir> <slug>
set -e
HERE=$(cd "$(dirname "$0")/.." && pwd)
DEST=$1; SLUG=${2:-video}
[ -n "$DEST" ] || { echo "usage: new_project.sh <dest_dir> <slug>"; exit 1; }
# This script must stay in template/scripts/: $HERE is the rsync source below. If the script is
# copied elsewhere, $HERE points at an unrelated dir (worst case /) and rsync copies that tree.
[ -f "$HERE/src/config.ts" ] && [ -d "$HERE/src/common" ] || { echo "template not found ($HERE does not look like template/); run this from template/scripts/"; exit 1; }
# The slug goes into filenames, sed expressions and render commands; allow safe characters only
case "$SLUG" in
  ''|*[!A-Za-z0-9_-]*) echo "slug must use letters/digits/-/_ only, got: $SLUG"; exit 1;;
esac
mkdir -p "$DEST"
rsync -a --exclude node_modules --exclude 'build*' --exclude renders --exclude fin_frames --exclude stills --exclude 'audio/cache' "$HERE/" "$DEST/"
sed -i.bak "s/slug: 'demo'/slug: '$SLUG'/" "$DEST/src/config.ts" && rm -f "$DEST/src/config.ts.bak"
mkdir -p "$DEST/public/assets/$SLUG" "$DEST/script" "$DEST/research" "$DEST/qc" "$DEST/stills" "$DEST/renders"
cd "$DEST" && npm install --silent && npx tsc --noEmit && echo "project ready: $DEST (slug=$SLUG)"
