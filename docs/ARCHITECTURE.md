# Architecture

Companion to `.mentor/PROJECT.md`. That file is state; this one is reasoning.

## Is the Explorer a small feature?

No — and you were right to suspect it. It is the entire infrastructure spine wearing a small hat.
One filterable grid requires:

| Layer | Why the grid needs it |
|---|---|
| Riot API client, rate-limited and retrying | source of truth |
| Ingestion with resumable cursors | continuous, restartable, idempotent |
| Set data sync (Community Dragon) | unit stats, spells, items, traits — per patch |
| Immutable raw match store | replay when extraction logic changes |
| Fact extraction | one row per (match, participant, unit) / (…, item) / (…, trait) |
| Rollup aggregates | the grid cannot scan facts at query time |
| Query API with a stable contract | pivots × filters × metrics |
| Patch versioning everywhere | a stat without a patch is noise |
| Sample-size handling | the most common way stats sites mislead |
| Virtualized, sortable, deep-linkable grid | usable at 200+ rows |

That is the argument *for* building it first: everything the coach needs later — set data, a
query contract, aggregates it can cite — gets built here as a side effect.

## Pipeline

```
Riot API ──► worker/ingest ──► raw_match (jsonb, immutable, patch-stamped)
                                   │
CDragon ──► worker/static ──► set_data (units, spells, items, traits) per patch
                                   │      └──► effect_catalogue (hand-authored, versioned)
                                   ▼
                            extract  ──►  fact_participant · fact_unit
                                          fact_unit_item · fact_trait
                                   │
                                   ▼
                            rollup   ──►  agg_pivot(pivot_key, filter_key, n,
                                          avg_place, top4, win, patch, updated_at)
                                   │
                                   ▼
                             api/query ──► apps/web  (Explorer)
                                   │
                                   └────► api/coach ──► model
                                          tools: getUnit · getItem
                                                 getAggregate · simulateCombat
```

Boundaries that get fixture-backed contract tests: **Riot client, CDragon adapter, extractor,
rollup job, query API, coach tool interface.** Per CODEX 2.1, none of them touch the network in
tests.

## Explorer v1 scope

Pivots: **unit · item · trait · unit+item**.
Metrics: **avg placement · top 4 % · win % · delta vs baseline**, always with `n`.

`delta vs baseline` is the one that makes the grid worth reading: an item's avg placement on a
unit means nothing until you subtract that unit's overall avg placement. Baseline is computed in
the same rollup pass, not at query time.

Rows below the sample threshold are **flagged, never dropped**. Hiding them is a user toggle;
silently omitting them is a lie about the data set.

## Why not scrape an aggregator

Three reasons, in order: their terms forbid it; you inherit their aggregation bugs with no way to
audit them; and the coach needs raw per-unit facts that no public endpoint exposes. First-party
ingestion is slower to start and the only version that ends up as a product.

## Why precomputed rollups

`filter_key` is a canonical hash of (patch, rank bracket, region, queue, set). Aggregates are
written per (pivot_key, filter_key). This bounds the filter space deliberately — an arbitrary
filter combination is not supported, and that is a feature: it keeps the grid fast and the
numbers stable. Freeform slicing, if ever needed, becomes a separate slow-query path.

Incremental rollups must produce exactly what a full recompute produces. That equality is a test,
run on every change to extraction or aggregation.

## Coach

See `docs/LLM_GROUNDING.md`. Summary: the model never recalls a fact and never computes a number;
a hand-authored effect catalogue supplies mechanics, a pure-domain calculator supplies math, and
every claim carries a citation or is rejected before rendering.

## Roadmap

| Phase | Ships |
|---|---|
| 0 | Walking skeleton — workspace, CI gate, one endpoint, one row, one green E2E |
| 1 | Set data synced and patch-versioned |
| 2 | Ingestion running, raw store filling |
| 3 | Facts and rollups with a golden-file suite |
| 4 | Explorer v1 — unit / item / trait pivots |
| 5 | Explorer v2 — unit+item, delta vs baseline |
| 6 | Coach: itemization |
| 7 | Coach: positioning & counters (deferred; not in the current commitment) |
