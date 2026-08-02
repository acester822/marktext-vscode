# MarkText Editor for VS Code

A VS Code extension that embeds MarkText's WYSIWYG Markdown editor engine (`@muyajs/core` / **muya**) inside a
`WebviewPanel`, bound two-way to the active `.md` document.

## Architecture

```
vendor/muya/                 Vendored muya engine (see vendor/muya/README.md)
  lib/es, lib/*.mjs          -> @muyajs/core (browser-native WYSIWYG engine)
  lib/assets, src/**/*.css   <- bundled into this extension's webview

marktext-vscode (this extension)
  src/extension.ts         Extension host (Node side)
  webview/src/main.ts      Webview entry (browser side, bundled to out/webview/main.js)
  out/extension.js         Compiled host
  out/webview/main.js      Self-contained IIFE: muya + UI plugins + message protocol
```

### Why bundling instead of the npm package

The engine is **vendored** into `vendor/muya/` rather than installed from npm. `@muyajs/core@0.2.0` exists on the registry,
but that tarball was published in 2024 and never refreshed while upstream kept committing under the same version: it lacks
the `TableChessboard` export and CSS, and renames the `zhCN` locale export to `zh`. See `vendor/muya/README.md` for the full
rationale and the exact upstream commit.

The prebuilt muya ES bundle (`lib/es/index.js`) imports its icon assets as raw `.png` ES modules
(`import x from "../assets/icons/….png"`). A VS Code webview cannot resolve raw file `import`s, so we **re-bundle the engine
through esbuild** with asset loaders that inline every `.png/.svg/.woff/.woff2/.ttf/.css` as a data URL. The result is one
self-contained `main.js` (IIFE) with no runtime file loads — verified to execute in jsdom.

Because the JS bundle is built with `--loader:.css=empty`, the `import './index.css'` inside each muya UI plugin is
discarded. `webview/src/muya-styles.css` re-imports those stylesheets into a sidecar `out/webview/main.css` that the host
injects into the webview `<head>` — without it the quick-insert (`/`) menu and other popups render as unstyled blocks at the
bottom of the document instead of floating elements.

### Message protocol (host <-> webview)

- `host -> webview`: `init { markdown, theme, uri }`, `setMarkdown { markdown }`,
  `theme { theme }`, `workspaceImage { requestId, path }`
- `webview -> host`: `ready`, `change { markdown }`, `openExternal { href }`,
  `requestWorkspaceImage { requestId }`

`json-change` in the webview is debounced (300 ms) and posts `change` back to the host, which writes it to the open `.md`
document via `WorkspaceEdit`. External edits to the document (typing in the text editor) are forwarded back into the webview
via `setMarkdown`. A guard (`applyingFromWebview`) prevents echo loops.

## Build

The vendored engine is committed, so no MarkText checkout is required:

```
npm install
npm run build                    # host (esbuild) + webview (esbuild, assets inlined)
npx vsce package --allow-missing-repository
```

To refresh the vendored engine from a MarkText checkout (rarely needed):

```
pnpm -C packages/muya build      # in the marktext repo, emits lib/{es,umd,cjs,types}
MARKTEXT_PATH=/path/to/marktext npm run vendor:muya
```

`tsconfig.json` maps the bare `@muyajs/core` specifier to the vendored bundle's type declarations so `tsc` checks the webview
against the engine's real API.

## License

MIT. Bundles MarkText's muya engine, also MIT — see `vendor/muya/LICENSE`.

## Usage

Open a `.md` file, then run **MarkText: Open WYSIWYG Editor** (editor title bar or explorer context menu). Edits sync both
ways. Image insertion opens a native file dialog (host side) because the webview has no filesystem access.

## Known limitations (scaffold, not production)

- One panel at a time (`activePanel`); reopening rebinds to the newly active doc.
- Theme switching destroys + reboots the editor (acceptable for now; `setOptions`
  could do a softer switch once verified).
- 11 MB webview bundle (muya + mermaid/katex/prism). Could be code-split later.
- No save-on-close sequencing beyond VS Code's normal document save; the host
  does not auto-save the `.md` on panel dispose.
- `workspace` trust / restricted mode and CSP are not yet hardened.

## Excalidraw diagrams

A fenced `excalidraw` code block renders inline as an SVG in the WYSIWYG view. Because muya has no built-in `excalidraw`
diagram type, detection is done in the webview by reading the block's language label — no muya fork changes required.

```excalidraw
{
  "type": "excalidraw",
  "version": 2,
  "source": "https://coder.ftr10.dev",
  "elements": [
    {
      "type": "rectangle",
      "id": "a",
      "x": 82,
      "y": 35,
      "width": 100,
      "height": 60,
      "version": 25,
      "versionNonce": 377222254,
      "index": "a0",
      "isDeleted": false,
      "fillStyle": "solid",
      "strokeWidth": 2,
      "strokeStyle": "solid",
      "roughness": 1,
      "opacity": 100,
      "angle": 0,
      "strokeColor": "#1e1e1e",
      "backgroundColor": "transparent",
      "seed": 1,
      "groupIds": [],
      "frameId": null,
      "roundness": null,
      "boundElements": [],
      "updated": 1785697243382,
      "link": null,
      "locked": false
    },
    {
      "id": "hvXwgMco63wJb53TaC4wq",
      "type": "diamond",
      "x": 355,
      "y": 28,
      "width": 170,
      "height": 144,
      "angle": 0,
      "strokeColor": "#1e1e1e",
      "backgroundColor": "transparent",
      "fillStyle": "solid",
      "strokeWidth": 2,
      "strokeStyle": "solid",
      "roughness": 1,
      "opacity": 100,
      "groupIds": [],
      "frameId": null,
      "index": "a1",
      "roundness": {
        "type": 2
      },
      "seed": 1178783666,
      "version": 56,
      "versionNonce": 1646613042,
      "isDeleted": false,
      "boundElements": [
        {
          "id": "10LbZ3rCeKUj3rYA-LeJX",
          "type": "arrow"
        }
      ],
      "updated": 1785697258447,
      "link": null,
      "locked": false
    },
    {
      "id": "10LbZ3rCeKUj3rYA-LeJX",
      "type": "arrow",
      "x": 210,
      "y": 63,
      "width": 157,
      "height": 3,
      "angle": 0,
      "strokeColor": "#1e1e1e",
      "backgroundColor": "transparent",
      "fillStyle": "solid",
      "strokeWidth": 2,
      "strokeStyle": "solid",
      "roughness": 1,
      "opacity": 100,
      "groupIds": [],
      "frameId": null,
      "index": "a2",
      "roundness": {
        "type": 2
      },
      "seed": 2012834866,
      "version": 78,
      "versionNonce": 887107698,
      "isDeleted": false,
      "boundElements": null,
      "updated": 1785697258447,
      "link": null,
      "locked": false,
      "points": [
        [
          0,
          0
        ],
        [
          157,
          -3
        ]
      ],
      "lastCommittedPoint": null,
      "startBinding": null,
      "endBinding": {
        "elementId": "hvXwgMco63wJb53TaC4wq",
        "focus": 0.5749292285916491,
        "gap": 23.491836980430616
      },
      "startArrowhead": null,
      "endArrowhead": "arrow",
      "elbowed": false
    },
    {
      "id": "bGy7exxGGB5RMoHYoZ-ir",
      "type": "text",
      "x": 204,
      "y": 14,
      "width": 151.33987426757812,
      "height": 25,
      "angle": 0,
      "strokeColor": "#1e1e1e",
      "backgroundColor": "transparent",
      "fillStyle": "solid",
      "strokeWidth": 2,
      "strokeStyle": "solid",
      "roughness": 1,
      "opacity": 100,
      "groupIds": [],
      "frameId": null,
      "index": "a3",
      "roundness": null,
      "seed": 71775278,
      "version": 45,
      "versionNonce": 1701498866,
      "isDeleted": false,
      "boundElements": null,
      "updated": 1785697273648,
      "link": null,
      "locked": false,
      "text": "Real Excalidraw",
      "fontSize": 20,
      "fontFamily": 5,
      "textAlign": "left",
      "verticalAlign": "top",
      "containerId": null,
      "originalText": "Real Excalidraw",
      "autoResize": true,
      "lineHeight": 1.25
    }
  ],
  "appState": {
    "gridSize": 20,
    "gridStep": 5,
    "gridModeEnabled": false,
    "viewBackgroundColor": "#ffffff"
  },
  "files": {}
}
```

Each rendered diagram shows an **Edit diagram** button (top-right). Clicking it opens a standalone Excalidraw editor in a new
VS Code window. Edits autosave back into the ` ```excalidraw
` block of the source `.md` (debounced ~1s) and the inline SVG refreshes. No inline editing is added — the editor is always external.
