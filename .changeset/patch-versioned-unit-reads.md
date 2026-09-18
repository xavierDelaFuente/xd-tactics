---
"@xd-tactics/db": patch
"@xd-tactics/domain": patch
---

Add Postgres-backed, patch-versioned unit storage: a Kysely migration for `set_data_units` keyed
by `(patch, api_name)`, an idempotent `syncUnitsForPatch` upsert, and a `getUnit(apiName, patch)`
read that re-validates through the domain's `parseUnit`. Also adds `resolveAbilityVariables`,
resolving a unit's ability variables to a specific star level (clamped at both ends) — the piece
Phase 1.4's read API needs so it stops exposing raw, unresolved variable arrays.
