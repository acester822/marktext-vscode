# 08 — Excalidraw

This extension adds an `excalidraw` **language** that muya does not know
(its whitelist is mermaid/plantuml/vega-lite/flowchart/sequence). The webview
decorates ```excalidraw blocks, renders the scene as an inline SVG, and shows
an **Edit diagram** button that opens the standalone Excalidraw editor.

Each block should render as a diagram (not raw JSON) with a top-right
Edit button. Clicking it opens the external editor; edits save back into the
source `.md` and the SVG refreshes.

## Simple rectangle scene (bare array form)

```excalidraw
[{"type":"rectangle","id":"a","x":10,"y":10,"width":120,"height":60,"fillStyle":"solid","strokeWidth":2,"strokeStyle":"solid","roughness":1,"opacity":100,"angle":0,"x1":0,"y1":0,"x2":1,"y2":1,"strokeColor":"#1e1e1e","backgroundColor":"#4caf50","roundness":{"type":3},"version":1,"versionNonce":1,"isDeleted":false,"boundElements":null,"updated":1,"link":null,"locked":false}]
```

## Object form with a couple of elements

```excalidraw
{"type":"excalidraw","version":2,"source":"","elements":[
  {"type":"rectangle","id":"r1","x":20,"y":60,"width":160,"height":90,"angle":0,"strokeColor":"#1971c2","backgroundColor":"#a5d8ff","fillStyle":"solid","strokeWidth":2,"roughness":1,"opacity":100,"roundness":{"type":3},"isDeleted":false,"boundElements":null,"updated":1,"link":null,"locked":false,"version":1,"versionNonce":1},
  {"type":"text","id":"t1","x":40,"y":90,"width":120,"height":30,"angle":0,"strokeColor":"#1e1e1e","backgroundColor":"transparent","fillStyle":"hachure","strokeWidth":1,"roughness":1,"opacity":100,"fontSize":20,"fontFamily":1,"text":"Hello!"  ,"baseline":22,"isDeleted":false,"boundElements":null,"updated":1,"link":null,"locked":false,"version":1,"versionNonce":1}
],"appState":{"theme":"dark"},"files":{}}
```

## Boxes + arrow diagram

```excalidraw
{"type":"excalidraw","version":2,"elements":[
  {"type":"rectangle","id":"in","x":10,"y":30,"width":140,"height":70,"angle":0,"strokeColor":"#2f9e44","backgroundColor":"#b2f2bb","fillStyle":"solid","strokeWidth":2,"roughness":1,"opacity":100,"roundness":{"type":3},"isDeleted":false,"boundElements":[{"type":"arrow","id":"a1"}],"updated":1,"link":null,"locked":false,"version":1,"versionNonce":1},
  {"type":"rectangle","id":"out","x":300,"y":30,"width":140,"height":70,"angle":0,"strokeColor":"#e03131","backgroundColor":"#ffc9c9","fillStyle":"solid","strokeWidth":2,"roughness":1,"opacity":100,"roundness":{"type":3},"isDeleted":false,"boundElements":[{"type":"arrow","id":"a1"}],"updated":1,"link":null,"locked":false,"version":1,"versionNonce":1},
  {"type":"arrow","id":"a1","x":150,"y":65,"width":150,"height":0,"angle":0,"strokeColor":"#1e1e1e","backgroundColor":"transparent","fillStyle":"hachure","strokeWidth":2,"roughness":1,"opacity":100,"endArrowhead":"arrow","startBinding":null,"endBinding":{"elementId":"out","focus":0,"gap":10},"startBinding2":null,"points":[[0,0],[150,0]],"lastCommittedPoint":null,"isDeleted":false,"boundElements":null,"updated":1,"link":null,"locked":false,"version":1,"versionNonce":1}
],"appState":{},"files":{}}
```

---

## Malformed scene (should degrade gracefully, not crash)

This JSON is invalid — the block should render as an error message or stay as
code, but must NOT take down the editor.

```excalidraw
{"elements":[{"type":"rectangle"  // missing close
```

## Empty block (should leave placeholder, not crash)

```excalidraw

```
