/**
 * Tests for the FTR10 theme integration (src/ftr10-theme.ts).
 *
 * The FTR10 bridge is the most extension-specific, change-prone logic in the
 * project: it maps the FTR10 Architect palette tokens (--ftr10-*) onto the CSS
 * variables muya's stylesheets actually consume. If a token is renamed or a
 * mapping dropped, the editor silently loses its theming. These tests pin that
 * contract so future changes can't break it unnoticed.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fs + os BEFORE importing the module under test. The source imports the
// bare 'fs' specifier, so mock that (not 'node:fs') to be certain it applies.
vi.mock('fs', () => {
  const actual = vi.importActual('fs');
  return {
    ...(actual as object),
    constants: { R_OK: 4 },
    readFileSync: vi.fn(),
    accessSync: vi.fn(),
    watch: vi.fn(() => ({ close: vi.fn() })),
  };
});
vi.mock('os', () => ({ homedir: () => '/home/fakeuser' }));

import * as fs from 'fs';
import {
  FTR10_COLORS_CSS_PATH,
  readFtr10ColorsCss,
  isFtr10Present,
  buildFtr10Css,
  FTR10_MUYA_BRIDGE_CSS,
  watchFtr10Theme,
} from '../src/ftr10-theme';
import { FTR10_FALLBACK_COLORS_CSS } from '../src/ftr10-default-colors';

const mockedRead = vi.mocked(fs.readFileSync);
const mockedAccess = vi.mocked(fs.accessSync);
const mockedWatch = vi.mocked(fs.watch);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('FTR10_COLORS_CSS_PATH', () => {
  it('points into ~/.ftr10/css.files/', () => {
    expect(FTR10_COLORS_CSS_PATH).toBe('/home/fakeuser/.ftr10/css.files/colors.css');
  });
});

describe('readFtr10ColorsCss', () => {
  it('returns the live file contents when present', () => {
    mockedRead.mockReturnValue('/* live */\n--ftr10-accent-1: #123456;\n');
    expect(readFtr10ColorsCss()).toContain('--ftr10-accent-1: #123456');
    expect(mockedRead).toHaveBeenCalledWith(FTR10_COLORS_CSS_PATH, 'utf8');
  });

  it('falls back to the bundled snapshot when the file is missing', () => {
    mockedRead.mockImplementation(() => { throw new Error('ENOENT'); });
    expect(readFtr10ColorsCss()).toBe(FTR10_FALLBACK_COLORS_CSS);
  });

  it('trims the live file', () => {
    mockedRead.mockReturnValue('   --x: 1;\n   \n');
    expect(readFtr10ColorsCss()).toBe('--x: 1;');
  });
});

describe('isFtr10Present', () => {
  it('is true when the file is readable', () => {
    mockedAccess.mockReturnValue(undefined as unknown as void);
    expect(isFtr10Present()).toBe(true);
  });

  it('is false when access throws', () => {
    mockedAccess.mockImplementation(() => { throw new Error('EACCES'); });
    expect(isFtr10Present()).toBe(false);
  });
});

describe('buildFtr10Css', () => {
  it('concatenates live colors + bridge when present', () => {
    mockedRead.mockReturnValue('COLORS');  // returned untrimmed in raw form
    const css = buildFtr10Css();
    expect(css).toContain('COLORS');
    expect(css).toContain(FTR10_MUYA_BRIDGE_CSS);
  });

  it('concatenates fallback + bridge when absent', () => {
    mockedRead.mockImplementation(() => { throw new Error('ENOENT'); });
    const css = buildFtr10Css();
    expect(css).toContain(FTR10_FALLBACK_COLORS_CSS);
    expect(css).toContain(FTR10_MUYA_BRIDGE_CSS);
    expect(css.startsWith(FTR10_FALLBACK_COLORS_CSS)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Contract tests: every --ftr10-* token the bridge references must resolve.
// The bridge uses a var() fallback for each mapping, so even a missing token
// degrades gracefully — but a *silently dead* mapping (fallback === muya's own
// default) means the theming isn't actually being applied. We assert that
// either the token is defined in the fallback palette, or (if it isn't) the
// fallback is a hardcoded literal and not just the muya default.
// ---------------------------------------------------------------------------
describe('FTR10 bridge contract', () => {
  it('bridge defines every muya var it maps, with a fallback', () => {
    const cssVars = new Set(
      Array.from(FTR10_FALLBACK_COLORS_CSS.matchAll(/--[\w-]+\s*:/g), (m) => m[0].slice(0, -1).trim()),
    );
    // Tokens referenced inside var(--ftr10-..., fallback) usages.
    const referenced = new Set(
      Array.from(FTR10_MUYA_BRIDGE_CSS.matchAll(/var\((--ftr10-[\w-]+)/g), (m) => m[1]),
    );

    for (const tok of referenced) {
      // Every ftr10 token should be defined in the fallback palette snapshot.
      expect(cssVars.has(tok), `bridge references ${tok} but it is not in the fallback palette`).toBe(true);
    }
  });

  it('every muya target var is mapped (no unknown --editor-* left to muya defaults)', () => {
    // The muya vars we intend to override. If this list grows/changes, update
    // FTR10_MUYA_BRIDGE_CSS accordingly — this test documents the contract.
    const mapped = new Set(
      Array.from(FTR10_MUYA_BRIDGE_CSS.matchAll(/^  (--[\w-]+):/gm), (m) => m[1]),
    );
    const expected = [
      '--editor-color', '--editor-color-80', '--editor-color-50', '--editor-color-30',
      '--editor-color-10', '--editor-color-04', '--editor-bg-color',
      '--theme-color', '--highlight-color', '--selection-color', '--delete-color', '--icon-color',
      '--h1-color', '--h2-color', '--h3-color', '--h4-color', '--h5-color', '--h6-color',
      '--strong-color', '--em-color', '--link-color', '--list-marker-color', '--hr-color',
      '--code-block-bg-color', '--blockquote-text-color', '--blockquote-border-color',
      '--table-border-color', '--input-bg-color',
      '--float-bg-color', '--float-hover-color', '--float-border-color', '--float-shadow',
      '--button-font-color', '--button-bg-color', '--button-border', '--button-bg-color-hover',
      '--button-border-hover', '--button-bg-color-active', '--button-border-active',
      '--button-border-focus',
    ];
    for (const v of expected) {
      expect(mapped.has(v), `bridge should map ${v} (muya var) — check FTR10_MUYA_BRIDGE_CSS`).toBe(true);
    }
  });

  it('the fallback palette is well-formed CSS defining :root', () => {
    expect(FTR10_FALLBACK_COLORS_CSS).toMatch(/:root\s*\{/);
    expect(FTR10_FALLBACK_COLORS_CSS).toContain('--ftr10-accent-1');
    expect(FTR10_FALLBACK_COLORS_CSS).toContain('--ftr10-bg');
  });

  it('every var() usage in the bridge has a fallback argument', () => {
    // A var(--x) with no fallback would silently inherit the unset/default.
    const bareUses = FTR10_MUYA_BRIDGE_CSS.match(/var\(--ftr10-[\w-]+\)/g);
    expect(bareUses ?? []).toEqual([]);
  });
});

describe('watchFtr10Theme', () => {
  it('calls the watcher on a matching file event, debounced', () => {
    vi.useFakeTimers();
    let cb: ((event: string, filename: string) => void) | undefined;
    mockedWatch.mockImplementation(((_dir: unknown, handler: any) => {
      cb = handler;
      return { close: vi.fn() } as unknown as fs.FSWatcher;
    }) as never);

    const onChange = vi.fn();
    const handle = watchFtr10Theme(onChange);
    expect(mockedWatch).toHaveBeenCalled();

    cb!('rename', 'colors.css');
    // Still within debounce window: debounce collapses multiple events.
    cb!('rename', 'colors.css');
    expect(onChange).not.toHaveBeenCalled();
    vi.advanceTimersByTime(160);
    expect(onChange).toHaveBeenCalledTimes(1);

    handle.dispose();
    vi.useRealTimers();
  });

  it('ignores events for other files', () => {
    vi.useFakeTimers();
    let cb: ((_e: string, fn: string) => void) | undefined;
    mockedWatch.mockImplementation(((_dir: unknown, handler: any) => {
      cb = handler;
      return { close: vi.fn() } as unknown as fs.FSWatcher;
    }) as never);

    const onChange = vi.fn();
    watchFtr10Theme(onChange);
    cb!('rename', 'other.css');
    vi.advanceTimersByTime(200);
    expect(onChange).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('tolerates fs.watch throwing (Architect not installed)', () => {
    mockedWatch.mockImplementation(() => { throw new Error('ENOENT'); });
    const handle = watchFtr10Theme(vi.fn());
    expect(handle.dispose).toBeTypeOf('function');
    expect(() => handle.dispose()).not.toThrow();
  });
});
