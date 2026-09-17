import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Playwright owns everything under e2e/; keep Vitest out of it.
    // dist/ is tsc's compiled output (vitest 5's own defaults no longer exclude it) —
    // without this, every *.spec.ts run twice: once as source, once as its own build artifact.
    exclude: [...configDefaults.exclude, '**/e2e/**', '**/dist/**'],
    // Default stays 'node' — domain/api/worker code uses `fileURLToPath(import.meta.url)` for
    // real filesystem reads, which breaks under a jsdom-transformed module graph. Component
    // tests opt into jsdom per file with a `// @vitest-environment jsdom` docblock instead of a
    // blanket environment (Vitest 5's `environmentMatchGlobs` config option is gone; `projects`
    // felt like overkill for one directory of DOM tests).
    setupFiles: ['./apps/web/src/vitest.setup.ts'],
  },
});
