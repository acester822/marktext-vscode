import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.ts'],
    setupFiles: ['tests/setup.ts'],
    // The webview bundle render tests are slow + async-heavy; give them room.
    testTimeout: 20000,
    hookTimeout: 20000,
    // Single-file mode helps when the muya bundle pollutes globals.
    pool: 'threads',
    poolOptions: { threads: { singleThread: false } },
  },
});
