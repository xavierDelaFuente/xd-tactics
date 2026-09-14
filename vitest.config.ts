import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Playwright owns everything under e2e/; keep Vitest out of it.
    // dist/ is tsc's compiled output (vitest 5's own defaults no longer exclude it) —
    // without this, every *.spec.ts run twice: once as source, once as its own build artifact.
    exclude: [...configDefaults.exclude, '**/e2e/**', '**/dist/**'],
  },
});
