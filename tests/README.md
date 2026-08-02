# Automated Tests

Run the automated unit tests with:

```bash
npm test          # one-shot
npm run test:watch   # watch mode
```

The test runner is **vitest** (jsdom environment). Tests live in `tests/` and
cover the pure, non-visual logic of the extension — the parts that would
otherwise only break at runtime in a user's editor.

> Note: the *visual* side (how markdown actually renders in the WYSIWYG
> webview) cannot be meaningfully automated here — muya needs a full browser
> (canvas etc.) — so that's covered by the hand-inspection documents in
> [`../testing/`](../testing/). See `../testing/00-INDEX.md`.

## What's covered

| File | What it guards |
|------|----------------|
| `ftr10-theme.test.ts` | The FTR10 → muya CSS bridge contract: every `--ftr10-*` token the bridge references exists in the fallback palette; every muya var is mapped; every `var()` has a fallback; the fallback palette is well-formed; `readFtr10ColorsCss` / `isFtr10Present` fallback behaviour; `watchFtr10Theme` debounce + error tolerance. |
| `excalidraw-parse.test.ts` | The extracted pure helpers: block-language detection, block-code extraction (never including the label), scene JSON parsing (array/object/malformed/collaborator-strip), HTML escaping, dark-theme detection. |
| `package-contract.test.ts` | `package.json` `contributes` surface: the `marktext.editor.defaultForMarkdown` opt-in setting stays default-false; every registered command is declared (and none are orphaned); the custom-editor selector and activation events stay in sync with `extension.ts`. |

## Adding a test

- Add a new `.test.ts` under `tests/`; the include glob picks it up.
- For the theme tests, mock the bare `'fs'` module (the source imports `'fs'`,
  not `'node:fs'`) and `'os'`.
- The webview bundle render approach was tried and abandoned: driving
  `out/webview/main.js` under jsdom fails because muya requires native
  `HTMLCanvasElement` (not installed). Don't resurrect it without that.

## Keeping the contract tests honest

The theme contract test asserts that every token the bridge references is
defined in `src/ftr10-default-colors.ts`. If you add a new `--ftr10-*` mapping
to `FTR10_MUYA_BRIDGE_CSS`, either
1. add the token to the fallback palette (`src/ftr10-default-colors.ts`), **and**
2. add the token the fallback snapshot (`~/.ftr10/css.files/colors.css` if you
   maintain it), so the live + fallback palettes stay in agreement.

The package-contract tests are intentionally strict: they will fail loudly if
you remove a command from code but leave it in `package.json` (or vice-versa),
or if a setting's default ever drifts from the opt-in `false`.
