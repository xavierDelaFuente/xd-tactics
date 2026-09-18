# PROJECT — xd-tactics

**Type**: app (multi-process: web + api + worker)
**Status**: Phase 1 of 7 — in progress (1.1–1.3 done, 1.4 half done)
**Repo**: https://github.com/xavierDelaFuente/xd-tactics
**Local**: C:\Users\xixar\Repos\2026\xd-tactics

TFT statistics explorer, plus an itemization coach. The explorer earns the infrastructure;
the coach is the reason the product exists.

## Stack

TypeScript strict · pnpm workspaces · Vite + React 19 (web) · Fastify (api) · Node (worker) ·
Postgres 18 + Kysely (typed SQL, not an ORM) · Docker Compose (local Postgres) · Tailwind (app
default per CODEX, not yet applied — everything is unstyled so far) · Biome (lint + format) ·
Vitest + Testing Library + Testcontainers + Playwright · Changesets (private-package versioning,
`privatePackages.version: true` — every package here is private) · GitHub Actions · consumes
`@asnewyla/*` from xd-components.

```
apps/web  apps/api  apps/worker      ← deployable, never published
packages/domain                      ← pure logic, zero I/O, where the tests live
packages/contracts                   ← zod schemas shared by api + web
packages/db                          ← Kysely + pg, the only package that touches Postgres
```

## Architecture Decisions

| Decision | Choice | Why |
|---|---|---|
| Data source | Riot API directly, own ingestion + storage | First-party, no ToS risk, no inherited bugs |
| API key tier | Development key now; Personal key at Phase 2 | Non-commercial learning project. Correctness is proven by fixtures, not volume; the dev key's 24h expiry only bites once the worker runs unattended. Production key is out of scope |
| Set data source | Community Dragon | Data Dragon lags on TFT; CDragon carries ability variables — the coach's whole knowledge base |
| Workspace shape | One workspace, `apps/` + `packages/` | Three runtimes sharing domain types. Now CODEX Part 2, Structure (deployable-units tree) |
| Aggregation | Precomputed rollups, not query-time scans | The grid cannot scan fact rows per request |
| Raw storage | Immutable raw match jsonb | Extraction logic will be wrong once; reprocessing must not mean re-fetching |
| LLM grounding | Model never computes, never recalls | See `docs/LLM_GROUNDING.md` |
| Testing | Pyramid, one Playwright flow per feature | Per CODEX 2.1 E2E budget |
| Lint + format | Biome, not ESLint + Prettier | One fast tool, native TS/JSX; type-aware lint left to `tsc` strict. Now CODEX Part 2, Lint and format |
| Explorer layout | Grid + inspector panel (wireframe 1d) | The inspector is where the coach lives natively rather than as a bolted-on page. Spec: `docs/EXPLORER_UI.md` |
| DB toolchain | Kysely + `pg`, not Drizzle/Prisma/raw SQL | Typed query builder, no magic query generation, no second migration tool — matches "parse, don't cast" better than an ORM |
| DB package boundary | `packages/db` (I/O), separate from `packages/domain` (zero I/O) | Domain's zero-I/O rule is real; a Postgres client doesn't belong there. `getUnit`/`syncUnitsForPatch` live in db, re-validate through domain's `parseUnit` on the way out |
| Static reads before Postgres | `apps/api` serves units/items/traits from a frozen JSON mock (real adapter output, not fake data) instead of a DB | Deliberate scope cut to get the web app rendering real CDragon data end-to-end without waiting on Postgres/Testcontainers setup. `packages/db` now exists and is fully tested (Testcontainers) but **is not yet wired into `apps/api`** — swapping `setData.ts`'s `loadUnits()` for `getUnit`/patch-aware reads is the remaining half of Phase 1.4 |

## Constraints

- **Non-commercial, learning-first.** No users, no revenue, no production key. Decisions optimise
  for what teaches and what stays correct, not for scale.
- Rate limits cap sample sizes hard — the UI must be honest about `n` from the first row it
  renders, and the numbers will be thin for a long time. That is expected, not a defect.
- Crawl narrow: one region, one bracket, recent matches. Deep enough to exercise the pipeline,
  small enough that a full reprocess takes seconds while extraction logic is still changing.
- Every stat, tooltip value and recommendation is patch-scoped. A number without its patch
  is noise.
- Solo developer, learning-first pace: one TDD cycle at a time, per the Session Protocol.

## Phases

- [x] 0 — Walking skeleton: workspace, CI gate, one endpoint, one grid row, one green E2E
- [ ] 1 — Set data: CDragon sync, patch-versioned units/spells/items/traits
- [ ] 2 — Ingestion: rate limiter, Riot client, resumable cursors, raw store
- [ ] 3 — Facts & rollups: extraction, aggregates, golden-file suite
- [ ] 4 — Explorer v1: unit / item / trait pivots, avg place · top4 · win, sample guards
- [ ] 5 — Explorer v2: unit+item pivot, delta vs baseline, patch trend
- [ ] 6 — Coach: itemization — effect catalogue, combat calculator, tools, citations, evals
- [ ] 7 — Coach: positioning & counters

## Current State

**Done**:
- **Phase 0** — walking skeleton, merged to `main`.
- **1.1 Unit schema** — `packages/domain`'s `unitSchema`/`parseUnit` (revised once against real
  CDragon data: added `name`, fixed `ability.variables` to be star-indexed arrays not a flat map).
- **1.2 CDragon adapter** — `apps/worker/src/static/cdragonAdapter.ts`, fixture-backed
  (`fixtures/cdragon-set18.sample.json`, a real recorded-and-trimmed CDragon payload, not
  fabricated), handles real messy data (unreleased units/items, malformed trait tiers).
- **1.3 Patch versioning** — `packages/db`: Kysely migration for `set_data_units` keyed by
  `(patch, api_name)`, `syncUnitsForPatch` (idempotent upsert), `getUnit(apiName, patch)`
  (patch-scoped read, re-validated through `parseUnit`). All Testcontainers-backed, real
  Postgres per test run. Postgres also runs locally via `docker-compose.yml` (Postgres 18 —
  note its data-dir convention changed from `/var/lib/postgresql/data` to `/var/lib/postgresql`).
- **1.4, domain half** — `resolveAbilityVariables(variables, starLevel)`: 1-indexed star level,
  clamps both ends (a `starLevel <= 0` bug from `Array.prototype.at()`'s negative-index
  wraparound was caught in review and fixed before merge).
- Web app has four unstyled tables stacked on one page (Explorer/Units/Items/Traits) reading
  from `apps/api`'s static mock (see Architecture Decisions — this predates `packages/db` and
  hasn't been swapped over yet).
- Changesets added (by a separate PR); `.changeset/config.json` needed
  `privatePackages: { version: true, tag: false }` since every package here is private —
  without it, `changeset status`/`add` silently found nothing to version.

**In progress**: Phase 1.4, the wiring half.
**Next**: swap `apps/api/src/static/setData.ts`'s `loadUnits()`/`getUnitByApiName()` for real
`packages/db` reads (`getUnit(db, apiName, patch)`), thread a `patch` query param through the
route, and call `resolveAbilityVariables` before returning a unit. `apps/api` will need a real
`Kysely` instance (connection string from env, not yet defined) instead of reading JSON.

**Workflow note**: from this phase on, the mentor writes the failing test and explains the
why; the developer writes the implementation. Verified in-session, not just handed over blind —
every guided snippet gets run against the real test (Testcontainers/Docker included) before
being given as guidance, and code the developer writes gets reviewed for bugs/coverage gaps
before moving on (see: the `starLevel <= 0` catch above).

**Environment notes**:
- This machine's IPv6 is black-holed; Playwright's browser downloader forces IPv6-first and
  hangs. Browsers were installed by fetching the zips over IPv4 with curl into
  `%LOCALAPPDATA%\ms-playwright\`. CI (Linux) is unaffected. If `playwright install` hangs again
  after a version bump, do the same manual fetch.
- Docker Desktop needed WSL2 (Windows Home has no Hyper-V backend option) — `wsl --install` +
  reboot, then Docker Desktop installs and starts cleanly.
- `tsc -b`'s composite/declaration-emit mode will refuse to infer a function's return type if it
  bottoms out in a *transitive* dependency's type (e.g. `testcontainers`'s `StoppedTestContainer`
  via `@testcontainers/postgresql`) — `TS2742`, "cannot be named without a reference". Fix is
  always the same shape: make the wrapper `async` and `await` internally so its own declared
  return type is simple (`void`, or your own interface), not the library's exact type.

## Open Questions

1. Which rank brackets and regions define the v1 data set? (Diamond+ proposed)
2. When does the dev key's 24h expiry start costing real time? That is the trigger for the
   Personal key application, not a date.
3. Hosting — is this ever deployed, or is local-only enough for now? Affects nothing before
   Phase 4.
4. Who authors the effect catalogue entries for a new set, and how fast must it turn around
   on patch day? This is the coach's maintenance cost and it is not zero.
5. Does xd-tactics consume `@asnewyla/*` components, or is the grid too specialised?

Deferred by decision, not oversight: augment and portal pivots, comp clustering, saved views,
and coach positioning/counters (Phase 7). Revisit at the next planning session.

## Reference docs

`docs/ARCHITECTURE.md` — the pipeline and its boundaries
`docs/LLM_GROUNDING.md` — how the coach avoids hallucinating
`BACKLOG.md` — tasks, each with its first failing test
