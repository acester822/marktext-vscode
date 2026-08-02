// MarkText VS Code webview entry.
// Loads MarkText's @muyajs/core (muya) engine — bundled into this IIFE by the
// build step (with all assets inlined and CSS collected to a sidecar file the
// host injects into the page head).
import {
  Muya,
  EmojiSelector,
  FootnoteTool,
  InlineFormatToolbar,
  ImageEditTool,
  ImageToolBar,
  ImageResizeBar,
  CodeBlockLanguageSelector,
  LinkTools,
  ParagraphFrontButton,
  ParagraphFrontMenu,
  ParagraphQuickInsertMenu,
  PreviewToolBar,
  TableChessboard,
  TableColumnToolbar,
  TableDragBar,
  TableRowColumMenu,
  MarkdownToHtml,
  en,
  zhCN,
} from '@muyajs/core';
import type { IMuyaOptions, ILocale } from '@muyajs/core';
import { setExcalidrawPost, observeExcalidrawBlocks, refreshExcalidrawBlocks } from './excalidraw-render';

// ---------- host <-> webview message protocol ---------
type InitMsg = { type: 'init'; markdown: string; theme: 'light' | 'dark'; uri: string; dev?: boolean };
type SetMarkdownMsg = { type: 'setMarkdown'; markdown: string };
type ThemeMsg = { type: 'theme'; theme: 'light' | 'dark' };
type WorkspaceImageMsg = { type: 'workspaceImage'; requestId: number; path: string | null };
type Ftr10CssMsg = { type: 'ftr10Css'; css: string };
type RefreshExcalidrawMsg = { type: 'refreshExcalidraw'; uri: string };
type ToWebview = InitMsg | SetMarkdownMsg | ThemeMsg | WorkspaceImageMsg | Ftr10CssMsg | RefreshExcalidrawMsg;
type FromWebview =
  | { type: 'ready' }
  | { type: 'change'; markdown: string }
  | { type: 'openExternal'; href: string }
  | { type: 'requestWorkspaceImage'; requestId: number }
  | { type: 'excalidrawEdit'; uri: string; data: string };

const vscode = (window as any).acquireVsCodeApi ? (window as any).acquireVsCodeApi() : null;
let dev = false;

// Always-on build marker so we can confirm which bundle is actually running
// in the webview (guards against a stale/cached build after reinstall).
const BUILD_ID = '2026-08-01b-external-edit';
// eslint-disable-next-line no-console
console.log(`[marktext-webview] build ${BUILD_ID} loaded`);

function post(msg: FromWebview) {
  if (dev) console.log('[marktext-webview -> host]', msg.type);
  vscode?.postMessage(msg);
}

// ---------- image picker wiring ----------
// VS Code webviews have no filesystem access, so the host opens the file
// dialog and returns the chosen absolute path; we expose it to muya as a
// file:// URL.
const pendingImages = new Map<number, (path: string | null) => void>();
let reqSeq = 0;

async function imagePathPicker(): Promise<string> {
  const requestId = ++reqSeq;
  return new Promise<string>((resolve) => {
    pendingImages.set(requestId, (p) => resolve(p ? `file://${p}` : ''));
    post({ type: 'requestWorkspaceImage', requestId });
  });
}

async function imageAction(): Promise<string> {
  return '';
}

// muya-core/lib/muya (where IMuyaPluginConstructor is declared) is not
// reachable through the package export map for type resolution, so declare a
// minimal structural type for the cast used by Muya.use().
type MuyaPlugin = { pluginName: string; new (muya: unknown, options?: Record<string, unknown>): unknown };

// ---------- register muya UI plugins (once, global) ----------
const use = (plugin: unknown, options?: Record<string, unknown>) =>
  Muya.use(plugin as MuyaPlugin, options);

use(EmojiSelector);
use(FootnoteTool);
use(InlineFormatToolbar);
use(ImageEditTool, { imagePathPicker, imageAction });
use(ImageToolBar);
use(ImageResizeBar);
use(CodeBlockLanguageSelector);
use(LinkTools, {
  jumpClick: (linkInfo: { href?: string } | null) => {
    const href = linkInfo?.href;
    if (href && /^https?:\/\//.test(href)) post({ type: 'openExternal', href });
  },
});
use(ParagraphFrontButton);
use(ParagraphFrontMenu);
use(ParagraphQuickInsertMenu);
use(PreviewToolBar);
use(TableChessboard);
use(TableColumnToolbar);
use(TableDragBar);
use(TableRowColumMenu);

const LOCALES: Record<string, ILocale> = { en, 'zh-CN': zhCN };

// ---------- editor lifecycle ----------
const container = document.getElementById('app') as HTMLElement;
let muya: Muya | null = null;
let currentUri = '';
let booted = false;
let changeTimer: number | undefined;
// Set while we apply an EXTERNAL edit (host -> webview, e.g. user typing in
// the text editor). Prevents the resulting json-change from being posted back
// to the host, which would create a sync loop. The webview is the single
// source of truth for its own edits; the host never bounces those back.
let applyingExternal = false;

function debounceChange() {
  if (changeTimer !== undefined) clearTimeout(changeTimer);
  changeTimer = window.setTimeout(() => {
    if (!muya) return;
    // This change came from an external edit we just applied; don't echo it.
    if (applyingExternal) { applyingExternal = false; return; }
    const md = muya.getMarkdown();
    // Always log keystroke activity so a silent console is diagnosable.
    console.log('[marktext-webview] change -> post (len ' + md.length + ')');
    post({ type: 'change', markdown: md });
  }, 300);
}

function boot(markdown: string, theme: 'light' | 'dark', uri: string) {
  if (booted) return;
  booted = true;
  currentUri = uri;
  const options: Partial<IMuyaOptions> = {
    markdown,
    frontMatter: true,
    footnote: true,
    math: true,
    superSubScript: true,
    isGitlabCompatibilityEnabled: true,
    codeBlockLineNumbers: true,
    autoPairBracket: true,
    autoPairMarkdownSyntax: true,
    autoPairQuote: true,
    preferLooseListItem: true,
  };
  if (dev) console.log('[marktext-webview] booting muya for', uri);
  muya = new Muya(container, options);
  (window as any).__muya = muya; // debug handle for introspecting the API
  muya.locale(LOCALES['en']);
  muya.init();
  muya.on('json-change', debounceChange);
  muya.on('blur', () => debounceChange());
  // Excalidraw: route edit-button clicks to the host and decorate any
  // ```excalidraw blocks currently rendered (and on future re-renders).
  setExcalidrawPost(post);
  observeExcalidrawBlocks(uri, container);
  post({ type: 'ready' });
}

function setMarkdown(markdown: string) {
  if (!muya) return;
  // External edit (host -> webview). Mark it so the resulting json-change is
  // not posted back. Do NOT autofocus (would steal/reset the caret).
  applyingExternal = true;
  muya.setContent(markdown, false);
}

function applyTheme(theme: 'light' | 'dark') {
  if (!muya) return;
  const md = muya.getMarkdown();
  muya.destroy();
  booted = false;
  boot(md, theme, currentUri);
}

// ---------- custom right-click menu (MarkText-structured, Option B) ----------
// muya (the engine we bundle) does not ship MarkText's rich context menu and
// exposes no public format/paragraph command API, so we render the full
// MarkText menu structure but only enable the actions muya actually supports.
// Unsupported items are shown greyed-out and inert (honest about limits until
// we later reimplement those transforms against muya state).
type MenuAction = () => void;
interface MenuItem {
  label: string;
  shortcut?: string;
  action?: MenuAction;     // undefined => greyed/disabled
  sep?: boolean;           // separator row
  submenu?: MenuItem[];    // nested submenu
}

// Real actions backed by muya / browser APIs.
function copyMarkdown() {
  if (!muya) return;
  const md = muya.getMarkdown();
  navigator.clipboard?.writeText(md);
}
async function copyHtml() {
  if (!muya) return;
  const html = await new MarkdownToHtml(muya.getMarkdown(), muya).generate({});
  navigator.clipboard?.writeText(html);
}
async function pastePlain() {
  const text = await navigator.clipboard.readText();
  document.execCommand('insertText', false, text);
}

// ---------- muya-backed actions (the previously-greyed items) ----------
// muya DOES expose these transforms publicly; we verified the signatures
// against the bundled @muyajs/core source (packages/muya/src/muya.ts).
function formatInline(type: string) { muya?.format(type); }
function setBlock(type: string) {
  // Ensure muya has focus/caret before a block transform (right-click already
  // positioned it via muya's click handler; this is a safety net for programmatic paths).
  muya?.focus();
  muya?.updateParagraph(type);
}
function selectAllInBlock() {
  // Place the caret so block transforms act on the focused block.
  const sel = window.getSelection();
  if (sel && sel.anchorNode) {
    const node = sel.anchorNode as HTMLElement;
    const el = node.nodeType === 3 ? node.parentElement : (node as HTMLElement);
    if (el && el.getAttribute('contenteditable') !== null) {
      const range = document.createRange();
      range.selectNodeContents(el);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }
}

// Find: search for the current selection (or word at caret) via muya's search.
function findSelection() {
  const sel = window.getSelection();
  const term = sel ? sel.toString() : '';
  if (!term || !muya) return;
  muya.search(term);
  muya.find('next');
}
// Replace: open a prompt for find/replace terms, run muya's search + replace.
function replacePrompt() {
  if (!muya) return;
  const sel = window.getSelection();
  const find = (sel ? sel.toString() : '') || window.prompt('Find:') || '';
  if (!find) return;
  const replace = window.prompt(`Replace "${find}" with:`, '') || '';
  muya.search(find);
  muya.replace(replace, { isSingle: false, isRegexp: false });
}

const MENU: MenuItem[] = [
  // Edit submenu
  { label: 'Edit', submenu: [
    { label: 'Undo', shortcut: 'Ctrl+Z', action: () => muya?.undo() },
    { label: 'Redo', shortcut: 'Ctrl+Shift+Z', action: () => muya?.redo() },
    { label: '', sep: true },
    { label: 'Cut', shortcut: 'Ctrl+X', action: () => document.execCommand('cut') },
    { label: 'Copy', shortcut: 'Ctrl+C', action: () => document.execCommand('copy') },
    { label: 'Paste', shortcut: 'Ctrl+V', action: () => document.execCommand('paste') },
    { label: 'Copy as Markdown', shortcut: 'Ctrl+Shift+C', action: copyMarkdown },
    { label: 'Copy as HTML', action: copyHtml },
    { label: 'Paste as Plain Text', shortcut: 'Ctrl+Shift+V', action: pastePlain },
    { label: '', sep: true },
    { label: 'Select All', shortcut: 'Ctrl+A', action: () => document.execCommand('selectAll') },
    { label: 'Duplicate Paragraph', shortcut: 'Ctrl+Alt+P', action: () => muya?.insertParagraph('after') },
    { label: 'New Paragraph', shortcut: 'Ctrl+Shift+N', action: () => muya?.insertParagraph('after') },
    { label: 'Delete Paragraph', shortcut: 'Ctrl+Shift+D', action: () => muya?.deleteParagraph() },
    { label: '', sep: true },
    { label: 'Find', shortcut: 'Ctrl+F', action: findSelection },
    { label: 'Replace', shortcut: 'Ctrl+R', action: replacePrompt },
  ]},
  // Paragraph submenu
  { label: 'Paragraph', submenu: [
    { label: 'Heading 1', shortcut: 'Ctrl+Shift+1', action: () => setBlock('heading 1') },
    { label: 'Heading 2', shortcut: 'Ctrl+Shift+2', action: () => setBlock('heading 2') },
    { label: 'Heading 3', shortcut: 'Ctrl+Shift+3', action: () => setBlock('heading 3') },
    { label: 'Heading 4', shortcut: 'Ctrl+Shift+4', action: () => setBlock('heading 4') },
    { label: 'Heading 5', shortcut: 'Ctrl+Shift+5', action: () => setBlock('heading 5') },
    { label: 'Heading 6', shortcut: 'Ctrl+Shift+6', action: () => setBlock('heading 6') },
    { label: '', sep: true },
    { label: 'Upgrade Heading', shortcut: 'Ctrl+Plus', action: () => setBlock('upgrade heading') },
    { label: 'Degrade Heading', shortcut: 'Ctrl+-', action: () => setBlock('degrade heading') },
    { label: '', sep: true },
    { label: 'Table', shortcut: 'Ctrl+Shift+T', action: () => muya?.createTable({ rows: 3, columns: 3 }) },
    { label: 'Code Block', shortcut: 'Ctrl+Shift+K', action: () => setBlock('pre') },
    { label: 'Quote Block', shortcut: 'Ctrl+Shift+Q', action: () => setBlock('blockquote') },
    { label: 'Math Block', shortcut: 'Ctrl+Alt+N', action: () => setBlock('mathblock') },
    { label: 'HTML Block', shortcut: 'Ctrl+Alt+H', action: () => setBlock('html') },
    { label: 'Ordered List', shortcut: 'Ctrl+G', action: () => setBlock('ol-order') },
    { label: 'Bullet List', shortcut: 'Ctrl+H', action: () => setBlock('ul-bullet') },
    { label: 'Task List', shortcut: 'Ctrl+Alt+X', action: () => setBlock('ul-task') },
    { label: '', sep: true },
    { label: 'Paragraph', shortcut: 'Ctrl+Shift+0', action: () => setBlock('reset-to-paragraph') },
    { label: 'Horizontal Line', shortcut: 'Ctrl+Shift+U', action: () => setBlock('hr') },
    { label: 'Front Matter', shortcut: 'Ctrl+Alt+Y', action: () => setBlock('front-matter') },
  ]},
  // Format submenu
  { label: 'Format', submenu: [
    { label: 'Bold', shortcut: 'Ctrl+B', action: () => formatInline('strong') },
    { label: 'Italic', shortcut: 'Ctrl+I', action: () => formatInline('em') },
    { label: 'Underline', shortcut: 'Ctrl+U', action: () => formatInline('u') },
    { label: 'Superscript', action: () => formatInline('sup') },
    { label: 'Subscript', action: () => formatInline('sub') },
    { label: 'Highlight', shortcut: 'Ctrl+Shift+H', action: () => formatInline('mark') },
    { label: 'Inline Code', shortcut: 'Ctrl+`', action: () => formatInline('inline_code') },
    { label: 'Inline Math', shortcut: 'Ctrl+Shift+M', action: () => formatInline('inline_math') },
    { label: 'Strikethrough', shortcut: 'Ctrl+D', action: () => formatInline('del') },
    { label: 'Hyperlink', shortcut: 'Ctrl+L', action: () => formatInline('link') },
    { label: 'Image', shortcut: 'Ctrl+Shift+I', action: () => muya?.insertImage({ src: '', alt: '' }) },
    { label: 'Clear Format', shortcut: 'Ctrl+Shift+R', action: () => formatInline('clear') },
  ]},
  { label: '', sep: true },
  { label: 'Undo', shortcut: 'Ctrl+Z', action: () => muya?.undo() },
  { label: 'Redo', shortcut: 'Ctrl+Shift+Z', action: () => muya?.redo() },
  { label: '', sep: true },
  { label: 'Cut', shortcut: 'Ctrl+X', action: () => document.execCommand('cut') },
  { label: 'Copy', shortcut: 'Ctrl+C', action: () => document.execCommand('copy') },
  { label: 'Paste', shortcut: 'Ctrl+V', action: () => document.execCommand('paste') },
  { label: '', sep: true },
  { label: 'Copy as Markdown', shortcut: 'Ctrl+Shift+C', action: copyMarkdown },
  { label: 'Copy as HTML', action: copyHtml },
  { label: 'Paste as Plain Text', shortcut: 'Ctrl+Shift+V', action: pastePlain },
];

function setupContextMenu() {
  const menu = document.createElement('div');
  menu.className = 'mtx-context-menu';
  // Theming: derive every colour from VS Code's own webview CSS variables so
  // the menu matches whatever theme the editor is using (light, dark, high
  // contrast, custom). Fallbacks keep it legible if a variable is missing.
  menu.style.cssText = [
    'position:fixed', 'z-index:99999', 'display:none',
    'min-width:200px', 'padding:4px 0', 'border-radius:6px',
    'background:var(--ftr10-glass-bg-menu, var(--vscode-menu-background, #fff))',
    'color:var(--ftr10-text, var(--vscode-menu-foreground, #24292e))',
    'border:1px solid var(--ftr10-border-base, var(--vscode-menu-border, rgba(0,0,0,.12)))',
    'border-radius:var(--ftr10-radius-md, 6px)',
    'box-shadow:var(--ftr10-shadow-popup, 0 2px 12px rgba(0,0,0,.35))',
    'backdrop-filter:var(--ftr10-blur-md, none)',
    'font-family:var(--ftr10-body-font, var(--vscode-font-family, sans-serif))',
    'font-size:var(--vscode-font-size, 13px)', 'user-select:none',
  ].join(';');
  document.body.appendChild(menu);

  // Open submenu popovers are nested inside their parent row and revealed via
  // CSS :hover, so the hover region is continuous (moving from parent to sub
  // never leaves the element). We keep at most one sub open via CSS.
  function makeRow(item: MenuItem): HTMLElement {
    if (item.sep) {
      const hr = document.createElement('div');
      hr.style.cssText = 'height:1px;margin:4px 0;background:var(--ftr10-border-subtle, var(--vscode-menu-separatorBackground, #e1e4e8))';
      return hr;
    }
    const row = document.createElement('div');
    row.style.cssText = 'position:relative;display:flex;align-items:center;justify-content:space-between;gap:18px;padding:6px 16px;white-space:nowrap';
    const enabled = !!item.action;
    // Dim the LABEL, not the row: `opacity` on the row inherits into the nested
    // submenu, so dimming a submenu parent would wash out every child too.
    if (!enabled && !item.submenu) row.style.color = 'var(--ftr10-disabled, #384149)';
    if (item.submenu) {
      row.classList.add('mtx-has-sub');
      const lbl = document.createElement('span');
      lbl.textContent = item.label;
      const arrow = document.createElement('span');
      arrow.textContent = '▸';
      arrow.style.cssText = 'margin-left:8px;color:var(--ftr10-text-muted, #63676d)';
      row.appendChild(lbl); row.appendChild(arrow);
      const sub = document.createElement('div');
      sub.className = 'mtx-context-submenu';
      sub.style.cssText = [
        'display:none', 'position:absolute', 'left:100%', 'top:-4px',
        'min-width:200px', 'padding:4px 0', 'border-radius:6px',
        // Opaque, NOT the translucent --ftr10-glass-bg-menu: the submenu is a
        // child of the parent menu, so a semi-transparent fill would stack on
        // top of the parent's own translucent background and read as a muddy
        // double-darkened panel. --ftr10-glass-bg-widget-strong (#0f1117f0) is
        // the palette's near-opaque surface and matches the workbench.
        'background:var(--ftr10-glass-bg-widget-strong, var(--vscode-menu-background, #fff))',
        'color:var(--ftr10-text, var(--vscode-menu-foreground, #24292e))',
        'border:1px solid var(--ftr10-border-base, var(--vscode-menu-border, rgba(0,0,0,.12)))',
        'border-radius:var(--ftr10-radius-md, 6px)',
        'box-shadow:var(--ftr10-shadow-popup, 0 2px 12px rgba(0,0,0,.35))',
        // No backdrop-filter here: a nested blur re-samples the already-blurred
        // parent and compounds the wash-out.
        'font-family:var(--ftr10-body-font, var(--vscode-font-family, sans-serif))',
        'font-size:var(--vscode-font-size, 13px)',
      ].join(';');
      for (const subItem of item.submenu) sub.appendChild(makeRow(subItem));
      row.appendChild(sub);
    } else {
      const lbl = document.createElement('span');
      lbl.textContent = item.label;
      row.appendChild(lbl);
      if (item.shortcut) {
        const sc = document.createElement('span');
        sc.textContent = item.shortcut;
        sc.style.cssText = 'color:var(--ftr10-text-muted, #63676d);font-size:11px';
        row.appendChild(sc);
      }
    }
    if (enabled && !item.submenu) {
      row.style.cursor = 'pointer';
      row.addEventListener('mouseenter', () => {
        row.style.background = 'var(--ftr10-glass-bg-hover, var(--vscode-menu-selectionBackground, #f0f3f6))';
        row.style.color = 'var(--ftr10-accent-1, var(--vscode-menu-selectionForeground, inherit))';
      });
      row.addEventListener('mouseleave', () => {
        row.style.background = 'transparent';
        row.style.color = '';
      });
      row.addEventListener('mousedown', (e) => {
        e.preventDefault();
        item.action!();
        hide();
      });
    } else if (item.submenu) {
      // CSS handles reveal; clicking a parent row with a submenu does nothing.
      row.addEventListener('mousedown', (e) => e.preventDefault());
    }
    return row;
  }

  // CSS that reveals nested submenus on hover (continuous hover region).
  const style = document.createElement('style');
  style.textContent = [
    '.mtx-has-sub:hover > .mtx-context-submenu{display:block !important;}',
    '.mtx-has-sub:hover{background:var(--ftr10-glass-bg-hover, var(--vscode-menu-selectionBackground, #f0f3f6));}',
  ].join('\n');
  document.head.appendChild(style);

  function render() {
    menu.innerHTML = '';
    for (const item of MENU) menu.appendChild(makeRow(item));
  }
  render();

  function show(x: number, y: number) {
    menu.style.display = 'block';
    const rect = menu.getBoundingClientRect();
    menu.style.left = `${Math.min(x, window.innerWidth - rect.width - 4)}px`;
    menu.style.top = `${Math.min(y, window.innerHeight - rect.height - 4)}px`;
  }
  function hide() {
    menu.style.display = 'none';
  }

  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    show(e.clientX, e.clientY);
  }, true);
  // Close on any outside interaction. mousedown (not click) so it fires before
  // a submenu item's own mousedown handler.
  window.addEventListener('mousedown', (e) => {
    if (menu.style.display !== 'none' && !menu.contains(e.target as Node)) hide();
  });
  window.addEventListener('scroll', hide, true);
}

setupContextMenu();

window.addEventListener('message', (ev: MessageEvent) => {
  const msg = ev.data as ToWebview;
  if (dev) console.log('[marktext-webview <- host]', msg.type);
  switch (msg.type) {
    case 'init':
      dev = !!msg.dev;
      console.log('[marktext-webview] init received (dev=' + dev + ')');
      boot(msg.markdown, msg.theme, msg.uri);
      break;
    case 'setMarkdown':
      // Log every setMarkdown we receive — if the cursor resets, this line
      // tells us the host is STILL bouncing our own edit back.
      console.log('[marktext-webview] setMarkdown received (len ' + msg.markdown.length + ', external=' + applyingExternal + ')');
      setMarkdown(msg.markdown);
      break;
    case 'theme':
      applyTheme(msg.theme);
      break;
    case 'ftr10Css': {
      // Live palette update from the FTR10 Architect watcher. Swap the CSS text
      // in place — do NOT rebuild the editor, which would reset the caret.
      const el = document.getElementById('ftr10-theme');
      if (el) {
        el.textContent = msg.css;
        console.log('[marktext-webview] ftr10 palette updated (len ' + msg.css.length + ')');
      }
      break;
    }
    case 'workspaceImage':
      pendingImages.get(msg.requestId)?.(msg.path);
      pendingImages.delete(msg.requestId);
      break;
    case 'refreshExcalidraw':
      // The standalone Excalidraw editor closed; force the inline SVG(s) to
      // re-render so they reflect the saved scene.
      console.log('[marktext-webview] refreshExcalidraw requested');
      refreshExcalidrawBlocks(msg.uri);
      break;
  }
});

// Signal readiness once. The host replies with a single `init`, which boots the
// editor exactly once (guarded by `booted`).
post({ type: 'ready' });
