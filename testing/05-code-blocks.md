# 05 — Code Blocks

## Fenced code with language

```js
function greeting(name) {
  return `Hello, ${name}!`;
}
console.log(greeting('world'));
```

```python
def fib(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a
print(fib(10))
```

```bash
#!/usr/bin/env bash
for f in *.md; do
  echo "Processing $f"
done
```

```json
{
  "name": "marktext-vscode",
  "version": "0.5.5",
  "enabled": true
}
```

```html
<div class="wrapper">
  <p>Hello <strong>world</strong></p>
</div>
```

```css
.editor {
  background: transparent;
  border-radius: 8px;
}
```

## Fenced code WITHOUT a language (no highlight)

```
var greeting = 'Hello world!';
console.log(greeting);
```

## Line numbers

muya is booted with `codeBlockLineNumbers: true`. Multiline fenced blocks
should show line numbers in the gutter.

```js
const a = 1;
const b = 2;
const c = 3;
const d = 4;
```

## Indented (4-space) code block

    var greeting = 'Hello world!';
    console.log(greeting);

## Inline code

Use the `String.prototype.trim()` method, or `` `.map()` `` with backticks
inside.

## Code with special characters (should not be interpreted)

```md
# This is not a real heading
**not bold**, `not inline`, [not a link](not-a-url)
```

## Empty-ish fenced block

```
```

## Rust / exotic language (Prism may fall back to plain)

```rust
fn main() {
    println!("Hello, world!");
}
```
