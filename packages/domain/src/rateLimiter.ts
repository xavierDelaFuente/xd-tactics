export interface Clock {
  now(): number;
  sleep(ms: number): Promise<void>;
}

export interface RateLimit {
  limit: number;
  windowMs: number;
}

export interface RateLimiter {
  acquire(): Promise<void>;
}

// Sliding-window log, one timestamp list per budget. `acquire()` resolves once a call is
// allowed under *every* budget; over-budget callers are delayed, never rejected. Time is
// injected (`clock`) because domain code owns no clock — the worker passes real timers, the
// tests pass fake ones.
export function createRateLimiter(limits: RateLimit[], clock: Clock): RateLimiter {
  // one list of permitted-call timestamps per limit, oldest first, same order as `limits`
  const history: number[][] = limits.map(() => []);

  return {
    async acquire() {
      for (;;) {
        const now = clock.now();
        let wait = 0;

        for (const [i, { limit, windowMs }] of limits.entries()) {
          const stamps = history[i];
          if (!stamps) continue; // history mirrors limits; this satisfies noUncheckedIndexedAccess

          // A call exactly one window ago is already out: windows are half-open, [t, t + windowMs).
          while (stamps.length > 0 && (stamps[0] as number) <= now - windowMs) {
            stamps.shift();
          }

          const oldest = stamps[0];
          if (stamps.length >= limit && oldest !== undefined) {
            // The slot opens when the oldest call in this window expires. Several budgets may be
            // full at once — a slot must be free in all of them, so wait for the slowest.
            wait = Math.max(wait, oldest + windowMs - now);
          }
        }

        if (wait <= 0) {
          // A call counts against every budget, not just the tightest one.
          for (const stamps of history) {
            stamps.push(now);
          }
          return;
        }

        // Don't record after sleeping: other callers were asleep too and may have taken the slot.
        // Go around and re-check with fresh data instead.
        await clock.sleep(wait);
      }
    },
  };
}
