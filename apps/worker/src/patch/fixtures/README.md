# Patch-version fixtures

Recorded from Data Dragon's public, unauthenticated versions endpoint — never fetched in a
test, never hand-authored. No player data involved, so no redaction step (unlike the Riot
fixtures next door).

```bash
pnpm --filter @xd-tactics/worker run record:patch-versions
```

| File | Endpoint | Notes |
|---|---|---|
| `versions.json` | `GET https://ddragon.leagueoflegends.com/api/versions.json` | Newest-first. Full list runs to hundreds of historical entries; this is a 30-entry slice — enough to exercise cadence and normalization, not the whole history. |

## Why this exists — and what it doesn't prove

Riot exposes no patch **release date** anywhere we could find (checked: this endpoint, its
`realms/*.json`, and CDragon's `content-metadata.json`). `packages/domain`'s
`buildPatchCalendar` approximates each patch's start by counting backward from "now" in ~14-day
steps over this list. TFT patches are *roughly* biweekly — a behaviour, not a rule — so the
resulting boundaries are a deliberate approximation, not ground truth. See
`.mentor/PROJECT.md`, Open Question 6.
