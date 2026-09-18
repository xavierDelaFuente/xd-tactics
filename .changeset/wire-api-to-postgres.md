---
"@xd-tactics/api": patch
"@xd-tactics/worker": patch
"@xd-tactics/db": patch
"@xd-tactics/domain": patch
---

Wire `apps/api` to real Postgres for `GET /static/units/:apiName?patch=&star=`: resolves the
unit's ability variables to the requested star level (defaulting to 1, tolerant of a
non-numeric `star`) and reads through `packages/db`'s `getUnit`, falling back to a `500` rather
than crashing the whole server when `DATABASE_URL` isn't configured — every other route
(`/explorer`, items, traits, the units list) stays mock-backed and unaffected either way.

Adds `packages/db`'s `createDb` for real (non-test) connections and `apps/worker`'s `seed:db`
script to populate local Postgres from the CDragon adapter's output. Also re-exports
`resolveAbilityVariables` from `@xd-tactics/domain`'s index — it existed but was unreachable
from outside the package.
