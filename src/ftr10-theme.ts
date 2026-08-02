/**
 * FTR10 Architect theme integration.
 *
 * Mirrors the approach used by Markdown-Preview-Aces-Edition: the FTR10
 * Architect theme engine writes its live design tokens to
 * `~/.ftr10/css.files/colors.css`. We read that file, fall back to a bundled
 * snapshot when Architect is not installed, and watch it so palette changes
 * reach an open editor without a reload.
 *
 * On top of the raw tokens we emit a bridge stylesheet that maps `--ftr10-*`
 * onto the CSS variables muya's own stylesheets actually consume
 * (`--editor-color`, `--float-bg-color`, …). Without that bridge the tokens
 * would be present but inert, since muya never references `--ftr10-*`.
 */
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { FTR10_FALLBACK_COLORS_CSS } from './ftr10-default-colors';

export const FTR10_COLORS_CSS_PATH = path.join(
  os.homedir(), '.ftr10', 'css.files', 'colors.css');

/** Live Architect tokens, or the bundled snapshot when Architect is absent. */
export function readFtr10ColorsCss(): string {
  try {
    return fs.readFileSync(FTR10_COLORS_CSS_PATH, 'utf8').trim();
  } catch {
    return FTR10_FALLBACK_COLORS_CSS;
  }
}

/** True when the Architect theme engine is actually installed on this machine. */
export function isFtr10Present(): boolean {
  try {
    fs.accessSync(FTR10_COLORS_CSS_PATH, fs.constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Bridge FTR10 tokens onto the variables muya's stylesheets read.
 *
 * muya declares its own defaults in `:root` (see
 * vendor/muya/src/assets/styles/index.css), so this block must be injected
 * AFTER the muya bundle to win at equal specificity.
 *
 * Every mapping keeps muya's original value as the `var()` fallback, so if a
 * token is missing the editor degrades to muya's stock light theme rather than
 * rendering unstyled.
 */
export const FTR10_MUYA_BRIDGE_CSS = `
:root {
  /* ── editor surface ─────────────────────────────────────────── */
  --editor-color: var(--ftr10-text, #4d4d4d);
  --editor-color-80: var(--ftr10-text-80, #333);
  --editor-color-50: var(--ftr10-text-60, #808080);
  --editor-color-30: var(--ftr10-text-40, #b3b3b3);
  --editor-color-10: var(--ftr10-text-15, #e6e6e6);
  --editor-color-04: var(--ftr10-text-06, #f7f7f7);
  --editor-bg-color: var(--ftr10-bg-editor, var(--ftr10-bg, #fff));

  --theme-color: var(--ftr10-accent-1, rgb(33 181 111 / 100%));
  --highlight-color: var(--ftr10-accent-1-45, rgb(33 181 111 / 40%));
  --selection-color: var(--ftr10-highlight-50, rgb(45 170 219 / 30%));
  --delete-color: var(--ftr10-error, #ff6969);
  --icon-color: var(--ftr10-text-muted, #6b737b);

  /* ── headings ───────────────────────────────────────────────
     muya colours headings through its OWN --hN-color vars (see
     vendor/muya/src/assets/styles/index.css), not element rules — mapping
     these is what actually tints h1..h6. --ftr10-h6-color does not exist in
     the Architect palette, so h6 reuses the h5 token. */
  --h1-color: var(--ftr10-h1-color, var(--editor-color-80));
  --h2-color: var(--ftr10-h2-color, var(--editor-color-80));
  --h3-color: var(--ftr10-h3-color, var(--editor-color-80));
  --h4-color: var(--ftr10-h4-color, var(--editor-color-80));
  --h5-color: var(--ftr10-h5-color, var(--editor-color-80));
  --h6-color: var(--ftr10-h5-color, var(--editor-color-80));

  /* ── inline text ────────────────────────────────────────────── */
  --strong-color: var(--ftr10-strong-color, var(--editor-color-80));
  --em-color: var(--ftr10-em-color, var(--editor-color-80));
  --link-color: var(--ftr10-accent-1, #4183c4);
  --list-marker-color: var(--ftr10-accent-2, var(--editor-color-50));
  --hr-color: var(--ftr10-border, var(--editor-color-10));

  /* ── blocks ─────────────────────────────────────────────────── */
  --code-block-bg-color: var(--ftr10-code-bg, rgb(0 0 0 / 3%));
  --blockquote-text-color: var(--ftr10-text-muted, var(--editor-color-50));
  --blockquote-border-color: var(--ftr10-blockquote-border, var(--editor-color-10));
  --table-border-color: var(--ftr10-border, #e5e5e5);
  --input-bg-color: var(--ftr10-glass-bg, rgb(0 0 0 / 6%));

  /* ── floating UI (quick-insert menu, front menu, toolbars) ──── */
  --float-bg-color: var(--ftr10-glass-bg-menu, #fff);
  --float-hover-color: var(--ftr10-glass-bg-hover, rgb(0 0 0 / 4%));
  --float-border-color: var(--ftr10-border-base, rgb(0 0 0 / 10%));
  --float-shadow: var(--ftr10-shadow-popup,
    rgb(15 15 15 / 3%) 0 0 0 1px, rgb(15 15 15 / 4%) 0 3px 6px, rgb(15 15 15 / 5%) 0 9px 24px);

  /* ── buttons ────────────────────────────────────────────────── */
  --button-font-color: var(--ftr10-text, var(--editor-color));
  --button-bg-color: var(--ftr10-surface-2, #fff);
  --button-border: 1px solid var(--ftr10-border-base, #dcdfe6);
  --button-bg-color-hover: var(--ftr10-glass-bg-hover, linear-gradient(#f9f9f9, #f2f2f2));
  --button-border-hover: 1px solid var(--ftr10-border-base, #dcdfe6);
  --button-bg-color-active: var(--ftr10-glass-bg-active, var(--button-bg-color));
  --button-border-active: 1px solid var(--ftr10-accent-1, transparent);
  --button-border-focus: 1px solid var(--ftr10-accent-1, transparent);
}

/* Editor chrome. muya's container is .mu-container (NOT .mu-editor); the
   webview body stays transparent so the workbench background shows through. */
#app .mu-container {
  color: var(--ftr10-text, inherit);
  font-family: var(--ftr10-body-font, inherit);
  background: transparent;
}

/* Heading font + tracking are not covered by muya's --hN-color vars. */
#app .mu-container h1,
#app .mu-container h2,
#app .mu-container h3,
#app .mu-container h4,
#app .mu-container h5,
#app .mu-container h6 {
  font-family: var(--ftr10-heading-font, inherit);
  letter-spacing: var(--ftr10-heading-spacing, normal);
  text-transform: var(--ftr10-heading-transform, none);
}

/* Marks / highlights. */
#app .mu-container mark {
  background: var(--ftr10-mark-bg, inherit);
  color: var(--ftr10-mark-color, inherit);
}

/* Code: inline + fenced. Inline code in muya is exposed as code.mu-inline-rule.
   Scoped to :not(pre) > code so fenced blocks keep their own styling. This rule
   MUST use !important: muya injects its own stylesheet at RUNTIME (when the
   editor boots), which lands AFTER this <style> in <head>. muya's
   code.mu-inline-rule rule is plain (border-radius:3px, no border), so without
   !important it would silently override our accent pill. The bridge is also
   re-applied last on every theme/palette change, so !important here is the one
   place guaranteed to win. Radius hardcoded to a drastic 16px so it's
   unmistakable the value is applied; once confirmed, tune it down. */
#app .mu-container :not(pre) > code.mu-inline-rule {
  color: var(--ftr10-accent-5, var(--vscode-textPreformat-foreground, inherit)) !important;
  background: color-mix(
    in srgb,
    var(--ftr10-accent-2, var(--vscode-textPreformat-background, #808080)) 22%,
    transparent
  ) !important;
  border: 2px solid color-mix(
    in srgb,
    var(--ftr10-accent-2, var(--vscode-textPreformat-background, #808080)) 65%,
    transparent
  ) !important;
  border-radius: 16px !important;
  font-family: var(--ftr10-code-font, inherit) !important;
}
#app .mu-container pre {
  background: var(--ftr10-code-bg, inherit);
  border-left: 2px solid var(--ftr10-code-border-l, transparent);
  border-radius: var(--ftr10-radius-block, 8px);
}

/* Blockquote. muya draws the bar as a ::before pseudo-element (background, not
   border-left), so the width token has to be applied there — a border-left rule
   here would be inert. Colour comes via --blockquote-border-color above. */
#app .mu-container blockquote {
  background: var(--ftr10-blockquote-bg, transparent);
  border-radius: var(--ftr10-radius-quote, 4px);
}
#app .mu-container blockquote::before {
  width: var(--ftr10-blockquote-width, 2px);
}

/* Images. */
#app .mu-container img { border-radius: var(--ftr10-radius-img, 8px); }

/* Floating popups: rounded + glass to match the workbench. The muya UI plugins
   render into .mu-float-wrapper at the BODY level, outside #app — so these
   must not be scoped under #app.
   Interior colours (.title, .item, hover) already resolve through the bridge
   above, since muya's own rules read --float-bg-color / --float-hover-color /
   --editor-color. Only the chrome needs adding here. */
.mu-float-wrapper {
  border-radius: var(--ftr10-radius-md, 2px);
  font-family: var(--ftr10-body-font, inherit);
  backdrop-filter: var(--ftr10-blur-md, none);
}
/* The sticky group header inherits the popup background; keep it muted so it
   reads as a label rather than a row. */
.mu-quick-insert .title { color: var(--ftr10-text-muted, var(--editor-color)); }
.mu-quick-insert .active,
.mu-quick-insert div.item:hover { color: var(--ftr10-accent-1, inherit); }
`;

/**
 * Full themed stylesheet for the webview: live Architect tokens followed by the
 * muya bridge. Injected after the muya bundle so both win the cascade.
 */
export function buildFtr10Css(): string {
  return `${readFtr10ColorsCss()}\n${FTR10_MUYA_BRIDGE_CSS}`;
}

/**
 * Watch the Architect palette for changes and invoke `onChange` (debounced).
 *
 * `fs.watch` on the file itself is unreliable here — Architect rewrites
 * colors.css, and an atomic replace (rename over the path) breaks a
 * file-target watch permanently. Watching the containing directory and
 * filtering by name survives that.
 */
export function watchFtr10Theme(onChange: () => void): { dispose(): void } {
  const dir = path.dirname(FTR10_COLORS_CSS_PATH);
  const base = path.basename(FTR10_COLORS_CSS_PATH);
  let timer: NodeJS.Timeout | undefined;
  let watcher: fs.FSWatcher | undefined;

  try {
    watcher = fs.watch(dir, (_event, filename) => {
      if (filename && filename !== base) return;
      if (timer) clearTimeout(timer);
      // Debounce: a rewrite emits several events in quick succession.
      timer = setTimeout(onChange, 150);
    });
  } catch {
    // ~/.ftr10 does not exist (Architect not installed) — nothing to watch.
    // The bundled fallback is static, so there is no update to miss.
  }

  return {
    dispose() {
      if (timer) clearTimeout(timer);
      try { watcher?.close(); } catch { /* already closed */ }
    },
  };
}
