# ALTERNATIVES

Where a project overrode MENTOR_CODEX and the override has **not yet** graduated into the CODEX.
While an entry is here, it beats the CODEX.

An entry lives here only as long as it is unproven. Once a decision has proven itself in
practice — working, with reasoning that generalises — it moves into MENTOR_CODEX (Part 2/3) and
its entry is **deleted** from this file. A reversed decision gets a fresh entry saying so.

Carry this file into every new repo. It starts empty on purpose — the CODEX already carries what
earlier repos learned.

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

_None. Everything learned so far has graduated into MENTOR_CODEX:_

- _Deployable-unit workspace (`apps/` + `packages/`) → Part 2, Structure_
- _Fixture-recorded contract tests at every external boundary → Part 2, External data_
- _Model never computes / never recalls → Part 2, Non-deterministic components_
- _Split a spec file by scope → Part 2, Testing_
- _CSS Modules fallback when the bundler's support is broken → Part 2, Styling_
- _Verify an npm scope is free before spreading it → Part 2, Structure_
- _Biome instead of ESLint + Prettier → Part 2, Lint and format_

---

## Cross-project observations

Fill in once two or more projects are done. Empty is honest; do not invent entries.

**Styling by project type** — _pending second project_
**Testing depth by scale** — _pending second project_
**Monorepo vs single package, in hindsight** — _pending second project_
