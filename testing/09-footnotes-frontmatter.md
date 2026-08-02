---
title: Footnotes & Front Matter Test
date: 2026-08-02
tags: [marktext, testing, footnotes]
draft: false
---

# 09 — Footnotes & Front Matter

## YAML front matter

muya is booted with `frontMatter: true`. The YAML block at the top of this
file should render as a metadata field, **not** as a code block or heading.

---

## Footnotes

muya is booted with `footnote: true`. This sentence has a footnote reference.[^1]

A second one[^longnote] appears here too.

[^1]: This is the first footnote text.

    [^longnote]: Here's one with multiple blocks.

    Subsequent paragraphs are indented to show they belong to the same footnote.

    And another paragraph inside the long note.

Inline footnote: you can also write[^inline] like this.

[^inline]: Inline footnotes are defined at the point of use.

---

## Task lists (reminder)

- [x] Front matter parses
- [x] Footnotes resolve
- [ ] Something still to verify
