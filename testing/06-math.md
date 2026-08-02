# 06 — Math (KaTeX)

muya is booted with `math: true`, so this file exercises the KaTeX renderer.
Use `$…$` for inline and `$$…$$` (or a `math` fence) for block math.

## Inline math

This is inline math: $E = mc^2$.

Inline with fractions: $\frac{a}{b}$ and greek $\alpha + \beta = \pi$.

Inline with more structure: $x^2 + y^2 = z^2$.

---

## Block / display math

A display equation on its own line:

$$E = mc^2$$

Another (aligned):

$$
\begin{aligned}
a &= b + c \\
d &= e + f
\end{aligned}
$$

Inline-style written as block:

$$ \int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2} $$

---

## Fenced `math` code block

```math
E = mc^2
```

Matrix:

```math
\begin{pmatrix}
1 & 2 \\
3 & 4
\end{pmatrix}
```

---

## Super / subscript (text-level, not math)

- Superscript: E=mc^2^
- Subscript: H~2~O
- Mixed: x^10^ and CO~2~

Note: these are markdown super/subscript, independent of KaTeX.
