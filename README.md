# MarkText Editor for VS Code

A VS Code extension that embeds MarkText's WYSIWYG Markdown editor engine
(`@muyajs/core` / **muya**) inside a `WebviewPanel`, bound two-way to the
active `.md` document.

## Architecture

```
marktext (upstream clone, /home/ftr/Apps/marktext)
  packages/muya            -> @muyajs/core  (browser-native WYSIWYG engine)
       lib/ (built)         <- vendored + bundled into this extension's webview

marktext-vscode (this extension)
  src/extension.ts         Extension host (Node side)
  webview/src/main.ts      Webview entry (browser side, bundled to out/webview/main.js)
  out/extension.js         Compiled host
  out/webview/main.js      Self-contained IIFE: muya + UI plugins + message protocol
```

### Why bundling instead of the npm package

MarkText is an Electron app. Its editor engine, `@muyajs/core` (`packages/muya`),
is a framework-free browser engine (contenteditable + snabbdom VDOM, no Electron
imports). That is the embeddable piece. The full Electron shell is **not** used.

The prebuilt muya ES bundle (`packages/muya/lib/es/index.js`) imports its icon
assets as raw `.png` ES modules (`import x from "../assets/icons/….png"`). A VS
Code webview cannot resolve raw file `import`s, so we **re-bundle the engine
through esbuild** with asset loaders that inline every `.png/.svg/.woff/.woff2/
.ttf/.css` as a data URL. The result is one self-contained `main.js` (IIFE) with
no runtime file loads — verified to execute in jsdom.

### Message protocol (host <-> webview)

- `host -> webview`: `init { markdown, theme, uri }`, `setMarkdown { markdown }`,
  `theme { theme }`, `workspaceImage { requestId, path }`
- `webview -> host`: `ready`, `change { markdown }`, `openExternal { href }`,
  `requestWorkspaceImage { requestId }`

`json-change` in the webview is debounced (300 ms) and posts `change` back to the
host, which writes it to the open `.md` document via `WorkspaceEdit`. External
edits to the document (typing in the text editor) are forwarded back into the
webview via `setMarkdown`. A guard (`applyingFromWebview`) prevents echo loops.

## Build

```
# from /home/ftr/Apps/marktext, build the engine first (once):
pnpm -C packages/muya build      # emits packages/muya/lib/{es,umd,cjs,types}

# from /home/ftr/Apps/marktext-vscode:
npm install
npm run build                    # host (esbuild) + webview (esbuild, assets inlined)
npx vsce package --allow-missing-repository
```

`tsconfig.json` maps the bare `muya-core` specifier to the prebuilt bundle's type
declarations so `tsc` checks the webview against the engine's real API.

## Usage

Open a `.md` file, then run **MarkText: Open WYSIWYG Editor** (editor title bar
or explorer context menu). Edits sync both ways. Image insertion opens a native
file dialog (host side) because the webview has no filesystem access.

## Known limitations (scaffold, not production)

- One panel at a time (`activePanel`); reopening rebinds to the newly active doc.
- Theme switching destroys + reboots the editor (acceptable for now; `setOptions`
  could do a softer switch once verified).
- 11 MB webview bundle (muya + mermaid/katex/prism). Could be code-split later.
- No save-on-close sequencing beyond VS Code's normal document save; the host
  does not auto-save the `.md` on panel dispose.
- `workspace` trust / restricted mode and CSP are not yet hardened.
