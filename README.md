# xd-tactics

TFT statistics explorer, and an itemization coach that gives a tactical opinion rather than a
number.

The explorer earns the infrastructure. The coach is the reason the product exists.

## Status

Phase 0 of 7 — nothing built yet. Planning and design are complete; the next commit is the
walking skeleton.

## Docs

| File | What it is |
|---|---|
| `.mentor/PROJECT.md` | Current state, stack, decisions, next step. **Read this first.** |
| `.mentor/MENTOR_CODEX.md` | Binding engineering rules (v2.1) |
| `.mentor/ALTERNATIVES.md` | Where the CODEX was overridden or its gaps filled |
| `docs/ARCHITECTURE.md` | The pipeline and its boundaries |
| `docs/LLM_GROUNDING.md` | How the coach avoids hallucinating |
| `docs/EXPLORER_UI.md` | The chosen explorer layout, spec'd |
| `BACKLOG.md` | Tasks, each with its first failing test |
| `SETUP.md` | Phase 0.1 — commands to stand the workspace up |

## Shape

```
apps/web      React + Vite      the explorer, later the coach
apps/api      Fastify           query API, coach endpoint
apps/worker   Node              ingestion, static sync, rollups
packages/domain                 pure logic, zero I/O — where the tests live
packages/contracts              zod schemas shared by api + web
```

Nothing in `apps/` is ever published. `packages/*` are internal to the workspace.

## Working agreement

TDD, red first, one cycle at a time. See the Session Protocol in `.mentor/MENTOR_CODEX.md`.
A test is written and failing before the implementation exists — including for the scaffold.
