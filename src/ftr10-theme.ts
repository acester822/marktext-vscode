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

  /* ── blocks ─────────────────────────────────────────────────── */
  --code-block-bg-color: var(--ftr10-code-bg, rgb(0 0 0 / 3%));
  --table-border-color: var(--ftr10-border, #e5e5e5);
  --input-bg-color: var(--ftr10-glass-bg, rgb(0 0 0 / 6%));

  /* ── floating UI (quick-insert menu, front menu, toolbars) ──── */
  --float-bg-color: var(--ftr10-glass-bg-menu, #fff);
  --float-hover-color: var(--ftr10-glass-bg-hover, rgb(0 0 0 / 4%));
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

  /* ── typography ─────────────────────────────────────────────── */
  --font-sans-serif: var(--ftr10-body-font, "Open Sans", "Clear Sans", "Helvetica Neue", Helvetica, Arial, sans-serif);
  --font-monospace: var(--ftr10-code-font, "DejaVu Sans Mono", Consolas, "Liberation Mono", Courier, monospace);
}

/* Editor chrome: paint the muya surface with the Architect palette. The
   webview body is transparent so the workbench background shows through. */
#app .mu-editor {
  color: var(--ftr10-text, inherit);
  font-family: var(--ftr10-body-font, inherit);
  background: transparent;
}

/* Headings follow the Architect heading ramp. */
#app .mu-editor h1 { color: var(--ftr10-h1-color, inherit); font-family: var(--ftr10-heading-font, inherit); }
#app .mu-editor h2 { color: var(--ftr10-h2-color, inherit); font-family: var(--ftr10-heading-font, inherit); }
#app .mu-editor h3 { color: var(--ftr10-h3-color, inherit); font-family: var(--ftr10-heading-font, inherit); }
#app .mu-editor h4 { color: var(--ftr10-h4-color, inherit); font-family: var(--ftr10-heading-font, inherit); }
#app .mu-editor h5,
#app .mu-editor h6 { color: var(--ftr10-h5-color, inherit); font-family: var(--ftr10-heading-font, inherit); }

/* Inline emphasis / marks. */
#app .mu-editor strong { color: var(--ftr10-strong-color, inherit); }
#app .mu-editor em { color: var(--ftr10-em-color, inherit); }
#app .mu-editor mark {
  background: var(--ftr10-mark-bg, inherit);
  color: var(--ftr10-mark-color, inherit);
}
#app .mu-editor a { color: var(--ftr10-accent-1, inherit); }

/* Code: inline + fenced. */
#app .mu-editor code {
  background: var(--ftr10-code-bg, inherit);
  border-radius: var(--ftr10-radius-inline, 3px);
  font-family: var(--ftr10-code-font, inherit);
}
#app .mu-editor pre {
  background: var(--ftr10-code-bg, inherit);
  border-left: 2px solid var(--ftr10-code-border-l, transparent);
  border-radius: var(--ftr10-radius-block, 8px);
}

/* Blockquote. */
#app .mu-editor blockquote {
  background: var(--ftr10-blockquote-bg, transparent);
  border-left: var(--ftr10-blockquote-width, 3px) solid var(--ftr10-blockquote-border, currentColor);
  border-radius: var(--ftr10-radius-quote, 4px);
}

/* Images + horizontal rules. */
#app .mu-editor img { border-radius: var(--ftr10-radius-img, 8px); }
#app .mu-editor hr { border-color: var(--ftr10-border, currentColor); }

/* Floating popups: rounded to match the workbench, glass background. */
.mu-float-wrapper,
.mu-quick-insert,
.mu-front-menu {
  border-radius: var(--ftr10-radius-md, 4px);
}
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
