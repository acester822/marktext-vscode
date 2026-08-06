# Issues:

## Active:

- [ ] First edit after switching to another file and back does not save (2nd + subsequent edits fine). Root cause: host `setMarkdown` sets the webview's `applyingExternal` flag, but muya's `setContent` never emits `json-change` (it sets state directly), so nothing consumed the flag and the next real edit was silently swallowed. Fix: the flag now suppresses ONLY an exact text echo — any real edit posts. (verify in code-server)
- [ ] Table column toolbar flickers on/off when moving the cursor onto the menu itself. Root cause: toolbar floats just above the header row; our hover handler hid it the moment the cursor left the cell, and the engine's own listener re-showed it 300ms later (its 27px-below predicate). Fix: hover bridge — cursor over the toolbar keeps it shown. (verify in code-server)

## Fixed:

- [x] Text disappearing mid-edit + caret resets while editing (worst in tables): "works great for one edit, then the next time half of what I typed would disappear." Root cause: the disk-sync watcher's content-equality guard is not enough to recognize our own round-trip. If a new webview edit posts between the autosave write and the watcher's debounced read, `lastSynced` moves past the on-disk text; the disk copy (our own stale autosave) no longer matches, so the watcher mistook it for an external change and clobbered the buffer + webview with older text (typed text vanished, `muya.setContent` rebuilt the doc → caret reset). Fix: the watcher now stats the file and only treats a write as external if its mtime is NEWER than the last webview-originated edit (`session.lastEditAt`). Our autosave always lags the edit that caused it → skipped; genuine agent/git/other-editor writes made after the last edit still sync as designed.
- [x] External edits never reach the webview — editing the .md from Monaco or having an agent update the file left the WYSIWYG stale. Root cause: VS Code won't auto-reload a dirty buffer from disk, and every webview edit marks the buffer dirty (applyEdit → autosave), so `onDidChangeTextDocument` never fired for disk writes. Fix: per-session disk watcher that syncs the on-disk text into the buffer + webview when it differs from what we last synced; echo guards are now per-uri so multiple files don't interfere.
- [x] Table toolbar (add/remove/align columns) only appeared when hovering just above the table's top edge — now it also shows automatically whenever the pointer is over the table's header row. The engine's delayed hide is suppressed while hovering.
- [x] Copy/paste erratic: Ctrl+C copied the markdown source (`**bold**`) instead of the rendered selection, and right-click "Copy as Markdown" dumped the ENTIRE .md. Fix: Ctrl+C/X now copy the rendered selection (plain + rich HTML, markdown syntax markers stripped); "Copy Selection as Markdown/HTML" are selection-scoped; Paste uses muya's pasteAsPlainText instead of the unreliable execCommand('paste').
- [x] Wide tables were cut off at the 1000px (125ch) column. New setting `marktext.editor.tableMaxWidth` (default 1800px; 0 = old behavior) lets tables break out of the column and recenter in the webview (fixed ~200px gap each side), so a 2200px webview gets ~1800px of table.
- [x] Add a max width of 125 characters then wrap and if the webview is wider, center the content in the webview, please note, I still want the alignment of the content itself to be left aligned like normal. Hopefully that makes sense.

  - [x] Make sure that tables and fenced items also follow this restriction

- [x] Image insertion does not appear to work, the image menu pops up, and all clicks inside the menu appear to work, it just doesn't do anything. Adding a local image does correctly launch the "pick the file" within Codeserver like it should, but when I find and select the image nothing happens, here is an example

  - ![Pic Of Something](assets/menu-icon-light.png) `Internal Link`

  - ![Pic Of Something 2](https://github.com/acester822/marktext-vscode/blob/32fa54b319e6df6c99d0ebe2e4b3c2ec874b5266/assets/menu-icon-dark.png?raw=true) `External Link`

- [x] Local links not working, for example, [05-code-blocks.md](./05-code-blocks.md), when I hover over it I see the little menu pop up underneath it, one icon to unlink, one icon to follow the link, but clicking on the follow button does not work
- [x] Cursor behavior needs further refining, if you are going thru a doc in the editor with arrows, the positioning in between lines needs to match up better to the rendered content, aka I navigate down, the cursor should show up the line down right below where I was editing
- [x] Degrading: If I try and degrade a bullet, hitting backspace does not work, it removes the bullet, a backspace should signal a bullet degrade if one is available and if not it would then remove the bullet. Using shift + tab did work to degrade as an FYI
