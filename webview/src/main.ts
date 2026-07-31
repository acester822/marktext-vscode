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

// ---------- custom right-click menu ----------
// muya (the engine we bundle) does not ship MarkText's rich context menu, so
// we register our own. It offers the actions the engine actually exposes:
// undo/redo (real muya API) plus the standard edit operations.
function setupContextMenu() {
  const menu = document.createElement('div');
  menu.className = 'mtx-context-menu';
  menu.style.cssText = [
    'position:fixed', 'z-index:99999', 'display:none',
    'min-width:160px', 'padding:4px 0', 'border-radius:6px',
    'background:#fff', 'color:#24292e', 'box-shadow:0 2px 12px rgba(0,0,0,.18)',
    'font:13px sans-serif', 'user-select:none',
  ].join(';');
  document.body.appendChild(menu);

  type Item = { label: string; action: () => void; sep?: boolean };
  const items: Item[] = [
    { label: 'Undo', action: () => muya?.undo() },
    { label: 'Redo', action: () => muya?.redo() },
    { label: 'Cut', action: () => document.execCommand('cut'), sep: true },
    { label: 'Copy', action: () => document.execCommand('copy') },
    { label: 'Paste', action: () => document.execCommand('paste') },
    { label: 'Select All', action: () => document.execCommand('selectAll'), sep: true },
  ];

  function render() {
    menu.innerHTML = '';
    for (const it of items) {
      if (it.sep) {
        const hr = document.createElement('div');
        hr.style.cssText = 'height:1px;margin:4px 0;background:#e1e4e8';
        menu.appendChild(hr);
        continue;
      }
      const el = document.createElement('div');
      el.textContent = it.label;
      el.style.cssText = 'padding:6px 16px;cursor:pointer';
      el.addEventListener('mouseenter', () => { el.style.background = '#f0f3f6'; });
      el.addEventListener('mouseleave', () => { el.style.background = 'transparent'; });
      el.addEventListener('mousedown', (e) => {
        e.preventDefault(); // keep the editor selection intact
        it.action();
        hide();
      });
      menu.appendChild(el);
    }
  }
  render();

  function show(x: number, y: number) {
    menu.style.display = 'block';
    const rect = menu.getBoundingClientRect();
    const px = Math.min(x, window.innerWidth - rect.width - 4);
    const py = Math.min(y, window.innerHeight - rect.height - 4);
    menu.style.left = `${px}px`;
    menu.style.top = `${py}px`;
  }
  function hide() {
    menu.style.display = 'none';
  }

  // Attach on document (capture) so it fires regardless of where the editor
  // mounts its nodes; the container reference is only used for the editor.
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
