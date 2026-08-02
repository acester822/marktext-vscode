/**
 * Unit tests for the pure Excalidraw block parsing helpers
 * (webview/src/excalidraw-parse.ts). These are extracted from
 * excalidraw-render.ts so they can be tested without pulling in the multi-MB
 * @excalidraw/excalidraw browser bundle.
 */
import { describe, it, expect } from 'vitest';
import {
  escapeHtml,
  getBlockLang,
  getBlockCode,
  parseScene,
  isDarkThemeFromClassesAndBg,
} from '../webview/src/excalidraw-parse';

// Build a fake muya-rendered <pre class="mu-code-block"> shaped like the real
// DOM: a language-label child + a code-content child.
function makePre(lang: string, code: string, { noLabel = false } = {}): HTMLElement {
  const pre = document.createElement('pre');
  pre.className = 'mu-code-block';
  if (!noLabel) {
    const label = document.createElement('span');
    label.textContent = lang;
    pre.appendChild(label);
  }
  const content = document.createElement('div');
  content.textContent = code;
  pre.appendChild(content);
  return pre;
}

describe('getBlockLang', () => {
  it('detects the excalidraw label', () => {
    const pre = makePre('excalidraw', '{"elements":[]}');
    expect(getBlockLang(pre)).toBe('excalidraw');
  });

  it('lowercases the label', () => {
    expect(getBlockLang(makePre('Excalidraw', 'x'))).toBe('excalidraw');
  });

  it('returns "" when there is no recognizable single-token label', () => {
    // Only one child with multi-line content -> not a label.
    const pre = document.createElement('pre');
    const c = document.createElement('div');
    c.textContent = 'line one\nline two\nline three';
    pre.appendChild(c);
    expect(getBlockLang(pre)).toBe('');
  });
});

describe('getBlockCode', () => {
  it('returns the code child, excluding the label', () => {
    const pre = makePre('excalidraw', '{"elements":[{"type":"rectangle"}]}');
    expect(getBlockCode(pre)).toBe('{"elements":[{"type":"rectangle"}]}');
  });

  it('never includes the label in the code', () => {
    const code = 'not a label\n{"elements":[]}';
    const pre = makePre('excalidraw', code);
    expect(getBlockCode(pre)).not.toContain('excalidraw');
  });

  it('handles a single child by stripping a leading short first line', () => {
    const pre = document.createElement('pre');
    pre.textContent = 'excalidraw\n{"elements":[]}';
    expect(getBlockCode(pre)).toBe('{"elements":[]}');
  });

  it('returns full text when no label line is present', () => {
    const pre = document.createElement('pre');
    pre.textContent = 'long line that is not a label because it is long enough\n{"x":1}';
    // First line is >= 40 chars, so nothing is stripped.
    expect(getBlockCode(pre)).toContain('{"x":1}');
  });
});

describe('parseScene', () => {
  it('parses a bare JSON array as elements', () => {
    const { elements, appState, files } = parseScene('[{"type":"rectangle","id":"a"}]');
    expect(elements).toHaveLength(1);
    expect((elements[0] as { type: string }).type).toBe('rectangle');
    expect(appState).toBeUndefined();
    expect(files).toBeUndefined();
  });

  it('parses an object form', () => {
    const { elements, appState } = parseScene(
      '{"elements":[{"type":"text","id":"t"}],"appState":{"theme":"dark"},"files":{}}',
    );
    expect(elements).toHaveLength(1);
    expect(appState).toEqual({ theme: 'dark' });
  });

  it('strips collaborators from appState', () => {
    const { appState } = parseScene(
      '{"elements":[],"appState":{"collaborators":[{"x":1}],"theme":"light"}}',
    );
    expect(appState).toEqual({ theme: 'light' } as Record<string, unknown>);
  });

  it('defaults elements to [] when missing', () => {
    const { elements } = parseScene('{"appState":{}}');
    expect(elements).toEqual([]);
  });

  it('returns empty on malformed JSON instead of throwing', () => {
    const { elements } = parseScene('{not json');
    expect(elements).toEqual([]);
  });

  it('returns empty on empty input', () => {
    expect(parseScene('').elements).toEqual([]);
  });
});

describe('escapeHtml', () => {
  it('escapes & < >', () => {
    expect(escapeHtml('a & b < c > d')).toBe('a &amp; b &lt; c &gt; d');
  });
  it('leaves plain text alone', () => {
    expect(escapeHtml('hello world')).toBe('hello world');
  });
});

describe('isDarkThemeFromClassesAndBg', () => {
  it('detects vscode-dark class', () => {
    expect(isDarkThemeFromClassesAndBg('vscode-dark', 'rgb(0,0,0)')).toBe(true);
  });
  it('detects high-contrast class', () => {
    expect(isDarkThemeFromClassesAndBg('vscode-high-contrast', 'rgb(255,255,255)')).toBe(true);
  });
  it('uses luminance when no class marker', () => {
    expect(isDarkThemeFromClassesAndBg('', 'rgb(20, 20, 20)')).toBe(true);
    expect(isDarkThemeFromClassesAndBg('', 'rgb(240, 240, 240)')).toBe(false);
  });
  it('falls back to false on transparent bg with no class', () => {
    expect(isDarkThemeFromClassesAndBg('', 'transparent')).toBe(false);
  });
  it('requires a dark theme via explicit class even with light bg', () => {
    // class wins over bg luminance
    expect(isDarkThemeFromClassesAndBg('vscode-dark', 'rgb(255,255,255)')).toBe(true);
  });
});
