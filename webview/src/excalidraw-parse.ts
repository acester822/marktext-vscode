/**
 * Pure, dependency-free helpers for recognising and parsing ```excalidraw
 * code blocks, extracted from excalidraw-render.ts so they are unit-testable
 * without pulling in @excalidraw/excalidraw (a multi-MB browser bundle).
 *
 * muya renders a code block as `pre.mu-code-block` containing two children:
 *   - the language label (a small element whose textContent is the language,
 *     e.g. "excalidraw"), and
 *   - the code content element (the scene JSON).
 * These helpers detect the language from the label child's text and read the
 * code from the *other* child, so the label is never fed into JSON.parse.
 */

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Is a short, single-line token the language label of a fenced block? */
function looksLikeLabel(t: string): boolean {
  return !!t && !t.includes('\n') && t.length < 40;
}

/** Detect the language label of a `pre` (e.g. "excalidraw"). */
export function getBlockLang(pre: HTMLElement): string {
  for (const child of Array.from(pre.children)) {
    const t = (child.textContent ?? '').trim();
    if (looksLikeLabel(t)) return t.toLowerCase();
  }
  return '';
}

/** Read the code content — the child that is NOT the language label. */
export function getBlockCode(pre: HTMLElement): string {
  const children = Array.from(pre.children) as HTMLElement[];
  if (children.length >= 2) {
    let labelIdx = -1;
    children.forEach((c, i) => {
      const t = (c.textContent ?? '').trim();
      if (labelIdx < 0 && looksLikeLabel(t)) labelIdx = i;
    });
    if (labelIdx >= 0) {
      const codeChild = children.find((_, i) => i !== labelIdx);
      if (codeChild) return (codeChild.textContent ?? '').trim();
    }
  }
  // Single child / fallback: drop a leading single-line label if present.
  const full = (pre.textContent ?? '').trim();
  const nl = full.indexOf('\n');
  return nl > 0 && full.slice(0, nl).trim().length < 40 ? full.slice(nl + 1).trim() : full;
}

/**
 * Parse an Excalidraw scene: either a bare JSON array of elements or an object
 * `{ elements, appState, files }`. Never throws — malformed input yields empty.
 */
export function parseScene(raw: string): {
  elements: unknown[];
  appState: Record<string, unknown> | undefined;
  files: unknown;
} {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return { elements: parsed, appState: undefined, files: undefined };
    }
    return {
      elements: parsed.elements ?? [],
      appState: parsed.appState
        ? { ...parsed.appState, collaborators: undefined }
        : undefined,
      files: parsed.files,
    };
  } catch {
    return { elements: [], appState: undefined, files: undefined };
  }
}

/** Best-effort dark-theme detection for SVG recolor. */
export function isDarkThemeFromClassesAndBg(cls: string, bg: string): boolean {
  if (cls.includes('vscode-dark') || cls.includes('vscode-high-contrast')) return true;
  if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') {
    const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(bg);
    if (m) {
      const [r, g, b] = [Number(m[1]), Number(m[2]), Number(m[3])];
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return lum < 0.5;
    }
  }
  return false;
}
