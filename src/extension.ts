import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

// ---------- message protocol (host <-> webview) ----------
interface InitMsg { type: 'init'; markdown: string; theme: 'light' | 'dark'; uri: string; }
interface SetMarkdownMsg { type: 'setMarkdown'; markdown: string; }
interface ChangeMsg { type: 'change'; markdown: string; }
interface ReadyMsg { type: 'ready'; }
interface ThemeMsg { type: 'theme'; theme: 'light' | 'dark'; }
interface OpenExternalMsg { type: 'openExternal'; href: string; }
interface RequestImageMsg { type: 'requestWorkspaceImage'; requestId: number; }
interface WorkspaceImageMsg { type: 'workspaceImage'; requestId: number; path: string | null; }
type ToWebview = InitMsg | SetMarkdownMsg | ThemeMsg | WorkspaceImageMsg;
type FromWebview = ReadyMsg | ChangeMsg | OpenExternalMsg | RequestImageMsg;

let activePanel: vscode.WebviewPanel | undefined;
// Set while the host applies a webview-originated change to the document,
// so we don't echo it back to the webview (which would reset the caret).
let applyingFromWebview = false;

function getNonce(): string {
  let text = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) text += chars[Math.floor(Math.random() * chars.length)];
  return text;
}

function getMdDocument(): vscode.TextDocument | undefined {
  const editor = vscode.window.activeTextEditor;
  if (editor && editor.document.languageId === 'markdown') return editor.document;
  // fall back: pick the first visible markdown editor
  const md = vscode.window.visibleTextEditors.find(e => e.document.languageId === 'markdown');
  return md?.document;
}

function post(panel: vscode.WebviewPanel, msg: ToWebview) {
  panel.webview.postMessage(msg);
}

function buildHtml(panel: vscode.WebviewPanel): string {
  const scriptUri = panel.webview.asWebviewUri(vscode.Uri.file(
    path.join(EXT_ROOT, 'out', 'webview', 'main.js')));
  const nonce = getNonce();
  // main.js is a self-contained IIFE bundle (muya + UI + message protocol),
  // with all assets inlined as data URLs — no import map or runtime file loads.
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>MarkText</title>
<style>
  html, body { margin: 0; padding: 0; height: 100%; background: transparent; }
  #app { height: 100%; overflow: auto; }
  #app .mu-editor, #app .mu-content-container { min-height: 100%; }
</style>
</head>
<body>
<div id="app"></div>
<script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
}

let EXT_ROOT = '';

export function activate(context: vscode.ExtensionContext) {
  EXT_ROOT = context.extensionUri.fsPath;

  const openCmd = vscode.commands.registerCommand('marktext-editor.open', () => {
    const doc = getMdDocument();
    if (!doc) {
      vscode.window.showInformationMessage('Open a Markdown (.md) file first, then run "MarkText: Open WYSIWYG Editor".');
      return;
    }
    openEditorForDoc(doc, context);
  });

  context.subscriptions.push(openCmd);
}

function openEditorForDoc(doc: vscode.TextDocument, context: vscode.ExtensionContext) {
  const uri = doc.uri;
  const column = vscode.ViewColumn.Beside;

  if (activePanel) {
    activePanel.reveal(column);
    // rebind to the newly requested doc
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

  // pending image-pick promises awaiting host response
  const pendingImages = new Map<number, (p: string | null) => void>();
  let reqSeq = 0;

  panel.webview.onDidReceiveMessage((msg: FromWebview) => {
    switch (msg.type) {
      case 'ready':
        bindDocument(panel, uri, context);
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
    pendingImages.clear();
  }, null, context.subscriptions);

  // keep a reference so it isn't collected
  context.subscriptions.push(panel);
}

function bindDocument(panel: vscode.WebviewPanel, uri: vscode.Uri, context: vscode.ExtensionContext) {
  const doc = getOpenDoc(uri) ?? vscode.workspace.textDocuments.find(d => d.uri.toString() === uri.toString());
  if (!doc) return;
  const theme = vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark ? 'dark' : 'light';
  post(panel, { type: 'init', markdown: doc.getText(), theme, uri: uri.toString() });

  // forward external edits (user typing in the text editor, or another source)
  const sub = vscode.workspace.onDidChangeTextDocument((e) => {
    if (e.document.uri.toString() !== uri.toString()) return;
    if (applyingFromWebview) return; // don't echo our own change back
    post(panel, { type: 'setMarkdown', markdown: e.document.getText() });
  });
  context.subscriptions.push(sub);

  // react to theme changes
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
  applyingFromWebview = true;
  const edit = new vscode.WorkspaceEdit();
  edit.replace(uri, new vscode.Range(0, 0, doc.lineCount, 0), markdown);
  vscode.workspace.applyEdit(edit).then((applied) => {
    // release the guard on the next tick so the resulting change event is skipped
    setTimeout(() => { applyingFromWebview = false; }, 0);
  });
}

export function deactivate() {
  activePanel?.dispose();
  activePanel = undefined;
}
