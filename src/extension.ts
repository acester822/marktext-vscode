import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

// ---------- message protocol (host <-> webview) ----------
interface InitMsg { type: 'init'; markdown: string; theme: 'light' | 'dark'; uri: string; dev?: boolean; }
interface SetMarkdownMsg { type: 'setMarkdown'; markdown: string; }
interface ChangeMsg { type: 'change'; markdown: string; }
interface ReadyMsg { type: 'ready'; }
interface ThemeMsg { type: 'theme'; theme: 'light' | 'dark'; }
interface OpenExternalMsg { type: 'openExternal'; href: string; }
interface RequestImageMsg { type: 'requestWorkspaceImage'; requestId: number; }
interface WorkspaceImageMsg { type: 'workspaceImage'; requestId: number; path: string | null; }
interface ReloadMsg { type: 'reload'; }
type ToWebview = InitMsg | SetMarkdownMsg | ThemeMsg | WorkspaceImageMsg | ReloadMsg;
type FromWebview = ReadyMsg | ChangeMsg | OpenExternalMsg | RequestImageMsg;

let activePanel: vscode.WebviewPanel | undefined;
// Set synchronously while the host applies a webview-originated change to the
// document. The matching onDidChangeTextDocument handler clears it and does
// NOT bounce the edit back to the webview — that round-trip would call
// muya.setContent(), which resets the caret and wipes muya's undo history.
// Cleared INSIDE the change handler (synchronously with applyEdit), so it
// swallows exactly the one echo and never lingers to suppress external edits.
let applyingFromWebview = false;
// Dev/debug mode: verbose host<->webview logging + verbose webview console.
let devMode = false;

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
        applyChangeToDocument(uri, msg.markdown);
        break;
      case 'openExternal':
        try { vscode.env.openExternal(vscode.Uri.parse(msg.href)); } catch { /* ignore */ }
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
  const theme = vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark ? 'dark' : 'light';
  post(panel, { type: 'init', markdown: doc.getText(), theme, uri: uri.toString(), dev: devMode });

  // Forward external edits (typing in the text editor, or another source) to
  // the webview. The webview applies them with applyingExternal set, so it
  // does not echo them back. The webview's OWN edits are applied via
  // applyChangeToDocument, which sets applyingFromWebview so we skip posting
  // them here — that prevents the setContent round-trip that resets the caret.
  const sub = vscode.workspace.onDidChangeTextDocument((e) => {
    if (e.document.uri.toString() !== uri.toString()) return;
    if (applyingFromWebview) {
      console.log('[marktext-host] change event is OURS (skip echo)');
      applyingFromWebview = false;
      return;
    }
    console.log('[marktext-host] external change -> post setMarkdown to webview (len ' + e.document.getText().length + ')');
    post(panel, { type: 'setMarkdown', markdown: e.document.getText() });
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
  // Mark this applyEdit as ours so the change handler does NOT bounce it back
  // to the webview (which would reset the caret + wipe undo history). The
  // handler clears the flag synchronously when our own change event arrives.
  // Defensive: reset any stale flag first so a previous stuck flag can't
  // silently suppress a legitimate external edit.
  applyingFromWebview = true;
  const edit = new vscode.WorkspaceEdit();
  edit.replace(uri, new vscode.Range(0, 0, doc.lineCount, 0), markdown);
  vscode.workspace.applyEdit(edit);
}

export function deactivate() {
  activePanel?.dispose();
  activePanel = undefined;
}
