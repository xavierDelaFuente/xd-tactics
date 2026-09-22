---
"@xd-tactics/worker": patch
"@xd-tactics/domain": patch
---

Add the Riot API client to `apps/worker` (`createRiotClient`): account lookup, TFT match ids,
full matches and league entries, each awaiting the rate limiter before every request. Expected
outcomes are typed results (`not-found` on 404, `unauthorized` on 401/403 — an expired dev key,
`rate-limited` after retrying a 429 for its `Retry-After`); unexpected statuses and payloads
whose shape changed throw. Matches come back parsed into the domain's camelCase types alongside
the untouched raw payload for the raw store.

`@xd-tactics/domain` gains the `Account`, `LeagueEntry` and `Match` types and schemas, so
Riot's snake_case shape lives in a single worker file. Adds fixtures recorded from the live API
(player identities redacted, with a guard test) and a `record:riot` script to re-record them.
