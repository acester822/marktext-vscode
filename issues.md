There are issues with the autosave, this edit made it much worse, revert the auto save changed you made in the last turn please and try again, right now I make an edit, it saves correctly, but the editor reverts the save, then the save itself reverts but the editor shows it as good. And the cursor still resets to the upper right. 

For the right click menu it will need some work, I want it to contain more or less the entire menu from marktext:

Structure:
Edit Menu > See ## Edit menu#
Paragraph Menu > See ## Paragraph menu#
Format Menu > See ## Format menu#
----
Undo
Redo
----
Copy Ctrl+C
Paste Ctrl+V
Cut Ctrl+X
----
Copy As Rich Text
Copy As HTML
Paste as Plain Text
----


# Right Click Submenus:
## Edit menu#
Id	Default	Description
edit.undo	Ctrl+Z	Undo last operation
edit.redo	Ctrl+Shift+Z	Redo last operation
edit.cut	Ctrl+X	Cut selected text
edit.copy	Ctrl+C	Copy selected text
edit.paste	Ctrl+V	Paste text
edit.copy-as-rich	Ctrl+Shift+C	Copy selected text as markdown
edit.copy-as-html	-	Copy selected text as html
edit.paste-as-plaintext	Ctrl+Shift+V	Copy selected text as plaintext
edit.select-all	Ctrl+A	Select all text of the document
edit.duplicate	Ctrl+Alt+P	Duplicate the current paragraph
edit.create-paragraph	Ctrl+Shift+N	Create a new paragraph after the current one
edit.delete-paragraph	Ctrl+Shift+D	Delete current paragraph
edit.find	Ctrl+F	Find information in the document
edit.find-next	F3	Continue the search and find the next match
edit.find-previous	Shift+F3	Continue the search and find the previous match
edit.replace	Ctrl+R	Replace the information with a replacement
edit.find-in-folder	Ctrl+Shift+F	Find files contain the keyword in opend folder

## Paragraph menu#
Id	Default	Description
paragraph.heading-1	Ctrl+Shift+1	Set line as heading 1
paragraph.heading-2	Ctrl+Shift+2	Set line as heading 2
paragraph.heading-3	Ctrl+Shift+3	Set line as heading 3
paragraph.heading-4	Ctrl+Shift+4	Set line as heading 4
paragraph.heading-5	Ctrl+Shift+5	Set line as heading 5
paragraph.heading-6	Ctrl+Shift+6	Set line as heading 6
paragraph.upgrade-heading	Ctrl+Plus	Upgrade a heading
paragraph.degrade-heading	Ctrl+-	Degrade a heading
paragraph.table	Ctrl+Shift+T	Insert a table
paragraph.code-fence	Ctrl+Shift+K	Insert a code block
paragraph.quote-block	Ctrl+Shift+Q	Insert a quote block
paragraph.math-formula	Ctrl+Alt+N	Insert a math block
paragraph.html-block	Ctrl+Alt+H	Insert a HTML block
paragraph.order-list	Ctrl+G	Insert a ordered list
paragraph.bullet-list	Ctrl+H	Insert a unordered list
paragraph.task-list	Ctrl+Alt+X	Insert a task list
paragraph.loose-list-item	Ctrl+Alt+L	Convert a list item to a loose list item
paragraph.paragraph	Ctrl+Shift+0	Convert a heading to a paragraph
paragraph.horizontal-line	Ctrl+Shift+U	Add a horizontal line
paragraph.front-matter	Ctrl+Alt+Y	Insert a YAML frontmatter block

## Format menu#
Id	Default	Description
format.strong	Ctrl+B	Set the font of the selected text to bold
format.emphasis	Ctrl+I	Set the font of the selected text to italic
format.underline	Ctrl+U	Change the selected text to underline
format.superscript	-	Change the selected text to underline
format.subscript	-	Change the selected text to underline
format.highlight	Ctrl+Shift+H	Highlight the selected text by tag
format.inline-code	Ctrl+`	Change the selected text to inline code
format.inline-math	Ctrl+Shift+M	Change the selected text to inline math
format.strike	Ctrl+D	Strike through the selected text
format.hyperlink	Ctrl+L	Insert a hyperlink
format.image	Ctrl+Shift+I	Insert a image
format.clear-format	Ctrl+Shift+R	Clear the formatting of the selected text