#!/usr/bin/env bash
# Refresh vendor/muya from a local MarkText checkout.
#
# The extension bundles MarkText's muya engine directly (see vendor/muya/README.md)
# rather than depending on @muyajs/core from npm, because the published 0.2.0
# tarball is a stale 2024 build that is missing TableChessboard and renames the
# zhCN locale export. This script re-copies the engine from a real checkout.
#
# Usage:  MARKTEXT_PATH=/path/to/marktext npm run vendor:muya
set -euo pipefail

MARKTEXT_PATH="${MARKTEXT_PATH:-$HOME/Apps/marktext}"
SRC="$MARKTEXT_PATH/packages/muya"
DEST="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/vendor/muya"

if [ ! -d "$SRC/lib/es" ]; then
  echo "error: no built muya at $SRC/lib/es" >&2
  echo "  set MARKTEXT_PATH to a MarkText checkout and build packages/muya first." >&2
  exit 1
fi

echo "vendoring muya from $SRC"
rm -rf "$DEST"
mkdir -p "$DEST/lib" "$DEST/src/assets" "$DEST/src/ui"

# Runtime: the ESM entry, its sibling chunks, and the hashed asset files they
# import. umd/ and cjs/ are deliberately skipped (~8MB, unused by the esbuild
# IIFE bundle). types/ is kept for editor IntelliSense (tsconfig paths).
cp -r "$SRC/lib/es" "$DEST/lib/es"
cp -r "$SRC/lib/assets" "$DEST/lib/assets"
cp -r "$SRC/lib/types" "$DEST/lib/types"
cp "$SRC"/lib/*.mjs "$DEST/lib/"

# Styles: the editor surface plus each UI plugin's index.css, which the JS
# bundle drops via --loader:.css=empty and muya-styles.css re-imports.
# icons/ is needed too: the stylesheets reference ../icons/*.png.
cp -r "$SRC/src/assets/styles" "$DEST/src/assets/styles"
cp -r "$SRC/src/assets/icons" "$DEST/src/assets/icons"
for d in "$SRC"/src/ui/*/; do
  if [ -f "$d/index.css" ]; then
    name="$(basename "$d")"
    mkdir -p "$DEST/src/ui/$name"
    cp "$d/index.css" "$DEST/src/ui/$name/"
  fi
done

# Provenance.
cp "$SRC/package.json" "$DEST/muya-package.json"
if git -C "$MARKTEXT_PATH" rev-parse HEAD >/dev/null 2>&1; then
  git -C "$MARKTEXT_PATH" rev-parse HEAD > "$DEST/COMMIT"
  git -C "$MARKTEXT_PATH" describe --tags --always >> "$DEST/COMMIT" 2>/dev/null || true
fi

echo "vendored $(du -sh "$DEST" | cut -f1) to $DEST"
