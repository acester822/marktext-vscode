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
type InitMsg = { type: 'init'; markdown: string; theme: 'light' | 'dark'; uri: string };
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

function post(msg: FromWebview) {
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

window.addEventListener('message', (ev: MessageEvent) => {
  const msg = ev.data as ToWebview;
  switch (msg.type) {
    case 'init':
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
