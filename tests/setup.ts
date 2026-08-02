// Shared setup for vitest jsdom tests.
// Ensure browser-ish globals the muya bundle touches are present.

// jsdom environment sets window/document/navigator already.
// Stub the VS Code acquireVsCodeApi the webview expects.
import { vi } from 'vitest';

if (typeof window !== 'undefined' && !(window as any).acquireVsCodeApi) {
  (window as any).acquireVsCodeApi = () => ({
    postMessage: (msg: unknown) => {
      (window as any).__posted = (window as any).__posted || [];
      (window as any).__posted.push(msg);
    },
    getState: () => ({}),
    setState: () => {},
  });
}

// Silence the expected console noise from the bundle during tests unless DEBUG.
if (!process.env.DEBUG) {
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  // Keep errors visible (they usually indicate a real failure).
}
