"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);
var vscode = __toESM(require("vscode"));
var path = __toESM(require("path"));
var activePanel;
var applyingFromWebview = false;
function getNonce() {
  let text = "";
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) text += chars[Math.floor(Math.random() * chars.length)];
  return text;
}
function getMdDocument() {
  const editor = vscode.window.activeTextEditor;
  if (editor && editor.document.languageId === "markdown") return editor.document;
  const md = vscode.window.visibleTextEditors.find((e) => e.document.languageId === "markdown");
  return md?.document;
}
function post(panel, msg) {
  panel.webview.postMessage(msg);
}
function buildHtml(panel) {
  const scriptUri = panel.webview.asWebviewUri(vscode.Uri.file(
    path.join(EXT_ROOT, "out", "webview", "main.js")
  ));
  const nonce = getNonce();
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
var EXT_ROOT = "";
function activate(context) {
  EXT_ROOT = context.extensionUri.fsPath;
  const openCmd = vscode.commands.registerCommand("marktext-editor.open", () => {
    const doc = getMdDocument();
    if (!doc) {
      vscode.window.showInformationMessage('Open a Markdown (.md) file first, then run "MarkText: Open WYSIWYG Editor".');
      return;
    }
    openEditorForDoc(doc, context);
  });
  context.subscriptions.push(openCmd);
}
function openEditorForDoc(doc, context) {
  const uri = doc.uri;
  const column = vscode.ViewColumn.Beside;
  if (activePanel) {
    activePanel.reveal(column);
    bindDocument(activePanel, uri, context);
    return;
  }
  const panel = vscode.window.createWebviewPanel(
    "marktextEditor",
    `MarkText: ${path.basename(uri.fsPath)}`,
    column,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [vscode.Uri.file(path.join(EXT_ROOT, "out"))]
    }
  );
  activePanel = panel;
  panel.webview.html = buildHtml(panel);
  const pendingImages = /* @__PURE__ */ new Map();
  let reqSeq = 0;
  panel.webview.onDidReceiveMessage((msg) => {
    switch (msg.type) {
      case "ready":
        bindDocument(panel, uri, context);
        break;
      case "change":
        applyChangeToDocument(uri, msg.markdown);
        break;
      case "openExternal":
        try {
          vscode.env.openExternal(vscode.Uri.parse(msg.href));
        } catch {
        }
        break;
      case "requestWorkspaceImage": {
        const requestId = msg.requestId;
        const docDir = path.dirname(uri.fsPath);
        vscode.window.showOpenDialog({
          canSelectFiles: true,
          canSelectFolders: false,
          canSelectMany: false,
          defaultUri: vscode.Uri.file(docDir),
          filters: { Images: ["png", "jpg", "jpeg", "gif", "svg", "webp"] }
        }).then((files) => {
          const p = files && files[0] ? files[0].fsPath : null;
          post(panel, { type: "workspaceImage", requestId, path: p });
        });
        break;
      }
    }
  });
  panel.onDidDispose(() => {
    activePanel = void 0;
    pendingImages.clear();
  }, null, context.subscriptions);
  context.subscriptions.push(panel);
}
function bindDocument(panel, uri, context) {
  const doc = getOpenDoc(uri) ?? vscode.workspace.textDocuments.find((d) => d.uri.toString() === uri.toString());
  if (!doc) return;
  const theme = vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark ? "dark" : "light";
  post(panel, { type: "init", markdown: doc.getText(), theme, uri: uri.toString() });
  const sub = vscode.workspace.onDidChangeTextDocument((e) => {
    if (e.document.uri.toString() !== uri.toString()) return;
    if (applyingFromWebview) return;
    post(panel, { type: "setMarkdown", markdown: e.document.getText() });
  });
  context.subscriptions.push(sub);
  const themeSub = vscode.window.onDidChangeActiveColorTheme((t) => {
    const kind = t.kind === vscode.ColorThemeKind.Dark ? "dark" : "light";
    post(panel, { type: "theme", theme: kind });
  });
  context.subscriptions.push(themeSub);
}
function getOpenDoc(uri) {
  return vscode.workspace.textDocuments.find((d) => d.uri.toString() === uri.toString());
}
function applyChangeToDocument(uri, markdown) {
  const doc = getOpenDoc(uri);
  if (!doc) return;
  applyingFromWebview = true;
  const edit = new vscode.WorkspaceEdit();
  edit.replace(uri, new vscode.Range(0, 0, doc.lineCount, 0), markdown);
  vscode.workspace.applyEdit(edit).then((applied) => {
    setTimeout(() => {
      applyingFromWebview = false;
    }, 0);
  });
}
function deactivate() {
  activePanel?.dispose();
  activePanel = void 0;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
//# sourceMappingURL=extension.js.map
