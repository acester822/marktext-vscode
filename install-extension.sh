#!/usr/bin/env bash
set -euo pipefail

# Build + install helper for the MarkText VS Code extension
# (mirrors Markdown-Preview-Aces-Edition/install-extension.sh, adapted).
#
# Order is deliberately build-then-uninstall: if the build or packaging
# fails, the currently installed version stays intact.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXT_DIR="$ROOT_DIR"
# publisher + name from package.json — the id `code`/`code-server` use.
EXT_ID="marktext-vscode.marktext-vscode"

info()  { printf "\033[1;34m%s\033[0m\n" "$1"; }
warn()  { printf "\033[1;33m%s\033[0m\n" "$1"; }
error() { printf "\033[1;31m%s\033[0m\n" "$1" >&2; }

info ""
info "=== MarkText VS Code extension: build + install helper ==="
info "Extension directory: $EXT_DIR"

if [ ! -f "$EXT_DIR/package.json" ]; then
  error "Extension directory is invalid (package.json not found): $EXT_DIR"
  exit 1
fi

PACKAGE_NAME="$(node -e 'const p=require("./package.json"); console.log(`${p.name}-${p.version}.vsix`)')"

NODE_MAJOR="$(node -e 'console.log(process.versions.node.split(".")[0])' 2>/dev/null || echo 0)"
if [ "${NODE_MAJOR:-0}" -lt 18 ] 2>/dev/null; then
  warn "Node >= 18 is recommended (found $(node -v 2>/dev/null || echo unknown))."
fi

cd "$EXT_DIR"

info "1) Dependencies"
if [ -d node_modules ]; then
  info "   node_modules present — skipping npm install (run 'npm install' manually if deps changed)."
else
  info "   node_modules missing — running npm install..."
  npm install
fi

info "2) Clean + build"
info "   Removing stale out/ so no old artifacts end up in the package..."
rm -rf out
info "   npm run build (host + webview + excalidraw editor)..."
npm run build

info "3) Package VSIX"
VSCE_CMD=""
if command -v vsce >/dev/null 2>&1; then
  VSCE_CMD="vsce"
elif command -v npx >/dev/null 2>&1; then
  VSCE_CMD="npx --yes @vscode/vsce"
else
  error "Neither 'vsce' nor 'npx' found — install @vscode/vsce (npm i -g @vscode/vsce) or npx first."
  exit 1
fi
rm -f "$PACKAGE_NAME"
info "   Running: $VSCE_CMD package --no-dependencies --out $PACKAGE_NAME"
$VSCE_CMD package --no-dependencies --out "$PACKAGE_NAME"
if [ ! -f "$PACKAGE_NAME" ]; then
  error "Packaging failed: $PACKAGE_NAME was not produced."
  exit 1
fi
info "   Produced $(du -h "$PACKAGE_NAME" | cut -f1) — $PACKAGE_NAME"

info "4) Uninstall any installed version"
CLI=""
if command -v code >/dev/null 2>&1; then
  CLI="code"
elif command -v code-server >/dev/null 2>&1; then
  CLI="code-server"
fi
if [ -n "$CLI" ]; then
  if "$CLI" --list-extensions 2>/dev/null | grep -qx "$EXT_ID"; then
    info "   Uninstalling $EXT_ID from $CLI..."
    "$CLI" --uninstall-extension "$EXT_ID" || warn "   Failed to uninstall $EXT_ID via $CLI"
  else
    info "   No installed version of $EXT_ID found via $CLI."
  fi
else
  warn "   Neither 'code' nor 'code-server' found in PATH; skipping uninstall."
fi

# Belt and braces: sweep leftover version folders the CLI may have missed.
for EXT_ROOT in "$HOME/.local/share/code-server/extensions" "$HOME/.vscode/extensions"; do
  if [ -d "$EXT_ROOT" ] && ls "$EXT_ROOT"/"$EXT_ID"-* >/dev/null 2>&1; then
    info "   Removing leftover folders in $EXT_ROOT:"
    rm -rf "$EXT_ROOT"/"$EXT_ID"-* 2>/dev/null || true
  fi
done

info "5) Clear install caches"
CACHE_DIR="$HOME/.local/share/code-server/CachedExtensionVSIXs"
if [ -d "$CACHE_DIR" ]; then
  STALE="$(ls "$CACHE_DIR"/"$EXT_ID"-*.vsix "$CACHE_DIR"/marktext-vscode-*.vsix 2>/dev/null || true)"
  if [ -n "$STALE" ]; then
    info "   Removing cached VSIX copies:"
    info "   $STALE"
    rm -f "$CACHE_DIR"/"$EXT_ID"-*.vsix "$CACHE_DIR"/marktext-vscode-*.vsix 2>/dev/null || true
  else
    info "   No cached VSIX copies for $EXT_ID."
  fi
else
  info "   No VSIX cache dir ($CACHE_DIR)."
fi

info "6) Install packaged extension"
if [ -n "$CLI" ]; then
  "$CLI" --install-extension "$EXT_DIR/$PACKAGE_NAME" --force
else
  warn "   Neither 'code' nor 'code-server' found in PATH. Install manually with:"
  warn "   code-server --install-extension '$EXT_DIR/$PACKAGE_NAME'"
  exit 0
fi

info "7) Verify"
if "$CLI" --list-extensions 2>/dev/null | grep -qx "$EXT_ID"; then
  info "   OK — $EXT_ID is installed."
else
  error "$EXT_ID not found after install — something went wrong."
  exit 1
fi

info ""
info "✅ Installed $PACKAGE_NAME successfully."
info "   Reload the code-server window (or run 'Developer: Reload Window') to activate."
info "   Confirm the bundle: the webview console should log '[marktext-webview] build <BUILD_ID> loaded'."
