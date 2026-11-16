#!/usr/bin/env bash
# Copies the generated game data and pictures from the nxnative repo into data/ and img/.
# Usage: tools/sync-data.sh [path/to/panel]   (or set NXNATIVE_PANEL)
# The default is the sibling checkout: ../nxnative/dm/games/0400A3A01EE4C000/panel
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
panel="${1:-${NXNATIVE_PANEL:-$root/../nxnative/dm/games/0400A3A01EE4C000/panel}}"
files=(data.js images.js cats.js areas.js en.js crafts.js comfort.js)

if [[ ! -d "$panel" ]]; then
  echo "Panel folder not found: $panel" >&2
  echo "Pass its path as the first argument or set NXNATIVE_PANEL." >&2
  exit 1
fi
panel="$(cd "$panel" && pwd)"
for file in "${files[@]}"; do
  if [[ ! -f "$panel/$file" ]]; then
    echo "Missing $panel/$file: nothing was copied." >&2
    exit 1
  fi
done

# only data: core.js and casa.js there are code, and this app has its own
for file in "${files[@]}"; do
  cp "$panel/$file" "$root/data/$file"
done
for dir in pokemon habitats items; do
  mkdir -p "$root/img/$dir"
  cp -R "$panel/img/$dir/." "$root/img/$dir/"
done

echo "Copied ${#files[@]} data files and img/ from $panel"
echo "Run npm test, then check the app before committing."
