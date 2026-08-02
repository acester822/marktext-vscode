# Issues:

## Active:

- [x] In-line code, such as `test` needs to be better distinquished, my theming engine in VS Code is highly advanced, which sometimes make bland elements get lost in the background. Because the background of inline code is simply a translucent gray, in long markdowns it gets missed. I often times use inline code like this to help me find things faster in long files, what I would like is for the background to still be translucent like it is now, but instead make it colored via `--ftr10-accent-2` and make the text `--ftr10-accent-5`. 

  - [ ] Followup: Looking great! Make the colored border that now shows up have more corner radius please, similar to what checkboxes are using

- [ ] Change VS Code behavior to when a md file is selected, it automatically uses marktext instead of the built-in editor, but add an icon to the titlebar, the same place where it currently says `MarkText: Open WYSIWYG Editor` for when MarkText editor is active, a user can switch to `Classic Editor` aka swap back to the vs code default monaco editor.

## Queued:

- [ ] Cursor behavior needs further refining, if you are going thru a doc in the editor with arrows, the positioning in between lines needs to match up better to the rendered content, aka I navigate down, the cursor should show up the line down right below where I was editing
- [ ] Change VS Code behavior to when a md file is selected, it automatically uses marktext instead of the built-in editor, but add an icon to the titlebar, the same place where it currently says `MarkText: Open WYSIWYG Editor` for when MarkText editor is active, a user can switch to `Classic Editor` aka swap back to the vs code default monaco editor.
- [ ] Degrading: If I try and degrade a bullet, hitting backspace does not work, it removes the bullet, a backspace should signal a bullet degrade if one is available and if not it would then remove the bullet. 
