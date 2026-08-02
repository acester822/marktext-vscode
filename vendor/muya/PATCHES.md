# MarkText muya — Applied Patches (FTR10)

This file records every change we have made to the vendored muya engine in
`vendor/muya/lib/es/index.js`. The vendored engine is overwritten wholesale on
each refresh (`npm run vendor:muya`, see `scripts/vendor-muya.sh`), so **these
changes are NOT preserved by a re-vendor** — this document is how you re-apply
them afterwards.

Use this as a checklist. For each patch: confirm the `FROM` text still exists,
apply the `TO` replacement, then note it was redone.

Current vendored base:
- `COMMIT`: `8f1d0a6253efea9ac33304e45364cc05874522a9` / `v0.20.0-rc.1`
- File patched: `vendor/muya/lib/es/index.js`
- File has real newline + tab indentation (it is *not* single-line minified),
  so exact textual `find & replace` works.

---

## Patch A — Backspace degrades a list bullet before removing it

**Issue:** In a MarkText WYSIWYG list, pressing Backspace with the cursor
collapsed at the start of a list item *always* lifted the item straight out of
the list (removed the bullet), never a "degrade" (unindent to the previous
level). Shift+Tab correctly degraded. Desired: Backspace should first degrade;
only when there is no deeper level to shed should it remove the bullet.

**File:** `vendor/muya/lib/es/index.js`
**Function:** `_handleBackspaceInList` (a method of the `paragraph.content`
block class, `tf`).

### Why this spot

`_handleBackspaceInList` is where a Backspace at the start of a list item is
handled. Its first line pulls up the block parents:
`let e = this.parent, t = e.parent, n = t.parent;` (item, list, list-parent).
Before the "lift the item out" logic we insert a degrade check.

`_getUnindentType()` (defined immediately after this function) returns:
- `null` when the cursor is not collapsed or the item is **not** inside a
  deeper list level → do the normal (remove/lift) behaviour;
- `0` or `1` when the item **can** be unindented → call `_unindentListItem(t)`
  (the exact same path Shift+Tab uses via `tabHandler`, see `_getUnindentType`
  + `_unindentListItem`).

We call `_unindentListItem` directly (not `tabHandler`) because `tabHandler`
starts with `if (e.preventDefault(), !Zt(e)) return;` and `Zt(e)` requires a
real DOM `key` event — a synthetic `shiftKey` object would fail that guard.

### Apply

In the file, find the exact block:

```
_handleBackspaceInList() {
		let e = this.parent, t = e.parent, n = t.parent;
		if (!e.isFirstChild()) return this._handleBackspaceInParagraph();
```

Replace the `let ...parent;` line with the `let` line **plus** the new degrade
guard:

```
_handleBackspaceInList() {
		let e = this.parent, t = e.parent, n = t.parent;
		if (this.isCollapsed && this._getUnindentType() != null) {
			this._unindentListItem(this._getUnindentType());
			return;
		}
		if (!e.isFirstChild()) return this._handleBackspaceInParagraph();
```

### Semantics
- Cursor collapsed & a deeper list level exists → **unindent** (same as
  Shift+Tab), return.
- Otherwise → existing behaviour unchanged (top-level item → remove bullet;
  selection → normal flow).

### Done
- [ ] Re-applied on refresh

---

## Patch B — Vertical arrow navigation preserves the horizontal column

**Issue:** In a long/wrapped document, pressing Arrow Down or Arrow Up from
mid-line snapped the caret to the **start of the next line** (offset 0) or the
**end of the previous line** (`text.length`) instead of landing directly below
/ above where you were editing. Desired: caret lands at the same horizontal
column on the adjacent line.

**File:** `vendor/muya/lib/es/index.js`
**Function:** `arrowHandler` (method of the `paragraph.content` block class).

### Why this spot

`arrowHandler` computes `u` (the target text offset) for Arrow Up / Arrow Down:

- Arrow Up arm: `l = n, u = n.text.length;` → always the **end** of the
  previous line.
- Arrow Down arm: `l && (u = Kt(0, l, e));` → `Kt(0, …)` returns **0** (start)
  for normal lines → always the **start** of the next line.

Neither remembers the caret's existing column. The fix keeps the current
caret offset `i.offset` (the horizontal column) and clamps it to the target
line's length, so it lands at the same column.

### Apply

**(1) Arrow Up.** Find:

```
		if (e.key === j.ArrowUp || e.key === f && i.offset === 0) {
			if (e.preventDefault(), e.stopPropagation(), !n) {
				e.key === j.ArrowUp && i.offset !== 0 && this.setCursor(0, 0, !0);
				return;
			}
			l = n, u = n.text.length;
```

Replace the `l = n, u = n.text.length;` line with a column-preserving value:

```
			l = n, u = Math.min(i.offset, n.text.length);
```

**(2) Arrow Down.** Find:

```
		l && (u = Kt(0, l, e));
```

Replace with:

```
		l && (u = Math.min(i.offset, l.text.length));
```

### Semantics
- `i.offset` is the caret's current character offset within this block (from
  `this.getCursor()`), i.e. the column the user is editing at.
- `Math.min(i.offset, target.text.length)` clamps so it never overshoots a
  shorter line (lands at its end instead of past it).
- This is a **character-column** preservation (v1). It is reliable for
  uniform-width lines; for lines with mixed wide/narrow glyphs it is a close
  approximation of "directly below" rather than pixel-perfect. A future v2
  could measure pixel x via `fi.getCursorCoords()` / `hn()` if perfect
  alignment is ever needed.
- When there is no next/previous line, the existing create-empty-paragraph
  and `setCursor(0,0)` branches are unchanged.

### Note on the `Kt(0, l, e)` helper
`Kt(e, t, n)` special-cases `atx-heading` + Arrow Down to return the heading
marker length (skipping the `# ` prefix). Replacing it with the plain column
clamp intentionally drops that special case so the caret lands at the same
column on the line below; if a heading-marker skip is preferred later it can
be reintroduced as `Kt(Math.min(i.offset, l.text.length), l, e)` — verify
behaviour then.

### Done
- [ ] Re-applied on refresh

---

## Re-applying after a vendor refresh

1. Run `npm run vendor:muya` with `MARKTEXT_PATH` set (this overwrites
   `vendor/muya/lib/es/index.js` and clears any applied edits).
2. Open `vendor/muya/PATCHES.md` and work through each **Apply** block:
   - confirm the `FROM` text is present (it will be, if the upstream commit is
     the same base; if upstream changed, adapt the anchor to the new shape
     around `_handleBackspaceInList` / `arrowHandler`).
   - make the replacement.
   - tick the `Done` box.
3. `npm run build` and re-test in the webview (the running extension uses its
   own compiled `out/`).
