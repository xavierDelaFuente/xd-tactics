# Riot fixtures

Recorded from the live Riot API by `../recordFixtures.ts` — never hand-authored, never fetched
in a test. Re-record with a fresh development key in `.env` (they expire every 24h):

```bash
pnpm --filter @xd-tactics/worker run record:riot [gameName] [tagLine]   # defaults: Asnewyla EUW
```

Review the resulting `git diff` like code. A shape change here is the early warning that
Riot's schema moved.

| File | Endpoint | Notes |
|---|---|---|
| `account.json` | `GET {region}/riot/account/v1/accounts/by-riot-id/{name}/{tag}` | |
| `match-ids.json` | `GET {region}/tft/match/v1/matches/by-puuid/{puuid}/ids?count=5` | |
| `match.json` | `GET {region}/tft/match/v1/matches/{matchId}` | one full ranked TFT match, 8 participants |
| `league-page.json` | `GET {platform}/tft/league/v1/entries/DIAMOND/I?queue=RANKED_TFT&page=1` | first 5 of ~200 entries — a slice of the real array, enough to pin the shape |

## Redaction

This repo is public, so player identities are replaced **before** anything is written to disk
(`../redact.ts`): every PUUID becomes `REDACTED_<n>` padded to the original 78 characters, and
`gameName` / `riotIdGameName` become `Player<n>` (tags become `EUW`). The mapping is consistent
within one recording run, so cross-references survive — the account's PUUID is still one of the
match's participants. `__test__/fixtures.spec.ts` fails if an un-redacted recording is committed.

## Things the real data taught us

- **`info.game_version` is a placeholder** (`"TFT Unreal Version ?.?.?.?"`), not a patch number.
  The match payload alone cannot tell us which patch it was played on — see PROJECT.md, Open
  Questions. Do not treat that field as meaningful.
- League entries carry `puuid` directly (no `summonerId`), and `queueType` distinguishes
  `RANKED_TFT` from `RANKED_TFT_DOUBLE_UP`.
- Match units list equipped items as `itemNames` (strings), not numeric ids.
