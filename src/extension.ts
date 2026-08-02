import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { buildFtr10Css, isFtr10Present, watchFtr10Theme, FTR10_COLORS_CSS_PATH } from './ftr10-theme';
import { openExcalidrawEditor } from './excalidraw-editor';

// ---------- message protocol (host <-> webview) ----------
interface InitMsg { type: 'init'; markdown: string; theme: 'light' | 'dark'; uri: string; dev?: boolean; }
interface SetMarkdownMsg { type: 'setMarkdown'; markdown: string; }
interface ChangeMsg { type: 'change'; markdown: string; }
interface ReadyMsg { type: 'ready'; }
interface ThemeMsg { type: 'theme'; theme: 'light' | 'dark'; }
interface OpenExternalMsg { type: 'openExternal'; href: string; }
interface RequestImageMsg { type: 'requestWorkspaceImage'; requestId: number; }
interface Ftr10CssMsg { type: 'ftr10Css'; css: string; }
interface WorkspaceImageMsg { type: 'workspaceImage'; requestId: number; path: string | null; }
interface ReloadMsg { type: 'reload'; }
interface ExcalidrawEditMsg { type: 'excalidrawEdit'; uri: string; data: string; }
interface RefreshExcalidrawMsg { type: 'refreshExcalidraw'; uri: string; }
type ToWebview = InitMsg | SetMarkdownMsg | ThemeMsg | WorkspaceImageMsg | ReloadMsg | Ftr10CssMsg | RefreshExcalidrawMsg;
type FromWebview = ReadyMsg | ChangeMsg | OpenExternalMsg | RequestImageMsg | ExcalidrawEditMsg;

let activePanel: vscode.WebviewPanel | undefined;
// Set synchronously just before we applyEdit for a webview-originated change,
// and cleared on a LATER macrotask (setTimeout 0) — NOT inside the change
// handler. A single full-document applyEdit fires MULTIPLE onDidChangeText-
// Document events, all synchronously within the applyEdit call, so a flag
// cleared inside the handler would miss the 2nd+ events and let the echo
// through. Keeping the flag true until after the synchronous applyEdit returns
// suppresses every event of that one edit.
let applyingFromWebview = false;
// The markdown text we last synced in EITHER direction. Backstop for any
// change event that fires AFTER the flag is cleared (async/late): if its text
// (EOL + trailing-newline normalised) equals this, it is our own round-trip.
let lastSyncedMarkdown = '';
// Dev/debug mode: verbose host<->webview logging + verbose webview console.
let devMode = false;

// Normalise for echo comparison: unify CRLF->LF and ignore trailing newlines,
// because VS Code's stored text does not byte-match what muya serialises
// (off-by-one trailing newline / EOL), which otherwise defeats the compare.
const normText = (s: string) => s.replace(/\r\n/g, '\n').replace(/\n+$/, '');

const log = (...args: unknown[]) => {
  if (devMode) console.log('[marktext]', ...args);
};

function getNonce(): string {
  let text = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) text += chars[Math.floor(Math.random() * chars.length)];
  return text;
}

function getMdDocument(): vscode.TextDocument | undefined {
  const editor = vscode.window.activeTextEditor;
  if (editor && editor.document.languageId === 'markdown') return editor.document;
  const md = vscode.window.visibleTextEditors.find(e => e.document.languageId === 'markdown');
  return md?.document;
}

function post(panel: vscode.WebviewPanel, msg: ToWebview) {
  log('-> webview', msg.type, 'uri' in msg ? (msg as any).uri : '');
  panel.webview.postMessage(msg);
}

function readMuyaCss(): string {
  const cssPath = path.join(EXT_ROOT, 'out', 'webview', 'main.css');
  try {
    return fs.readFileSync(cssPath, 'utf8');
  } catch {
    return '';
  }
}

function buildHtml(panel: vscode.WebviewPanel): string {
  const scriptUri = panel.webview.asWebviewUri(vscode.Uri.file(
    path.join(EXT_ROOT, 'out', 'webview', 'main.js')));
  const nonce = getNonce();
  const css = readMuyaCss();
  const ftr10Css = buildFtr10Css();
  // main.js is a self-contained IIFE (muya + UI + message protocol); the editor
  // CSS is injected here so the WYSIWYG surface is actually styled.
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

let EXT_ROOT = '';
let activeUri = '';

export function activate(context: vscode.ExtensionContext) {
  EXT_ROOT = context.extensionUri.fsPath;
  // Persist dev mode across reloads within the workspace.
  devMode = context.workspaceState.get<boolean>('devMode', false);
  log('activate; devMode =', devMode);

  const openCmd = vscode.commands.registerCommand('marktext-editor.open', () => {
    const doc = getMdDocument();
    if (!doc) {
      vscode.window.showInformationMessage('Open a Markdown (.md) file first, then run "MarkText: Open WYSIWYG Editor".');
      return;
    }
    openEditorForDoc(doc, context);
  });

  const reloadCmd = vscode.commands.registerCommand('marktext-editor.reloadWebview', () => {
    if (activePanel) {
      // Re-set the HTML with a fresh nonce — forces the webview to reload the
      // script and fully re-initialise (used for hot-reload during dev).
      activePanel.webview.html = buildHtml(activePanel);
      log('reload requested');
    } else {
      vscode.window.showInformationMessage('MarkText: no webview open to reload.');
    }
  });

  const toggleDevCmd = vscode.commands.registerCommand('marktext-editor.toggleDev', async () => {
    devMode = !devMode;
    await context.workspaceState.update('devMode', devMode);
    vscode.window.showInformationMessage(`MarkText dev mode: ${devMode ? 'ON' : 'OFF'} (reload webview to apply).`);
  });

  context.subscriptions.push(openCmd, reloadCmd, toggleDevCmd);

  // Live-track the FTR10 Architect palette. When the user switches theme cards
  // in Architect, colors.css is rewritten; push the new tokens straight into an
  // open webview instead of rebuilding its HTML (which would remount muya and
  // lose the caret / undo stack).
  log('FTR10 Architect palette:', isFtr10Present() ? FTR10_COLORS_CSS_PATH : 'not installed (using bundled fallback)');
  const ftr10Watcher = watchFtr10Theme(() => {
    if (!activePanel) return;
    log('FTR10 palette changed -> pushing css to webview');
    post(activePanel, { type: 'ftr10Css', css: buildFtr10Css() });
  });
  context.subscriptions.push({ dispose: () => ftr10Watcher.dispose() });
}

function openEditorForDoc(doc: vscode.TextDocument, context: vscode.ExtensionContext) {
  const uri = doc.uri;
  activeUri = uri.toString();
  const column = vscode.ViewColumn.Beside;

  if (activePanel) {
    activePanel.reveal(column);
    // Rebind to the newly requested doc without recreating the panel.
    bindDocument(activePanel, uri, context);
    return;
  }

  const panel = vscode.window.createWebviewPanel(
    'marktextEditor',
    `MarkText: ${path.basename(uri.fsPath)}`,
    column,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [vscode.Uri.file(path.join(EXT_ROOT, 'out'))],
    });

  activePanel = panel;
  panel.webview.html = buildHtml(panel);

  // `ready` is posted by the webview once per boot. We only bind on the first
  // one to avoid double-initialising (which would mount two Muya instances).
  let bound = false;

  panel.webview.onDidReceiveMessage((msg: FromWebview) => {
    log('<- webview', msg.type);
    // Host-side trace (Extension Host console) of the sync flow, so a broken
    // round-trip is visible even with dev mode off.
    if (msg.type === 'change') console.log('[marktext-host] change from webview (len ' + msg.markdown.length + ')');
    switch (msg.type) {
      case 'ready':
        if (!bound) {
          bound = true;
          bindDocument(panel, uri, context);
        }
        break;
      case 'change':
        // Remember what we are about to write so the resulting change events
        // (applyEdit emits several) are recognised as our own echo and skipped.
        lastSyncedMarkdown = msg.markdown;
        applyChangeToDocument(uri, msg.markdown);
        break;
      case 'openExternal':
        try { vscode.env.openExternal(vscode.Uri.parse(msg.href)); } catch { /* ignore */ }
        break;
      case 'excalidrawEdit':
        console.log('[marktext-host] received excalidrawEdit from webview');
        openExcalidrawEditor(vscode.Uri.parse(msg.uri), msg.data, context, activePanel);
        break;
      case 'requestWorkspaceImage': {
        const requestId = msg.requestId;
        const docDir = path.dirname(uri.fsPath);
        vscode.window.showOpenDialog({
          canSelectFiles: true,
          canSelectFolders: false,
          canSelectMany: false,
          defaultUri: vscode.Uri.file(docDir),
          filters: { Images: ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'] },
        }).then((files) => {
          const p = files && files[0] ? files[0].fsPath : null;
          post(panel, { type: 'workspaceImage', requestId, path: p });
        });
        break;
      }
    }
  });

  panel.onDidDispose(() => {
    activePanel = undefined;
  }, null, context.subscriptions);

  context.subscriptions.push(panel);
}

function bindDocument(panel: vscode.WebviewPanel, uri: vscode.Uri, context: vscode.ExtensionContext) {
  const doc = getOpenDoc(uri) ?? vscode.workspace.textDocuments.find(d => d.uri.toString() === uri.toString());
  if (!doc) return;
  // Reset echo state for this document so a stale value from a previously
  // bound doc can't cause a false echo match on the first change.
  lastSyncedMarkdown = '';
  const theme = vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark ? 'dark' : 'light';
  post(panel, { type: 'init', markdown: doc.getText(), theme, uri: uri.toString(), dev: devMode });

  // Forward external edits (typing in the text editor, or another source) to
  // the webview. Suppress our OWN echo two ways:
  //  1) applyingFromWebview flag is true for the entire synchronous applyEdit
  //     (all of its multiple change events fire within that call), so any
  //     event while it is true is our echo and is skipped.
  //  2) as a backstop for any late/async event, if the event text (EOL +
  //     trailing-newline normalised) equals lastSyncedMarkdown, skip it.
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
    post(panel, { type: 'setMarkdown', markdown: text });
  });
  context.subscriptions.push(sub);

  const themeSub = vscode.window.onDidChangeActiveColorTheme((t) => {
    const kind = t.kind === vscode.ColorThemeKind.Dark ? 'dark' : 'light';
    post(panel, { type: 'theme', theme: kind });
  });
  context.subscriptions.push(themeSub);
}

function getOpenDoc(uri: vscode.Uri): vscode.TextDocument | undefined {
  return vscode.workspace.textDocuments.find(d => d.uri.toString() === uri.toString());
}

function applyChangeToDocument(uri: vscode.Uri, markdown: string) {
  const doc = getOpenDoc(uri);
  if (!doc) return;
  // No-op when the document already holds this text — prevents an echo loop.
  if (doc.getText() === markdown) return;
  // Mark that the synchronous applyEdit below is ours; the change events it
  // emits (multiple, all within the call) are skipped by the handler. Cleared
  // on a later macrotask so it stays true for the whole synchronous applyEdit
  // but cannot leak into a subsequent, unrelated external edit.
  applyingFromWebview = true;
  lastSyncedMarkdown = markdown;
  const edit = new vscode.WorkspaceEdit();
  edit.replace(uri, new vscode.Range(0, 0, doc.lineCount, 0), markdown);
  vscode.workspace.applyEdit(edit);
  setTimeout(() => { applyingFromWebview = false; }, 0);
}

export function deactivate() {
  activePanel?.dispose();
  activePanel = undefined;
}
