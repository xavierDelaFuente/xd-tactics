# PROJECT — xd-tactics

**Type**: app (multi-process: web + api + worker)
**Status**: Phase 0 of 7 — not started
**Repo**: https://github.com/xavierDelaFuente/xd-tactics (empty)
**Local**: C:\Users\xixar\Repos\2026\xd-tactics

TFT statistics explorer, plus an itemization coach. The explorer earns the infrastructure;
the coach is the reason the product exists.

## Stack

TypeScript strict · pnpm workspaces · Vite + React (web) · Fastify (api) · Node (worker) ·
Postgres · Tailwind (app default per CODEX) · Vitest + Testing Library + Testcontainers +
Playwright · GitHub Actions · consumes `@asnewyla/*` from xd-components.

```
apps/web  apps/api  apps/worker      ← deployable, never published
packages/domain                      ← pure logic, zero I/O, where the tests live
packages/contracts                   ← zod schemas shared by api + web
```

## Architecture Decisions

| Decision | Choice | Why |
|---|---|---|
| Data source | Riot API directly, own ingestion + storage | First-party, no ToS risk, no inherited bugs |
| API key tier | Development key now; Personal key at Phase 2 | Non-commercial learning project. Correctness is proven by fixtures, not volume; the dev key's 24h expiry only bites once the worker runs unattended. Production key is out of scope |
| Set data source | Community Dragon | Data Dragon lags on TFT; CDragon carries ability variables — the coach's whole knowledge base |
| Workspace shape | One workspace, `apps/` + `packages/` | Three runtimes sharing domain types. CODEX gap, logged in ALTERNATIVES |
| Aggregation | Precomputed rollups, not query-time scans | The grid cannot scan fact rows per request |
| Raw storage | Immutable raw match jsonb | Extraction logic will be wrong once; reprocessing must not mean re-fetching |
| LLM grounding | Model never computes, never recalls | See `docs/LLM_GROUNDING.md` |
| Testing | Pyramid, one Playwright flow per feature | Per CODEX 2.1 E2E budget |
| Explorer layout | Grid + inspector panel (wireframe 1d) | The inspector is where the coach lives natively rather than as a bolted-on page. Spec: `docs/EXPLORER_UI.md` |

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

- [ ] 0 — Walking skeleton: workspace, CI gate, one endpoint, one grid row, one green E2E
- [ ] 1 — Set data: CDragon sync, patch-versioned units/spells/items/traits
- [ ] 2 — Ingestion: rate limiter, Riot client, resumable cursors, raw store
- [ ] 3 — Facts & rollups: extraction, aggregates, golden-file suite
- [ ] 4 — Explorer v1: unit / item / trait pivots, avg place · top4 · win, sample guards
- [ ] 5 — Explorer v2: unit+item pivot, delta vs baseline, patch trend
- [ ] 6 — Coach: itemization — effect catalogue, combat calculator, tools, citations, evals
- [ ] 7 — Coach: positioning & counters

## Current State

**Done**: Design phase closed. Mentor system, architecture, grounding design, backlog and the
explorer spec are written. Repo scaffolding (workspace config, tsconfig, CI workflow, gitignore)
is prepared but not yet installed.
**In progress**: Nothing. Awaiting the first TDD cycle.
**Next**: Phase 0.1 — follow `SETUP.md`, configure the branch protection gate, then write
`apps/web/e2e/explorer.spec.ts`: a Playwright test that loads the app and expects the text
"Explorer". Confirm it fails for the right reason before writing any app code.

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
