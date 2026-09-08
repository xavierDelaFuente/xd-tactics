# Setup — Phase 0.1

Run in `C:\Users\xixar\Repos\2026\xd-tactics`. The repo is linked to GitHub and empty.

**Versions are deliberately not pinned in this file.** Per the CODEX, a remembered version number
is not a current one — `@latest` resolves it, and `pnpm-lock.yaml` records what you actually got.

## 1. Drop the docs in and commit

```bash
git add .
git commit -m "docs: mentor system, architecture, backlog, explorer spec"
git push -u origin main
```

## 2. Workspace

```bash
pnpm init
# then: pnpm-workspace.yaml, tsconfig.base.json, .gitignore are already in this drop
mkdir -p apps/web apps/api apps/worker packages/domain packages/contracts
```

Root dev dependencies:

```bash
pnpm add -Dw typescript@latest vitest@latest @vitest/coverage-v8@latest \
  eslint@latest typescript-eslint@latest prettier@latest \
  @playwright/test@latest
pnpm exec playwright install --with-deps chromium
```

Root scripts in `package.json`:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:e2e": "playwright test",
    "type-check": "tsc -b --pretty false",
    "lint": "eslint .",
    "build": "pnpm -r build",
    "check": "pnpm type-check && pnpm lint && pnpm test && pnpm build"
  }
}
```

## 3. CI before code

`.github/workflows/ci.yml` is in this drop. Verify the action versions before the first push —
they go stale like any other dependency.

Then, on GitHub → Settings → Branches → add a rule for `main`:

```
Require a pull request before merging · 1 approval
Require branches to be up to date before merging
Required status checks: test · type-check · lint · build
```

A red check blocks merge, including for you.

## 4. The first failing test

**Stop here and hand back.** Task 0.1's test comes before any app code:

> `apps/web/e2e/explorer.spec.ts` — a Playwright test that loads the app and expects to find
> the text "Explorer". It should fail because there is no app yet.

Write that test, run it, confirm the failure message says what you expect, and only then build
the minimum Vite app that makes it pass. That is the first TDD cycle of the project.

## Also needed, not blocking

- Riot developer portal: grab a **development key** for recording fixtures. It expires every 24
  hours, which is fine — you only need it when deliberately capturing data. Apply for a
  **Personal key** at Phase 2, when the worker starts running unattended. No production key;
  this is not a commercial project.
- Postgres locally via Docker; Testcontainers will use the same engine in tests.
