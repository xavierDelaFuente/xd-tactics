# Backlog

Every task names its **first failing test**. A task is not started until that test is red and
you have confirmed it says the right thing — Session Protocol, step 1.

Legend: `D` domain, pure · `I` integration, Testcontainers · `C` contract, fixture-backed · `E` Playwright

E2E budget: one flow per user-visible feature. If a `E` line duplicates something a `D` line
already proves, delete the `E`.

---

## Phase 0 — Walking skeleton

**0.1 Workspace + CI gate**
`E` A Playwright test loads the web app and finds the text "Explorer".
Deliver: pnpm workspace (`apps/{web,api,worker}`, `packages/{domain,contracts}`), strict TS with
`noUnusedLocals` / `noUnusedParameters` / `noImplicitReturns`, Vitest, Playwright, GitHub Actions
running test · type-check · lint · build, branch protection on `main`. CI before code.

**0.2 One endpoint, one row**
`C` `GET /explorer?pivot=unit` returns a zod-valid payload with exactly one hardcoded row.
`E` The grid renders that row's name and avg placement.

---

## Phase 1 — Set data

**1.1 Unit schema** — `D` A fixture unit parses to `{apiName, cost, traits, stats{hp,armor,mr,ad,as,range}, ability{name, mana, variables}}`; an unknown field is ignored, a missing required field throws a field-level error.

**1.2 CDragon adapter** — `C` A recorded CDragon payload yields N units, M items, K traits with no unknown-shape errors. Record the fixture; never fetch in a test.

**1.3 Patch versioning** — `I` Sync patch A then patch B; `getUnit(apiName, patch)` returns each patch's own stats.

**1.4 Read API** — `C` `GET /static/units/:apiName?patch=` returns the unit with ability variables resolved to the right star level.

---

## Phase 2 — Ingestion

**2.1 Rate limiter** — `D` 20 calls against a 10/s budget span at least two windows and never exceed the budget.

**2.2 Riot client** — `C` Recorded responses for match-ids-by-puuid, match-by-id and league entries parse into domain types; 429 triggers backoff; 404 is a typed not-found, not a throw.

**2.3 Crawl** — `I` A seeded puuid enqueues its recent match ids and skips ones already stored.

**2.4 Resumable cursor** — `I` Killing the worker mid-batch and restarting processes each match exactly once.

**2.5 Raw store** — `I` Storing the same match twice yields one row; the jsonb round-trips unchanged.

---

## Phase 3 — Facts & rollups

**3.1 Participant facts** — `D` A fixture match yields 8 rows with correct placement, level, gold left, patch, queue.

**3.2 Unit facts** — `D` A 3-star Jinx yields one unit fact with `star=3`.

**3.3 Unit-item facts** — `D` A unit holding two items yields two unit-item facts, one per item, both carrying the unit key.

**3.4 Trait facts** — `D` Trait facts carry the **active tier**, not the raw unit count. (6 Rebels at tier 3 is one row saying tier 3.)

**3.5 Rollup job** — `I` 50 golden matches roll up into `agg_pivot` with hand-verified `n`, `avg_place`, `top4` and `win` for three spot-checked keys.

**3.6 Baseline** — `D` Each compound key (unit+item) carries the parent unit's overall avg placement, computed in the same pass.

**3.7 Golden-file harness** — `D` A committed snapshot fails loudly on any aggregation change; updating it takes an explicit command.

**3.8 Incremental = full** — `I` Adding 10 matches incrementally produces byte-identical aggregates to a full recompute.

---

## Phase 4 — Explorer v1

**4.1 Filter key** — `D` A filter object serializes to a stable `filter_key`; key equality is order-independent.

**4.2 Query API** — `C` `GET /explorer?pivot=unit&…&sort=avgPlace` returns rows of `{key, name, n, avgPlace, top4, win}` in order.
`C` Unknown pivot → 400, typed error. Empty result → 200 with `[]`, never null.

**4.3 Trait and item pivots** — `C` Same contract for `pivot=item` and `pivot=trait`; trait rows key on (trait, tier).

**4.4 Sample guard** — `D` Rows under the threshold are flagged `lowSample`, never dropped.

**4.5 Grid** — `E` User switches pivot to item, sorts by top4 descending, and the row order changes. Low-sample rows are visibly marked and the hide toggle removes them.

**4.6 URL state** — `D` Filter + sort state round-trips through a query string losslessly.
`E` A pasted URL reproduces the exact view.

---

## Phase 5 — Explorer v2

**5.1 unit+item pivot** — `C` Rows key on (unit, item) and carry the unit baseline.
**5.2 Delta** — `D` `delta = avgPlace − baseline`, sign-correct: a better item gives a negative delta.
**5.3 Delta in the grid** — `E` Sorting by delta surfaces the best item for the selected unit.
**5.4 Patch trend** — `C` A per-patch series for one key, gaps preserved rather than interpolated.
**5.5 Saved views** — `E` A named filter set persists and reloads.

---

## Phase 6 — Coach: itemization

**6.1 Game state schema** — `D` Board (units, hexes, stars, items), bench, inventory, stage, gold and enemy boards parse; malformed input gives field-level errors.

**6.2 Effect catalogue schema** — `D` The closed `Effect` union parses a hand-authored entry; an unknown `kind` is a parse error, not a passthrough.

**6.3 Catalogue coverage check** — `D` Given a board, the service reports which units have no catalogue entry for the current patch. This drives the refusal path.

**6.4 Calculator — defense** — `D` Effective HP for given hp/armor/mr against a stated damage mix; applying shred then sunder changes it in the documented direction and magnitude.

**6.5 Calculator — offense** — `D` Time to first cast from starting mana, mana per attack and mana per hit taken; DPS with the attack-speed cap applied.

**6.6 Tool interface** — `C` `getUnit`, `getItem`, `getAggregate`, `simulateCombat` each have a schema, a happy path and a typed failure. An unknown id returns not-found; it never throws.

**6.7 Grounded response** — `C` With a stubbed model and a fixed state, the service returns `{unit, item, reason, citations[]}` where every citation resolves to a tool result.
`D` A recommendation containing a number with no matching citation is rejected before it leaves the service.

**6.8 Refusal** — `C` A board containing a unit with no catalogue entry returns an explicit refusal for that unit, not a guess.

**6.9 Eval harness** — 30 labelled states; the run reports agreement with the expert answer and any clearly-wrong pick. Gate prompt changes on it. Not in CI.

**6.10 Itemization UI** — `E` User loads a state, requests advice, and sees per-unit recommendations with reasoning and visible citations.

---

## Deferred — Phase 7, positioning & counters

Not committed. Sketch only: hex adjacency and clusters `D`, AoE footprint from a placement `D`,
threat ranking of an enemy board `D`, counter proposals with simulator-backed rationale `C`,
board-editor UI `E`.

---

## Cross-cutting, do not defer

- Every stat, tooltip value and recommendation carries its patch.
- No test touches Riot, CDragon or a model provider.
- Ingestion lag, rollup freshness and API p95 are on a dashboard from Phase 2.
- Any extraction change must be replayable over the raw store, and the replay is run before
  the change ships.
