import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

// Map of source markdown URI -> open editor panel, so re-editing the same file
// reveals the existing window instead of stacking duplicates.
const excalidrawPanels = new Map<string, vscode.WebviewPanel>();

// Read the bundled Excalidraw stylesheet. @excalidraw/excalidraw does not
// export the CSS through its package.json "exports" map, so require.resolve
// fails; resolve the path relative to the extension root instead (node_modules
// is always on disk in dev and packaged). Falls back to empty so the editor
// still boots, just unstyled.
//
// The extensionRoot is passed in (from context.extensionUri) rather than read
// from a module-scoped EXT_ROOT: esbuild renames/hides module-scoped lets when
// bundling, so a `declare const EXT_ROOT` in this file would reference a
// variable that does not actually exist at runtime.
function readExcalidrawCss(extensionRoot: string): string {
  try {
    const cssPath = path.join(
      extensionRoot,
      'node_modules',
      '@excalidraw',
      'excalidraw',
      'dist',
      'prod',
      'index.css',
    );
    return fs.readFileSync(cssPath, 'utf8');
  } catch {
    return '';
  }
}

function getNonce(): string {
  let text = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) text += chars[Math.floor(Math.random() * chars.length)];
  return text;
}

// Pull the ```excalidraw block out of a markdown document and replace it with
// new scene JSON, preserving the fence + surrounding text. Returns the new
// full markdown, or null if the block couldn't be located.
function replaceExcalidrawBlock(markdown: string, scene: string): string | null {
  const marker = '```excalidraw';
  const start = markdown.indexOf(marker);
  if (start < 0) return null;
  const afterMarker = start + marker.length;
  const close = markdown.indexOf('```', afterMarker);
  if (close < afterMarker) return null;
  const before = markdown.slice(0, afterMarker);
  const after = markdown.slice(close);
  // Normalise: ensure a newline after the fence open and before the close.
  const leading = before.endsWith('\n') ? '' : '\n';
  const trailing = after.startsWith('\n') ? '' : '\n';
  return before + leading + scene + trailing + after;
}

async function writeSceneToFile(
  uri: vscode.Uri,
  scene: string,
  context: vscode.ExtensionContext,
) {
  const doc =
    vscode.workspace.textDocuments.find(
      (d) => d.uri.toString() === uri.toString(),
    ) ?? (await vscode.workspace.openTextDocument(uri));
  const updated = replaceExcalidrawBlock(doc.getText(), scene);
  if (updated === null) {
    vscode.window.showErrorMessage(
      'Excalidraw: could not locate the ```excalidraw block to save into.',
    );
    return;
  }
  const edit = new vscode.WorkspaceEdit();
  edit.replace(uri, new vscode.Range(0, 0, doc.lineCount, 0), updated);
  await vscode.workspace.applyEdit(edit);
  // Save so the change persists without requiring a manual Ctrl+S.
  try {
    await doc.save();
  } catch {
    /* user may have it unsaved elsewhere; the edit is still applied */
  }
}

export function openExcalidrawEditor(
  uri: vscode.Uri,
  data: string,
  context: vscode.ExtensionContext,
) {
  const key = uri.toString();
  console.log('[marktext-host] openExcalidrawEditor called for', key);
  const existing = excalidrawPanels.get(key);
  if (existing) {
    existing.reveal(undefined, false);
    existing.webview.postMessage({ command: 'setExcalidrawData', data });
    return;
  }

  let scene = data ?? '';
  if (!scene) {
    scene = '{"elements":[],"appState":{}}';
  }

  // Resolve paths from the extension context (NOT a module-scoped EXT_ROOT
  // global, which esbuild renames and this file would not see).
  const root = context.extensionUri.fsPath;

  const panel = vscode.window.createWebviewPanel(
    'marktextExcalidrawEditor',
    `Excalidraw — ${path.basename(uri.fsPath)}`,
    { viewColumn: vscode.ViewColumn.Active, preserveFocus: false },
    {
      enableScripts: true,
      retainContextWhenHidden: true,
      // Only the editor JS is loaded via asWebviewUri (the Excalidraw CSS is
      // inlined), so `out` is the sole resource root we need.
      localResourceRoots: [vscode.Uri.file(path.join(root, 'out'))],
    },
  );
  excalidrawPanels.set(key, panel);
  panel.onDidDispose(() => {
    excalidrawPanels.delete(key);
  });

  const nonce = getNonce();
  const editorJs = panel.webview.asWebviewUri(
    vscode.Uri.file(path.join(root, 'out', 'webview', 'excalidraw-editor.js')),
  );
  const isDark =
    vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark ||
    vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.HighContrast;

  // Inline the Excalidraw stylesheet directly (it uses only data: URLs, so it
  // contains no external asset references). This avoids serving it from
  // node_modules at runtime, which breaks in code-server / remote where the
  // extension path does not map to node_modules.
  const excalidrawCss = readExcalidrawCss(root);

  panel.webview.html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  html, body { margin: 0; padding: 0; height: 100%; overflow: hidden; }
  .excalidraw-standalone-mount { position: fixed; inset: 0; }
</style>
<style nonce="${nonce}">
${excalidrawCss}
</style>
</head>
<body
  data-excalidraw-uri="${key}"
  data-excalidraw-theme="${isDark ? 'dark' : 'light'}"
  data-excalidraw-scene="${encodeURIComponent(scene)}"
>
<script nonce="${nonce}" src="${editorJs}"></script>
</body>
</html>`;

  panel.webview.onDidReceiveMessage(async (message: any) => {
    if (message?.command === 'updateExcalidrawData') {
      const args = message.args ?? [];
      const payload = args[0] ?? {};
      const targetUri: vscode.Uri = payload.uri
        ? vscode.Uri.parse(payload.uri)
        : uri;
      const sceneData: string = payload.data ?? '';
      if (sceneData) {
        await writeSceneToFile(targetUri, sceneData, context);
      }
    }
  });

  // Move the dedicated editor out into its own VS Code window so the user gets
  // a real standalone diagram editor rather than a second tab in the current
  // window. Older VS Code / web fall back to leaving it in-place.
  try {
    // Defer a tick so the panel is fully created before the move.
    setTimeout(() => {
      vscode.commands.executeCommand('workbench.action.moveEditorToNewWindow');
    }, 50);
  } catch {
    /* leave in current window */
  }
}
