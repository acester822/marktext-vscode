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

// muya re-renders (setMarkdown/theme) move the <pre> back out of our wrapper
// and rebuild it, so a one-shot "decorated" guard would leave an orphaned
// wrapper beside a raw, visible <pre>. To be safe we re-run every scan, but
// idempotently: only rebuild what actually needs it, and never stack or loop.
function decorateBlock(pre: HTMLElement, uri: string) {
  // Only decorate genuine ```excalidraw blocks (detected from the language
  // label muya renders, since "excalidraw" is not a Prism language and gets no
  // `language-*` class).
  if (getBlockLang(pre) !== 'excalidraw') return;

  const code = getBlockCode(pre);
  if (!code) {
    // Empty block: leave muya's empty-code placeholder as-is.
    return;
  }

  // Garbage-collect orphaned wrappers from earlier muya re-renders (a wrapper
  // whose <pre> is no longer inside it is dead — drop it).
  document
    .querySelectorAll<HTMLElement>('.mtx-excalidraw-block')
    .forEach((w) => {
      if (!w.querySelector('pre')) w.remove();
    });

  // This <pre> is already inside a live wrapper (muya keeps it there across a
  // soft re-render). If the block's code hasn't changed since we last rendered,
  // leave the DOM alone — re-rendering would append a fresh <svg>, mutating the
  // tree and re-triggering the observer (infinite loop). Only refresh when the
  // scene actually changed (e.g. after the standalone editor saves back).
  const existingWrapper = pre.parentElement;
  if (existingWrapper && existingWrapper.classList.contains('mtx-excalidraw-block')) {
    const m = existingWrapper.querySelector<HTMLElement>('.mtx-excalidraw-mount');
    if (m) {
      const last = (m as any).__mtxCode;
      if (last !== code) {
        (m as any).__mtxCode = code;
        void renderSvgInto(m, code);
      }
    }
    return;
  }

  // Otherwise build the wrapper fresh.
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
  (mount as any).__mtxCode = code;
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
    console.log('[marktext-webview] Excalidraw Edit clicked -> posting excalidrawEdit');
    post({ type: 'excalidrawEdit', uri, data: code });
  });
  wrapper.appendChild(btn);

  // Render the SVG asynchronously (exportToSvg is async in 0.18.x).
  void renderSvgInto(mount, code);
}

// Scan all ```excalidraw code blocks in the DOM and (re)decorate them.
// decorateBlock rebuilds cleanly each time, so calling this both decorates a
// fresh render AND repairs any stale wrapper an earlier muya re-render left
// behind — no one-shot guard needed.
export function renderExcalidrawBlocks(uri: string) {
  const blocks = document.querySelectorAll<HTMLElement>('pre.mu-code-block');
  blocks.forEach((pre) => decorateBlock(pre, uri));
}

// Force a re-render of every block's inline SVG after the standalone editor
// closes, so the diagram reflects the saved scene. Reuses the full decorate
// pass, which reads the current code and rebuilds the wrapper + SVG.
export function refreshExcalidrawBlocks(uri: string) {
  renderExcalidrawBlocks(uri);
}

// Shared async SVG render for both initial decoration and refresh.
async function renderSvgInto(mount: HTMLElement, code: string) {
  try {
    const scene = parseScene(code);
    const dark = isDarkTheme();
    const svg = await exportToSvg({
      elements: scene.elements as any,
      appState: {
        ...(scene.appState ?? {}),
        collaborators: undefined,
        viewBackgroundColor: 'transparent',
        theme: dark ? 'dark' : 'light',
        exportWithDarkMode: dark,
      } as any,
      files: scene.files as any,
    });

    // Strip the baked-in opaque background <rect> (Excalidraw always paints
    // one, even when viewBackgroundColor is transparent). It's a direct child
    // of the <svg> root.
    svg
      .querySelectorAll(
        'rect[data-id="background"], rect.excalidraw__canvas-background',
      )
      .forEach((rect: SVGRectElement) => rect.remove());

    // Fallback: drop the full-canvas background rect when Excalidraw doesn't
    // tag it (older exports). It is always a DIRECT child of the <svg> root.
    // Crucially, never touch rects nested in <mask>/<g>/<defs> — bound text on
    // arrows/lines is rendered through a <mask> that uses #fff/#000 shapes;
    // stripping those empties the mask so the entire arrow group turns
    // invisible, even though its <path>s are still in the DOM.
    Array.from(svg.children as unknown as Element[]).forEach((el: Element) => {
      if (el.tagName !== 'rect') return;
      const fill = (el.getAttribute('fill') || '').toLowerCase();
      const hasStroke = (el.getAttribute('stroke') || '').trim();
      if (!hasStroke && fill && fill !== 'none') el.remove();
    });

    svg.setAttribute('width', '100%');
    svg.style.maxWidth = '100%';
    svg.style.height = 'auto';
    svg.style.background = 'transparent';
    svg.style.display = 'block';

    mount.innerHTML = '';
    mount.appendChild(svg);
  } catch (err) {
    mount.innerHTML = `<pre class="language-text"><code>${escapeHtml(
      String((err as Error)?.message ?? err),
    )}</code></pre>`;
  }
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
