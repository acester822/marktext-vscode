# MarkText Testing Suite — Index

This folder contains **visual test documents** for the MarkText WYSIWYG editor
extension. Open each file in the WYSIWYG editor (`MarkText: Open WYSIWYG
Editor`) and eyeball whether it renders correctly. The goal is a quick,
repeatable sanity check of a feature area after any code change.

The automated unit tests (in `../tests/`, run with `npm test`) cover the pure
logic — theme bridge integrity, Excalidraw block parsing, and the
package.json settings contract. **This folder covers the part automation
can't: how markdown actually parses and renders in the WYSIWYG webview.**

## How to use

1. `npm run build` (or you are already running the extension from `out/`).
2. Open a test file below in the WYSIWYG editor.
3. Work through the features listed under each file and confirm they look right.
4. If anything looks broken, check it isn't a known muya limitation (see
   "Not supported" at the bottom) before filing a bug.

## Test documents

| File                                                         | Feature area             | What to check                                                                                        |
| ------------------------------------------------------------ | ------------------------ | ---------------------------------------------------------------------------------------------------- |
| [01-basics.md](./01-basics.md)                               | Core markdown            | Headings, bold/italic/strike, inline & fenced code, links, images, HR, blockquote, lists, task lists |
| [02-formatting.md](./02-formatting.md)                       | Inline formatting        | Superscript/subscript, emoji, code spans, links, images, strikethrough, gitlab-compat strike         |
| [03-lists-tables.md](./03-lists-tables.md)                   | Lists & tables           | Ordered/unordered/task lists, nested & multi-paragraph items, GFM tables + alignment                 |
| [04-headings.md](./04-headings.md)                           | Headings                 | H1–H6, setext, heading with inline formatting                                                        |
| [05-code-blocks.md](./05-code-blocks.md)                     | Code blocks              | Fenced w/ language, line numbers, indented (4-space) code, inline code, Prism languages              |
| [06-math.md](./06-math.md)                                   | Math (KaTeX)             | Inline `$…$`, block `$$…$$`, `math` fence, super/subscript                                           |
| [07-diagrams.md](./07-diagrams.md)                           | Diagrams                 | mermaid, plantuml, vega-lite, flowchart, sequence (muya's supported set)                             |
| [08-excalidraw.md](./08-excalidraw.md)                       | Excalidraw               | `excalidraw ` block renders inline SVG + Edit button                                                 |
| [09-footnotes-frontmatter.md](./09-footnotes-frontmatter.md) | Footnotes & front matter | YAML front matter, footnotes, task lists                                                             |

## Not supported by this extension (don't expect these)

The editor is powered by the **muya** engine (MarkText). It does **not**
support the following — these are left out of the active test files, but
retained in [./_mpae-reference/](./_mpae-reference/) for historical reference:

- **Code chunk execution** — `js {cmd=true} `, `output=html`, `continue=…`
  (that's a Markdown Preview Aces Edition feature)
- **`@import` file imports**
- **Interactive / selection-driven vega** — only static vega-lite renders
- **`[TOC]` directives**
- **kroki, wavedrom, graphviz/dot/viz, ditaa** diagram types
- **`$$$…$$$`** math delimiters (muya uses `$…$` / `$$…$$`)
- **HTML blocks** render as source, not live HTML

muya's diagram whitelist is exactly: `mermaid`, `plantuml`, `vega-lite`,
`flowchart`, `sequence`. Anything else falls back to a plain code block.
