---
"@xd-tactics/worker": patch
"@xd-tactics/domain": patch
---

Resolve how a match's patch is determined (`.mentor/PROJECT.md`, Open Question 6 — Riot exposes
no patch release date anywhere). Adds `buildPatchCalendar`/`patchForDate` to `@xd-tactics/domain`:
a match's patch is the most recent patch window whose approximated start (~14 days apart,
counted backward from now over Data Dragon's version list — TFT's cadence is a behaviour, not a
rule) is at or before the match's `gameDatetime`; a match older than the calendar returns
`undefined` rather than a guess. `apps/worker/src/patch/` is the adapter: fetches Data Dragon's
public `versions.json` (fixture-backed in tests) and normalizes `"16.18.1"` → `"16.18"`,
collapsing hotfix duplicates.
