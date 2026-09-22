---
"@xd-tactics/db": patch
"@xd-tactics/worker": patch
---

Add the match-discovery crawl step (BACKLOG 2.3): `enqueueMatchesForPuuid(db, client, puuid)`
fetches a puuid's recent match ids and enqueues the ones not already known, via one atomic
`INSERT ... ON CONFLICT DO NOTHING RETURNING` — no separate check-then-insert, so no race if two
crawlers discover the same match at once. `@xd-tactics/db` gains the `match_queue` table
(migration `0002`), keyed by `match_id`.
