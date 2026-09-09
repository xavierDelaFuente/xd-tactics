import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Playwright owns everything under e2e/; keep Vitest out of it.
    exclude: [...configDefaults.exclude, '**/e2e/**'],
  },
});
