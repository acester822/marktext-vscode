// Excalidraw block decorator for the MarkText WYSIWYG webview.
//
// muya does not know about an `excalidraw` language: its diagram whitelist is
// (mermaid|vega-lite|plantuml|flowchart|sequence), so a ```excalidraw fence
// falls through to a plain code-block. Because "excalidraw" is not a Prism
// language, muya does NOT add a `language-excalidraw` class — it only renders
// the language label text ("excalidraw") as the first child of the block. We
// detect that label and decorate the block from the webview: render the scene
// to an inline SVG and overlay an "Edit" button that asks the host to open the
// standalone Excalidraw editor in a new window.
//
// No muya fork changes required — this is purely a post-render overlay.

import { exportToSvg } from '@excalidraw/excalidraw';

// Per-block guard: map the original <pre> DOM node to a flag so a re-run (on
// setMarkdown / theme change / mutation) reuses rather than stacks.
const rendered = new WeakSet<Element>();

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// muya renders a code block as `pre.mu-code-block` containing two children:
//   - the language label (a small element whose textContent is the language,
//     e.g. "excalidraw"), and
//   - the code content element (the scene JSON).
// We detect the language from the label child's text and read the code from
// the *other* child, so we never feed the label into JSON.parse.
function getBlockLang(pre: HTMLElement): string {
  for (const child of Array.from(pre.children)) {
    const t = (child.textContent ?? '').trim();
    // The label is a single short token.
    if (t && !t.includes('\n') && t.length < 40) return t.toLowerCase();
  }
  return '';
}

function getBlockCode(pre: HTMLElement): string {
  // The code content is the child that is NOT the language label.
  const children = Array.from(pre.children) as HTMLElement[];
  if (children.length >= 2) {
    let labelIdx = -1;
    children.forEach((c, i) => {
      const t = (c.textContent ?? '').trim();
      if (labelIdx < 0 && t && !t.includes('\n') && t.length < 40) labelIdx = i;
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

function isDarkTheme(): boolean {
  // VS Code webviews expose the editor color theme via a class on <body>.
  // Fall back to matching the actual bg luminance.
  const body = document.body;
  const cls = body.className || '';
  if (cls.includes('vscode-dark') || cls.includes('vscode-high-contrast')) return true;
  const bg = window.getComputedStyle(body).backgroundColor;
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

function parseScene(raw: string): {
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

function decorateBlock(pre: HTMLElement, uri: string) {
  if (rendered.has(pre)) return;
  // Only decorate genuine ```excalidraw blocks (detected from the language
  // label muya renders, since "excalidraw" is not a Prism language and gets no
  // `language-*` class).
  if (getBlockLang(pre) !== 'excalidraw') return;
  rendered.add(pre);

  const code = getBlockCode(pre);
  if (!code) {
    // Empty block: leave muya's empty-code placeholder as-is.
    return;
  }

  // Wrap the original <pre> so we can hide it and show the SVG + button.
  // muya keeps the <pre> editable; we make it visually collapse and overlay
  // the rendered diagram. This is non-destructive to muya's DOM.
  const wrapper = document.createElement('div');
  wrapper.className = 'mtx-excalidraw-block';
  wrapper.style.cssText = 'position:relative;margin:8px 0;';

  // Insert wrapper before the <pre>, then move the <pre> inside it.
  pre.parentNode?.insertBefore(wrapper, pre);
  wrapper.appendChild(pre);
  // Hide the raw code while the diagram shows.
  pre.style.display = 'none';

  const mount = document.createElement('div');
  mount.className = 'mtx-excalidraw-mount';
  mount.style.cssText = 'position:relative;';
  wrapper.appendChild(mount);

  // "Edit" button (top-right corner), styled from VS Code theme vars.
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'mtx-excalidraw-edit-btn';
  btn.textContent = 'Edit diagram';
  btn.style.cssText = [
    'position:absolute',
    'top:6px',
    'right:6px',
    'z-index:5',
    'padding:3px 10px',
    'border-radius:4px',
    'font-size:12px',
    'cursor:pointer',
    'border:1px solid var(--vscode-button-border, transparent)',
    'background:var(--vscode-button-background, #007acc)',
    'color:var(--vscode-button-foreground, #fff)',
    'opacity:0.85',
  ].join(';');
  btn.addEventListener('mouseenter', () => { btn.style.opacity = '1'; });
  btn.addEventListener('mouseleave', () => { btn.style.opacity = '0.85'; });
  // The button lives inside muya's contenteditable container. muya's mousedown
  // handler runs BEFORE click and plants the caret there — that's the flashing
  // "editing" bar you see instead of the editor opening. Stopping propagation
  // on mousedown/pointerdown (both phases muya listens in) keeps the event from
  // ever reaching muya, so the click survives and we can post to the host.
  const blockMuya = (e: Event) => {
    e.stopPropagation();
    e.preventDefault();
  };
  btn.addEventListener('mousedown', blockMuya, true); // capture, beats muya's bubble
  btn.addEventListener('mousedown', blockMuya);       // bubble too, belt & braces
  btn.addEventListener('pointerdown', blockMuya, true);
  btn.addEventListener('pointerdown', blockMuya);
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    post({ type: 'excalidrawEdit', uri, data: code });
  });
  wrapper.appendChild(btn);

  // Render the SVG asynchronously (exportToSvg is async in 0.18.x).
  (async () => {
    try {
      const scene = parseScene(code);
      const dark = isDarkTheme();
      const svg = await exportToSvg({
        elements: scene.elements as any,
        appState: {
          ...(scene.appState ?? {}),
          collaborators: undefined,
          // Transparent so the themed container behind shows through.
          viewBackgroundColor: 'transparent',
          theme: dark ? 'dark' : 'light',
          exportWithDarkMode: dark,
        } as any,
        files: scene.files as any,
      });

      // Strip the baked-in opaque background <rect> (Excalidraw always paints
      // one, even when viewBackgroundColor is transparent).
      svg
        .querySelectorAll(
          'rect[data-id="background"], rect.excalidraw__canvas-background',
        )
        .forEach((rect: SVGRectElement) => rect.remove());
      // Fallback: drop any remaining no-stroke rect that just fills a colour.
      svg.querySelectorAll('rect').forEach((rect: SVGRectElement) => {
        const fill = (rect.getAttribute('fill') || '').toLowerCase();
        const hasStroke = (rect.getAttribute('stroke') || '').trim();
        if (!hasStroke && fill && fill !== 'none') {
          rect.remove();
        }
      });

      svg.setAttribute('width', '100%');
      svg.style.maxWidth = '100%';
      svg.style.height = 'auto';
      svg.style.background = 'transparent';
      svg.style.display = 'block';

      mount.appendChild(svg);
    } catch (err) {
      mount.innerHTML = `<pre class="language-text"><code>${escapeHtml(
        String((err as Error)?.message ?? err),
      )}</code></pre>`;
    }
  })();
}

// Scan all ```excalidraw code blocks currently in the DOM and decorate new ones.
export function renderExcalidrawBlocks(uri: string) {
  const blocks = document.querySelectorAll<HTMLElement>('pre.mu-code-block');
  blocks.forEach((pre) => decorateBlock(pre, uri));
}

// Observe the editor DOM for changes (typing, paste, setMarkdown re-render) so
// newly-rendered excalidraw blocks get decorated. Debounced to avoid thrash.
let observer: MutationObserver | null = null;
let scanTimer: number | undefined;

export function observeExcalidrawBlocks(uri: string, root: HTMLElement) {
  if (observer) observer.disconnect();
  observer = new MutationObserver(() => {
    if (scanTimer !== undefined) clearTimeout(scanTimer);
    scanTimer = window.setTimeout(() => renderExcalidrawBlocks(uri), 150);
  });
  observer.observe(root, { childList: true, subtree: true });
  // Initial pass.
  renderExcalidrawBlocks(uri);
}

// Hooks wired by main.ts (avoids a circular import for `post`).
type ExcalidrawMsg = { type: 'excalidrawEdit'; uri: string; data: string };
let postFn: (msg: ExcalidrawMsg) => void = () => {};
export function setExcalidrawPost(fn: (msg: ExcalidrawMsg) => void) {
  postFn = fn;
}
function post(msg: ExcalidrawMsg) {
  postFn(msg);
}
