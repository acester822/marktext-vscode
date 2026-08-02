# Issues:

## Active:

- [x] Find and Replace does not work, keybind or thru the menu

  - [ ] Followup: None! It is working great!

- [x] In-line code, such as `test` needs to be better distinquished, my theming engine in VS Code is highly advanced, which sometimes make bland elements get lost in the background. Because the background of inline code is simply a translucent gray, in long markdowns it gets missed. I often times use inline code like this to help me find things faster in long files, what I would like is for the background to still be translucent like it is now, but instead make it colored via `--ftr10-accent-2` and make the text `--ftr10-accent-5`. 

  - [ ] Followup: Lookng great! Make the colored border that now shows up have more corner radius please, similar to what checkboxes are using

- [x] New checkboxes, the square needs a little more radius on the corners please, remember, the checkboxes are pretty small, so you cannot see subtle elements there. For when the checkbox is selected, you cannot see  that the box is checked (the hand drawn tick you mentioned) or the filled green sketchy square. Right now the checkbox just shows up as a colored border when it is selected which makes it hard to distinquish vs an unchecked checkbox.

  - [ ] Followup: Looking much better, but selected (marked) checkboxes are still missing their ticks, they are getting a complete color fill now which is good!

## Queued:

- [ ] Cursor behavior needs further refining, if you are going thru a doc in the editor with arrows, the positioning in between lines needs to match up better to the rendered content, aka I navigate down, the cursor should show up the line down right below where I was editing
- [ ] Change VS Code behavior to when a md file is selected, it automatically uses marktext instead of the built-in editor, but add an icon to the titlebar, the same place where it currently says `MarkText: Open WYSIWYG Editor` for when MarkText editor is active, a user can switch to `Classic Editor` aka swap back to the vs code default monaco editor.
