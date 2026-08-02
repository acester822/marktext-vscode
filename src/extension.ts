import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { buildFtr10Css, isFtr10Present, watchFtr10Theme, FTR10_COLORS_CSS_PATH } from './ftr10-theme';
import { openExcalidrawEditor } from './excalidraw-editor';

// ---------- message protocol (host <-> webview) ----------
interface InitMsg { type: 'init'; markdown: string; theme: 'light' | 'dark'; uri: string; dev?: boolean; maxContentWidth?: number; }
interface SetMarkdownMsg { type: 'setMarkdown'; markdown: string; }
interface ConfigMsg { type: 'config'; maxContentWidth?: number; }
interface ChangeMsg { type: 'change'; markdown: string; }
interface ReadyMsg { type: 'ready'; }
interface ThemeMsg { type: 'theme'; theme: 'light' | 'dark'; }
interface OpenExternalMsg { type: 'openExternal'; href: string; }
interface OpenLocalMsg { type: 'openLocal'; href: string; }
interface RequestImageMsg { type: 'requestWorkspaceImage'; requestId: number; }
interface ResolveImageMsg { type: 'resolveImage'; requestId: number; src: string; }
interface Ftr10CssMsg { type: 'ftr10Css'; css: string; }
interface WorkspaceImageMsg { type: 'workspaceImage'; requestId: number; path: string | null; uri: string | null; }
interface ResolveImageResultMsg { type: 'resolveImageResult'; requestId: number; uri: string | null; }
interface ReloadMsg { type: 'reload'; }
interface ExcalidrawEditMsg { type: 'excalidrawEdit'; uri: string; data: string; }
interface RefreshExcalidrawMsg { type: 'refreshExcalidraw'; uri: string; }
type ToWebview = InitMsg | SetMarkdownMsg | ThemeMsg | WorkspaceImageMsg | ReloadMsg | Ftr10CssMsg | RefreshExcalidrawMsg | ConfigMsg | ResolveImageResultMsg;
type FromWebview = ReadyMsg | ChangeMsg | OpenExternalMsg | OpenLocalMsg | RequestImageMsg | ResolveImageMsg | ExcalidrawEditMsg;

const VIEW_TYPE = 'marktext-vscode.marktextEditor';
// The built-in Monaco text editor. Used to flip a .md file back to the classic
// editor from the title-bar toggle. `default` is VS Code's reserved id for the
// standard text editor of a language.
const TEXT_EDITOR_ID = 'default';

let devMode = false;
// Per-document echo guard. Set synchronously just before we applyEdit for a
// webview-originated change, cleared on a later macrotask (setTimeout 0). A
// single full-document applyEdit fires MULTIPLE onDidChangeTextDocument events
// synchronously within the applyEdit call, so a flag cleared inside the change
// handler would miss the 2nd+ events and let the echo through.
let applyingFromWebview = false;
// The markdown text we last synced in EITHER direction, as a backstop for any
// change event that fires AFTER the flag is cleared (async/late): if its text
// (EOL + trailing-newline normalised) equals this, it is our own round-trip.
let lastSyncedMarkdown = '';

// One editor session per TextDocument. The webview panel is provided by VS Code
// through resolveCustomTextEditor; we re-bind it when the same document is
// reopened (e.g. switching editor types) instead of leaking duplicates.
const sessions = new Map<string, MarkdownSession>();

const normText = (s: string) => s.replace(/\r\n/g, '\n').replace(/\n+$/, '');
const log = (...args: unknown[]) => { if (devMode) console.log('[marktext]', ...args); };
function getNonce(): string {
  let t = '';
  const c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) t += c[Math.floor(Math.random() * c.length)];
  return t;
}
function getMaxContentWidth(): number {
  const v = vscode.workspace.getConfiguration('marktext.editor').get<number>('maxContentWidth', 0);
  return Number.isFinite(v) && v! > 0 ? Math.round(v!) : 0;
}
function getMdDocument(): vscode.TextDocument | undefined {
  const e = vscode.window.activeTextEditor;
  if (e && e.document.languageId === 'markdown') return e.document;
  return vscode.window.visibleTextEditors.find(x => x.document.languageId === 'markdown')?.document;
}
function post(panel: vscode.WebviewPanel, msg: ToWebview) {
  log('-> webview', msg.type, 'uri' in msg ? (msg as any).uri : '');
  panel.webview.postMessage(msg);
}
function readMuyaCss(): string {
  try { return fs.readFileSync(path.join(EXT_ROOT, 'out', 'webview', 'main.css'), 'utf8'); }
  catch { return ''; }
}

let EXT_ROOT = '';
let extContext: vscode.ExtensionContext | undefined;

function buildHtml(panel: vscode.WebviewPanel): string {
  const scriptUri = panel.webview.asWebviewUri(vscode.Uri.file(path.join(EXT_ROOT, 'out', 'webview', 'main.js')));
  const nonce = getNonce();
  const css = readMuyaCss();
  const ftr10Css = buildFtr10Css();
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>MarkText</title>
<style nonce="${nonce}">
  html, body { margin: 0; padding: 0; height: 100%; background: transparent; }
  #app { height: 100%; overflow: auto; }
  #app .mu-editor, #app .mu-content-container { min-height: 100%; }
</style>
<style nonce="${nonce}">
${css}
</style>
<style nonce="${nonce}" id="ftr10-theme">
  /* Must come AFTER the muya bundle: muya declares its own :root values for
     these, and last-wins at equal specificity. FTR10 Architect design tokens
     (live from ~/.ftr10/css.files/colors.css, else a bundled snapshot) plus the
     bridge that maps them onto the variables muya's stylesheets actually read.
     Updated in place via the ftr10Css message — replacing the whole HTML
     would remount muya and reset the caret. */
${ftr10Css}
</style>
</head>
<body>
<div id="app"></div>
<script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
}

interface MarkdownSession {
  panel: vscode.WebviewPanel;
  uri: vscode.Uri;
  subscriptions: vscode.Disposable[];
  disposed: boolean;
  /** Absolute dirs that must be webview-loadable (for local images). */
  resourceRoots: Set<string>;
  bind(document: vscode.TextDocument): void;
}

/**
 * Add an on-disk directory to the panel's localResourceRoots so the webview can
 * fetch images from it via asWebviewUri. The set is persistent per session so
 * re-adding the same dir is a no-op and we only touch panel.webview.options when
 * the set actually grows.
 */
function addResourceRoot(session: MarkdownSession, absDir: string) {
  if (session.resourceRoots.has(absDir)) return;
  session.resourceRoots.add(absDir);
  const roots = [vscode.Uri.file(path.join(EXT_ROOT, 'out')), ...Array.from(session.resourceRoots, d => vscode.Uri.file(d))];
  session.panel.webview.options = { ...session.panel.webview.options, localResourceRoots: roots };
}


function createSession(panel: vscode.WebviewPanel, uri: vscode.Uri): MarkdownSession {
  const session: MarkdownSession = {
    panel, uri, subscriptions: [], disposed: false, resourceRoots: new Set(),
    bind: (document: vscode.TextDocument) => { bindDocument(session, document); },
  };

  panel.webview.onDidReceiveMessage((msg: FromWebview) => {
    log('<- webview', msg.type);
    if (msg.type === 'change') console.log('[marktext-host] change from webview (len ' + msg.markdown.length + ')');
    switch (msg.type) {
      case 'ready':
        bindDocument(session, vscode.workspace.textDocuments.find(d => d.uri.toString() === uri.toString())!);
        break;
      case 'change':
        lastSyncedMarkdown = msg.markdown;
        applyChangeToDocument(uri, msg.markdown);
        break;
      case 'openExternal':
        try { vscode.env.openExternal(vscode.Uri.parse(msg.href)); } catch { /* ignore */ }
        break;
      case 'openLocal': {
        // A relative/anchor/workspace link inside the doc. Resolve against the
        // doc dir (anchors #... stay on the current doc; ./x.md opens x.md).
        try {
          const docDir = path.dirname(uri.fsPath);
          const h = msg.href || '';
          const target = h.startsWith('#')
            ? uri
            : /^[a-z][a-z0-9+.-]*:/i.test(h) && !/^file:/i.test(h)
              ? null // true external scheme (http:, mailto:, etc.) -> not local
              : vscode.Uri.file(path.resolve(docDir, decodeURIComponent(h.replace(/^file:\/\//i, ''))));
          if (!target) { vscode.env.openExternal(vscode.Uri.parse(h)); break; }
          vscode.commands.executeCommand('vscode.openWith', target, VIEW_TYPE, vscode.ViewColumn.Active).then(
            () => { /* opened */ },
            () => { vscode.commands.executeCommand('vscode.open', target, vscode.ViewColumn.Active); },
          );
        } catch { /* ignore */ }
        break;
      }
      case 'excalidrawEdit':
        console.log('[marktext-host] received excalidrawEdit from webview');
        openExcalidrawEditor(vscode.Uri.parse(msg.uri), msg.data, extContext!, panel);
        break;
      case 'requestWorkspaceImage': {
        const requestId = msg.requestId;
        const docDir = path.dirname(uri.fsPath);
        vscode.window.showOpenDialog({
          canSelectFiles: true, canSelectFolders: false, canSelectMany: false,
          defaultUri: vscode.Uri.file(docDir),
          filters: { Images: ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'] },
        }).then((files) => {
          const p = files && files[0] ? files[0].fsPath : null;
          if (p) {
            // Persist a *portable* relative path in the markdown (relative to
            // the doc). Also make the image's dir webview-loadable and hand
            // back a webview URI so it actually renders (raw file:// is
            // blocked) — the resolver maps src->URI at render time.
            const rel = path.relative(docDir, p).split(path.sep).join('/');
            addResourceRoot(session, path.dirname(p));
            const uriStr = panel.webview.asWebviewUri(vscode.Uri.file(p)).toString();
            post(panel, { type: 'workspaceImage', requestId, path: rel, uri: uriStr });
          } else {
            post(panel, { type: 'workspaceImage', requestId, path: null, uri: null });
          }
        });
        break;
      }
      case 'resolveImage': {
        // The webview hit a local image src (relative/absolute/file://) in the
        // rendered doc. Resolve it against the doc dir, allow the webview to
        // load its folder, and return a webview URI.
        const requestId = msg.requestId;
        const docDir = path.dirname(uri.fsPath);
        let abs = msg.src;
        if (/^file:\/\//i.test(abs)) abs = vscode.Uri.parse(abs).fsPath;
        else if (/^https?:\/\//i.test(abs)) { post(panel, { type: 'resolveImageResult', requestId, uri: abs }); break; }
        else if (!path.isAbsolute(abs)) abs = path.resolve(docDir, abs);
        addResourceRoot(session, path.dirname(abs));
        const uriStr = panel.webview.asWebviewUri(vscode.Uri.file(abs)).toString();
        post(panel, { type: 'resolveImageResult', requestId, uri: uriStr });
        break;
      }
    }
  });

  panel.onDidDispose(() => {
    session.disposed = true;
    session.subscriptions.forEach(s => s.dispose());
    sessions.delete(uri.toString());
  });

  return session;
}

function bindDocument(session: MarkdownSession, doc: vscode.TextDocument) {
  if (session.disposed) return;
  const uri = session.uri;
  lastSyncedMarkdown = '';
  const theme = vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark ? 'dark' : 'light';
  post(session.panel, { type: 'init', markdown: doc.getText(), theme, uri: uri.toString(), dev: devMode, maxContentWidth: getMaxContentWidth() });

  const sub = vscode.workspace.onDidChangeTextDocument((e) => {
    if (e.document.uri.toString() !== uri.toString()) return;
    if (applyingFromWebview) {
      console.log('[marktext-host] change during our applyEdit (skip echo)');
      return;
    }
    const text = e.document.getText();
    if (normText(text) === normText(lastSyncedMarkdown)) {
      console.log('[marktext-host] change matches synced state (skip echo)');
      return;
    }
    console.log('[marktext-host] external change -> post setMarkdown to webview (len ' + text.length + ')');
    lastSyncedMarkdown = text;
    post(session.panel, { type: 'setMarkdown', markdown: text });
  });
  session.subscriptions.push(sub);

  const themeSub = vscode.window.onDidChangeActiveColorTheme((t) => {
    post(session.panel, { type: 'theme', theme: t.kind === vscode.ColorThemeKind.Dark ? 'dark' : 'light' });
  });
  session.subscriptions.push(themeSub);
}

function applyChangeToDocument(uri: vscode.Uri, markdown: string) {
  const doc = vscode.workspace.textDocuments.find(d => d.uri.toString() === uri.toString());
  if (!doc) return;
  if (doc.getText() === markdown) return;
  applyingFromWebview = true;
  lastSyncedMarkdown = markdown;
  const edit = new vscode.WorkspaceEdit();
  edit.replace(uri, new vscode.Range(0, 0, doc.lineCount, 0), markdown);
  vscode.workspace.applyEdit(edit);
  setTimeout(() => { applyingFromWebview = false; }, 0);
}

function activeMdUri(): vscode.Uri | undefined {
  // A focused MarkText custom-editor tab is NOT a TextEditor, so
  // window.activeTextEditor is undefined there. Read the URI straight from the
  // active tab's input instead — both Monaco and custom-editor tabs expose a
  // TabInputText with a `uri`, and both target .md files.
  const tab = vscode.window.tabGroups.activeTabGroup?.activeTab;
  const input = tab?.input as { uri?: vscode.Uri } | undefined;
  if (input?.uri && /\.md$/i.test(input.uri.fsPath)) return input.uri;
  return undefined;
}

// Reopen the active .md file in the classic Monaco editor.
function switchToClassic() {
  const uri = activeMdUri();
  if (!uri) { vscode.window.showInformationMessage('MarkText: open a Markdown (.md) file first.'); return; }
  const col = vscode.window.tabGroups.activeTabGroup?.viewColumn ?? vscode.ViewColumn.Active;
  // Close the WYSIWYG panel first so we don't end up with two tabs for one file.
  vscode.commands.executeCommand('workbench.action.closeActiveEditor').then(() => {
    vscode.commands.executeCommand('vscode.openWith', uri, TEXT_EDITOR_ID, col);
  });
}

// Reopen the active .md file in the MarkText WYSIWYG editor.
function switchToWysiwyg() {
  const uri = activeMdUri();
  if (!uri) { vscode.window.showInformationMessage('MarkText: open a Markdown (.md) file first.'); return; }
  const col = vscode.window.tabGroups.activeTabGroup?.viewColumn ?? vscode.ViewColumn.Active;
  vscode.commands.executeCommand('workbench.action.closeActiveEditor').then(() => {
    vscode.commands.executeCommand('vscode.openWith', uri, VIEW_TYPE, col);
  });
}

// Self-managed context key: true when the active tab is a MarkText WYSIWYG
// editor. The built-in `editorId` when-context is useless here — a Monaco tab's
// editorId is 'default' and a custom-editor tab's editorId is unset, so
// `editorId == <viewType>` is never true and `editorId != <viewType>` is true in
// BOTH modes (which is why the same icon showed and the wrong command fired).
// A custom editor's tab input is a TabInputCustom whose `viewType` is our id.
function updateWysiwygContextKey() {
  const tab = vscode.window.tabGroups.activeTabGroup?.activeTab;
  const input = tab?.input;
  const isWysiwyg = input instanceof vscode.TabInputCustom && input.viewType === VIEW_TYPE;
  vscode.commands.executeCommand('setContext', 'marktext.editor.isWysiwyg', isWysiwyg);
}

function updateEditorAssociations() {
  const cfg = vscode.workspace.getConfiguration('marktext.editor');
  const wantDefault = cfg.get<boolean>('defaultForMarkdown', false);
  const edAssoc = vscode.workspace.getConfiguration('workbench').get<Record<string, string>>('editorAssociations', {});
  const current = edAssoc['*.md'];
  if (wantDefault && current !== VIEW_TYPE) {
    edAssoc['*.md'] = VIEW_TYPE;
    vscode.workspace.getConfiguration('workbench').update('editorAssociations', edAssoc, vscode.ConfigurationTarget.Global);
  } else if (!wantDefault && current === VIEW_TYPE) {
    delete edAssoc['*.md'];
    vscode.workspace.getConfiguration('workbench').update('editorAssociations', edAssoc, vscode.ConfigurationTarget.Global);
  }
}

export function activate(context: vscode.ExtensionContext) {
  EXT_ROOT = context.extensionUri.fsPath;
  extContext = context;
  devMode = context.workspaceState.get<boolean>('devMode', false);
  log('activate; devMode =', devMode);

  context.subscriptions.push(
    vscode.window.registerCustomEditorProvider(
      VIEW_TYPE,
      {
        async resolveCustomTextEditor(document: vscode.TextDocument, panel: vscode.WebviewPanel) {
          log('resolveCustomTextEditor', document.uri.toString());
          panel.webview.options = {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.file(path.join(EXT_ROOT, 'out'))],
          };
          panel.webview.html = buildHtml(panel);
          const existing = sessions.get(document.uri.toString());
          if (existing) { existing.panel = panel; existing.bind(document); }
          else sessions.set(document.uri.toString(), createSession(panel, document.uri));
          updateWysiwygContextKey();
        },
      },
      {
        webviewOptions: { retainContextWhenHidden: true },
        supportsMultipleEditorsPerDocument: false,
      },
    ),
  );

  // Honor the opt-in setting: when enabled, .md files open in MarkText by default.
  updateEditorAssociations();
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('marktext.editor.defaultForMarkdown')) updateEditorAssociations();
      if (e.affectsConfiguration('marktext.editor.maxContentWidth')) {
        const w = getMaxContentWidth();
        sessions.forEach((s) => { if (!s.disposed) post(s.panel, { type: 'config', maxContentWidth: w }); });
      }
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('marktext-editor.open', () => {
      const doc = getMdDocument();
      if (!doc) { vscode.window.showInformationMessage('Open a Markdown (.md) file first, then run "MarkText: Open WYSIWYG Editor".'); return; }
      vscode.commands.executeCommand('vscode.openWith', doc.uri, VIEW_TYPE, vscode.ViewColumn.Active);
    }),
    vscode.commands.registerCommand('marktext-editor.reloadWebview', () => {
      const uri = activeMdUri();
      if (uri) {
        const col = vscode.window.tabGroups.activeTabGroup?.viewColumn ?? vscode.ViewColumn.Active;
        vscode.commands.executeCommand('workbench.action.closeActiveEditor');
        vscode.commands.executeCommand('vscode.openWith', uri, VIEW_TYPE, col);
      } else {
        vscode.window.showInformationMessage('MarkText: no WYSIWYG editor open to reload.');
      }
    }),
    vscode.commands.registerCommand('marktext-editor.toggleDev', async () => {
      devMode = !devMode;
      await context.workspaceState.update('devMode', devMode);
      vscode.window.showInformationMessage(`MarkText dev mode: ${devMode ? 'ON' : 'OFF'} (reload webview to apply).`);
    }),
    vscode.commands.registerCommand('marktext-editor.useClassic', () => {
      const tab = vscode.window.tabGroups.activeTabGroup?.activeTab;
      const isWysiwyg = tab?.input instanceof vscode.TabInputCustom && (tab.input as vscode.TabInputCustom).viewType === VIEW_TYPE;
      if (!isWysiwyg) { vscode.window.showInformationMessage('MarkText: this file is already in the Classic editor.'); return; }
      switchToClassic();
    }),
    vscode.commands.registerCommand('marktext-editor.useWysiwyg', () => {
      const tab = vscode.window.tabGroups.activeTabGroup?.activeTab;
      const isWysiwyg = tab?.input instanceof vscode.TabInputCustom && (tab.input as vscode.TabInputCustom).viewType === VIEW_TYPE;
      if (isWysiwyg) { vscode.window.showInformationMessage('MarkText: this file is already in the WYSIWYG editor.'); return; }
      switchToWysiwyg();
    }),
  );

  // Keep our self-managed "active editor is WYSIWYG" context key in sync so the
  // title-bar toggle shows the right icon. Resolve runs on open; this covers
  // focus changes (clicking between a MarkText tab and a Monaco tab, split view).
  updateWysiwygContextKey();
  context.subscriptions.push(
    vscode.window.tabGroups.onDidChangeTabGroups(() => updateWysiwygContextKey()),
    vscode.window.tabGroups.onDidChangeTabs(() => updateWysiwygContextKey()),
    vscode.window.onDidChangeActiveTextEditor(() => updateWysiwygContextKey()),
  );

  log('FTR10 Architect palette:', isFtr10Present() ? FTR10_COLORS_CSS_PATH : 'not installed (using bundled fallback)');
  const ftr10Watcher = watchFtr10Theme(() => {
    sessions.forEach((s) => { if (!s.disposed) post(s.panel, { type: 'ftr10Css', css: buildFtr10Css() }); });
  });
  context.subscriptions.push({ dispose: () => ftr10Watcher.dispose() });
}

export function deactivate() {
  sessions.forEach(s => s.panel.dispose());
  sessions.clear();
}
