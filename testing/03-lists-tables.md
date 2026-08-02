# 03 — Lists & Tables

## Unordered lists

- Red
- Green
- Blue

Asterisks and plus work too:

* One
* Two
+ Alpha
+ Beta

## Ordered lists

1. Bird
2. McHale
3. Parish

Numbers don't need to be sequential (Markdown normalizes them):

3. Foo
4. Bar
5. Baz

## Nested lists

- Level 1 item
  - Level 2 item
    - Level 3 item
  - Back to level 2
- Level 1 item again
1. First top
   1. Nested ordered a
   2. Nested ordered b
2. Second top

## List with multiple paragraphs / blockquote / code

- A list item with two paragraphs.

  Second paragraph of the same item (indented).

- A list item with a blockquote:

  > Quoted inside a list item.

- A list item with a code block:

      <code goes here>

## Task lists

- [x] Write the extension
- [x] Test it
- [ ] Ship it
  - [ ] Nested subtask one
  - [ ] Nested subtask two

---

## Tables

Simple table:

| Name  | Role     |
| ----- | -------- |
| Alice | Engineer |
| Bob   | Designer |

Table with alignment:

| Left | Center | Right |
|:---- |:------:| -----:|
| a    | b      | c     |
| 1    | 2      | 3     |

Table with inline content:

| Feature  | Status | Notes          |
| -------- |:------:| -------------- |
| Math     | ✅      | `$E=mc^2$`     |
| Tables   | ✅      | **works**      |
| Diagrams | ❌      | if unsupported |
