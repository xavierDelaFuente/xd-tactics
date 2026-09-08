# ALTERNATIVES

Where I overrode MENTOR_CODEX. **These entries beat the CODEX.**
Append-only — a reversed decision gets a new entry, the old one stays.

Carry this file into every new repo. It is the part of the system that learns.

---

## Entry format

```
### <date> · <project> · <topic>
**CODEX said**: <one line>
**I did**: <one line>
**Because**: <one or two lines>
**Verdict**: <working | mixed | reverted — filled in later>
**Generalise**: <when this should apply again, or "one-off">
```

Keep entries to five lines. If an entry needs more, it belongs in PROJECT.md.

---

## Entries

### 2026-08 · xd-components · Modules 1–2
**CODEX said**: TDD, strict TS, CI-first, render props on primitives, `data-*` for state
**I did**: Followed all of it
**Because**: No friction encountered; the patterns held up
**Verdict**: working — 11 tests, CI catching issues before merge
**Generalise**: baseline confirmed, no override needed

### 2026-08-20 · xd-components · Module 3 — Button styling
**CODEX said**: Component library styling default = CSS Modules + `data-*`
**I did**: Plain CSS with hand-namespaced classes (`.xd-button`), imported as a side effect, instead of CSS Modules
**Because**: The only viable esbuild CSS Modules plugin (`esbuild-css-modules-plugin`, 15mo stale) broke `tsup`'s dist output paths and, even after fixing that, never produced real scoped class names — tsup's own CSS support is documented experimental
**Verdict**: working — full CI gate green, verified real class name ships in `dist/index.js`
**Generalise**: apply the same pattern to `icon-button`/`button-group`; revisit if the project migrates to `tsdown`

### 2026-08-20 · xd-components · Module 7 — npm scope
**CODEX said**: n/a — project decision, not a CODEX default. Doc's original spec used `@xd-components`; earlier this session it was shortened to `@xd`.
**I did**: Renamed all four packages to `@asnewyla/*` (personal npm username scope), not `@xd` or `@xd-components`
**Because**: `@xd` was already registered by someone else on npm (discovered via the token-creation UI, confirmed by the org lookup returning no valid scope); `@xd-components` was available but would've meant reverting the earlier in-session rename. Personal scope needed zero setup and published immediately.
**Verdict**: working — all four packages live on the public registry, dependency resolution verified correct end to end
**Generalise**: check real npm scope/org availability *before* committing to a name across a whole codebase, not after — this is the second full-codebase scope rename this project has done

### 2026-08-27 · xd-components · Spec-file-splitting rule added directly to CODEX
**CODEX said**: MENTOR_CODEX "changes rarely, only when a pattern has proven itself across 3+ projects" — normally routed through this file's own Promotion tracker, not edited directly.
**I did**: Added the "split a spec file by scope" testing rule straight to `MENTOR_CODEX.md` (Part 2, Testing), skipping the tracker.
**Because**: Explicit direct instruction ("update the directives so this tests requirement is always considered") after applying the pattern across two packages (`unstyled-table`, split into 6 files) and three more in the same session (`unstyled-select` → 5 files, `select` → 2, `radio` → 2) — proven repeatedly within this one project, just not yet across 3 separate projects.
**Verdict**: working — applied consistently across 5 packages, `pnpm check`/`pnpm test` green throughout
**Generalise**: if this rule turns out wrong in a future project (e.g. the size/scope threshold needs tuning), revise it in place rather than treating this entry as untouchable precedent — it was fast-tracked, not battle-tested elsewhere yet

### 2026-09-08 · xd-tactics · Workspace shape for a multi-process app
**CODEX said**: Monorepo decision tree — two or more "yes" on publishing questions, otherwise single package. xd-tactics answers yes to one, so: single package.
**I did**: One pnpm workspace with `apps/{web,api,worker}` and `packages/{domain,contracts}`, nothing published
**Because**: The tree only reasons about publishable artifacts. Three processes with different runtimes and deploy cadences still need to share domain types without a registry round-trip — a gap in the rule, not a disagreement with it
**Verdict**: pending
**Generalise**: promoted into CODEX 2.1 as the second ("deployable units") tree — revisit if a single-process shape would have done

### 2026-09-08 · xd-tactics · CODEX gaps for backend, data and LLM work
**CODEX said**: Nothing — Parts 2 and 3 were written entirely from a component library
**I did**: Added Part 2 sections for External data, Non-deterministic components and Services/data stores, plus a protocol clause requiring the mentor to *say* when no rule exists rather than stretch one
**Because**: xd-tactics is an ingestion pipeline and a model-backed advisor before it is a UI; without rules the mentor was improvising silently, which is the exact failure mode the Behavioral Contract exists to prevent
**Verdict**: pending — rules are written, not yet battle-tested
**Generalise**: these are *gaps filled*, not overrides; if a second project contradicts one, revise it in place rather than treating it as precedent

---

## Promotion tracker

A pattern that appears here **three times across different projects** graduates into
MENTOR_CODEX. Track candidates:

| Pattern | Seen in | Count | Status |
|---|---|---|---|
| Deployable-unit workspace (`apps/` + `packages/`) | xd-tactics | 1 | fast-tracked into CODEX 2.1 — needs 2 more to be earned |
| Fixture-recorded contract tests at every external boundary | xd-tactics | 1 | fast-tracked into CODEX 2.1 |
| Model-never-computes grounding pattern | xd-tactics | 1 | fast-tracked into CODEX 2.1 |

---

## Cross-project observations

Fill in once two or more projects are done. Empty is honest; do not invent entries.

**Styling by project type** — _pending second project_
**Testing depth by scale** — _pending second project_
**Monorepo vs single package, in hindsight** — _pending second project_
