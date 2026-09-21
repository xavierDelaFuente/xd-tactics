---
"@xd-tactics/domain": patch
---

Add `createRateLimiter(limits, clock)`: a sliding-window rate limiter whose `acquire()` delays
callers until a slot is free under every budget at once (Riot's dev key enforces 20/1s and
100/2min simultaneously), rather than rejecting them. Time is injected via a `Clock` so the
domain stays clock-free and the tests run in virtual time.
