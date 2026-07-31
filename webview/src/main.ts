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

// ---------- host <-> webview message protocol ----------
type InitMsg = { type: 'init'; markdown: string; theme: 'light' | 'dark'; uri: string; dev?: boolean };
type SetMarkdownMsg = { type: 'setMarkdown'; markdown: string };
type ThemeMsg = { type: 'theme'; theme: 'light' | 'dark' };
type WorkspaceImageMsg = { type: 'workspaceImage'; requestId: number; path: string | null };
type ToWebview = InitMsg | SetMarkdownMsg | ThemeMsg | WorkspaceImageMsg;
type FromWebview =
  | { type: 'ready' }
  | { type: 'change'; markdown: string }
  | { type: 'openExternal'; href: string }
  | { type: 'requestWorkspaceImage'; requestId: number };

const vscode = (window as any).acquireVsCodeApi ? (window as any).acquireVsCodeApi() : null;
let dev = false;

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

function debounceChange() {
  if (changeTimer !== undefined) clearTimeout(changeTimer);
  changeTimer = window.setTimeout(() => {
    if (!muya) return;
    const md = muya.getMarkdown();
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
  muya.locale(LOCALES['en']);
  muya.init();
  muya.on('json-change', debounceChange);
  muya.on('blur', () => debounceChange());
  post({ type: 'ready' });
}

function setMarkdown(markdown: string) {
  if (!muya) return;
  // Replace the whole document; do NOT autofocus (which would steal/reset the
  // caret on every external edit). The user's caret is preserved.
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
    { label: 'Delete Paragraph', shortcut: 'Ctrl+Shift+D' },
    { label: '', sep: true },
    { label: 'Find', shortcut: 'Ctrl+F' },
    { label: 'Replace', shortcut: 'Ctrl+R' },
  ]},
  // Paragraph submenu
  { label: 'Paragraph', submenu: [
    { label: 'Heading 1', shortcut: 'Ctrl+Shift+1' },
    { label: 'Heading 2', shortcut: 'Ctrl+Shift+2' },
    { label: 'Heading 3', shortcut: 'Ctrl+Shift+3' },
    { label: 'Heading 4', shortcut: 'Ctrl+Shift+4' },
    { label: 'Heading 5', shortcut: 'Ctrl+Shift+5' },
    { label: 'Heading 6', shortcut: 'Ctrl+Shift+6' },
    { label: '', sep: true },
    { label: 'Upgrade Heading', shortcut: 'Ctrl+Plus' },
    { label: 'Degrade Heading', shortcut: 'Ctrl+-' },
    { label: '', sep: true },
    { label: 'Table', shortcut: 'Ctrl+Shift+T' },
    { label: 'Code Block', shortcut: 'Ctrl+Shift+K' },
    { label: 'Quote Block', shortcut: 'Ctrl+Shift+Q' },
    { label: 'Math Block', shortcut: 'Ctrl+Alt+N' },
    { label: 'HTML Block', shortcut: 'Ctrl+Alt+H' },
    { label: 'Ordered List', shortcut: 'Ctrl+G' },
    { label: 'Bullet List', shortcut: 'Ctrl+H' },
    { label: 'Task List', shortcut: 'Ctrl+Alt+X' },
    { label: '', sep: true },
    { label: 'Paragraph', shortcut: 'Ctrl+Shift+0' },
    { label: 'Horizontal Line', shortcut: 'Ctrl+Shift+U' },
    { label: 'Front Matter', shortcut: 'Ctrl+Alt+Y' },
  ]},
  // Format submenu
  { label: 'Format', submenu: [
    { label: 'Bold', shortcut: 'Ctrl+B' },
    { label: 'Italic', shortcut: 'Ctrl+I' },
    { label: 'Underline', shortcut: 'Ctrl+U' },
    { label: 'Superscript' },
    { label: 'Subscript' },
    { label: 'Highlight', shortcut: 'Ctrl+Shift+H' },
    { label: 'Inline Code', shortcut: 'Ctrl+`' },
    { label: 'Inline Math', shortcut: 'Ctrl+Shift+M' },
    { label: 'Strikethrough', shortcut: 'Ctrl+D' },
    { label: 'Hyperlink', shortcut: 'Ctrl+L' },
    { label: 'Image', shortcut: 'Ctrl+Shift+I' },
    { label: 'Clear Format', shortcut: 'Ctrl+Shift+R' },
  ]},
  { label: '', sep: true },
  { label: 'Undo', shortcut: 'Ctrl+Z', action: () => muya?.undo() },
  { label: 'Redo', shortcut: 'Ctrl+Shift+Z', action: () => muya?.redo() },
  { label: '', sep: true },
  { label: 'Cut', shortcut: 'Ctrl+X', action: () => document.execCommand('cut') },
  { label: 'Copy', shortcut: 'Ctrl+C', action: () => document.execCommand('copy') },
  { label: 'Paste', shortcut: 'Ctrl+V', action: () => document.execCommand('paste') },
  { label: '', sep: true },
  { label: 'Copy as Rich Text', shortcut: 'Ctrl+Shift+C', action: copyMarkdown },
  { label: 'Copy as HTML', action: copyHtml },
  { label: 'Paste as Plain Text', shortcut: 'Ctrl+Shift+V', action: pastePlain },
];

function setupContextMenu() {
  const menu = document.createElement('div');
  menu.className = 'mtx-context-menu';
  menu.style.cssText = [
    'position:fixed', 'z-index:99999', 'display:none',
    'min-width:200px', 'padding:4px 0', 'border-radius:6px',
    'background:#fff', 'color:#24292e', 'box-shadow:0 2px 12px rgba(0,0,0,.18)',
    'font:13px sans-serif', 'user-select:none',
  ].join(';');
  document.body.appendChild(menu);

  // Open submenu popovers live in a stack; we keep at most one open at a time.
  let openSub: HTMLElement | null = null;

  function clearSubs() {
    if (openSub) { openSub.remove(); openSub = null; }
  }

  function makeRow(item: MenuItem): HTMLElement {
    if (item.sep) {
      const hr = document.createElement('div');
      hr.style.cssText = 'height:1px;margin:4px 0;background:#e1e4e8';
      return hr;
    }
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:18px;padding:6px 16px;white-space:nowrap';
    const enabled = !!item.action;
    if (!enabled) row.style.opacity = '0.4';
    if (item.submenu) {
      const lbl = document.createElement('span');
      lbl.textContent = item.label;
      const arrow = document.createElement('span');
      arrow.textContent = '▸';
      arrow.style.cssText = 'margin-left:8px;color:#888';
      row.appendChild(lbl); row.appendChild(arrow);
    } else {
      const lbl = document.createElement('span');
      lbl.textContent = item.label;
      row.appendChild(lbl);
      if (item.shortcut) {
        const sc = document.createElement('span');
        sc.textContent = item.shortcut;
        sc.style.cssText = 'color:#888;font-size:11px';
        row.appendChild(sc);
      }
    }
    if (enabled && !item.submenu) {
      row.style.cursor = 'pointer';
      row.addEventListener('mouseenter', () => { row.style.background = '#f0f3f6'; clearSubs(); });
      row.addEventListener('mouseleave', () => { row.style.background = 'transparent'; });
      row.addEventListener('mousedown', (e) => {
        e.preventDefault();
        item.action!();
        hide();
      });
    } else if (item.submenu) {
      const subItems = item.submenu;
      row.style.cursor = 'default';
      row.addEventListener('mouseenter', (e) => {
        clearSubs();
        const sub = document.createElement('div');
        sub.className = 'mtx-context-submenu';
        sub.style.cssText = [
          'position:fixed', 'z-index:100000', 'min-width:200px', 'padding:4px 0',
          'border-radius:6px', 'background:#fff', 'color:#24292e',
          'box-shadow:0 2px 12px rgba(0,0,0,.18)', 'font:13px sans-serif',
        ].join(';');
        for (const subItem of subItems) sub.appendChild(makeRow(subItem));
        document.body.appendChild(sub);
        const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
        sub.style.left = `${r.right - 4}px`;
        sub.style.top = `${r.top}px`;
        openSub = sub;
      });
    }
    return row;
  }

  function render() {
    menu.innerHTML = '';
    for (const item of MENU) menu.appendChild(makeRow(item));
  }
  render();

  function show(x: number, y: number) {
    clearSubs();
    menu.style.display = 'block';
    const rect = menu.getBoundingClientRect();
    menu.style.left = `${Math.min(x, window.innerWidth - rect.width - 4)}px`;
    menu.style.top = `${Math.min(y, window.innerHeight - rect.height - 4)}px`;
  }
  function hide() {
    menu.style.display = 'none';
    clearSubs();
  }

  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    show(e.clientX, e.clientY);
  }, true);
  window.addEventListener('click', hide);
  window.addEventListener('scroll', hide, true);
}

setupContextMenu();

window.addEventListener('message', (ev: MessageEvent) => {
  const msg = ev.data as ToWebview;
  if (dev) console.log('[marktext-webview <- host]', msg.type);
  switch (msg.type) {
    case 'init':
      dev = !!msg.dev;
      boot(msg.markdown, msg.theme, msg.uri);
      break;
    case 'setMarkdown':
      setMarkdown(msg.markdown);
      break;
    case 'theme':
      applyTheme(msg.theme);
      break;
    case 'workspaceImage':
      pendingImages.get(msg.requestId)?.(msg.path);
      pendingImages.delete(msg.requestId);
      break;
  }
});

// Signal readiness once. The host replies with a single `init`, which boots the
// editor exactly once (guarded by `booted`).
post({ type: 'ready' });
