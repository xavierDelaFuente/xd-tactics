import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type Clock, createRateLimiter } from '../rateLimiter';

// Fake timers replace setTimeout *and* Date.now, so the limiter's injected clock can be built
// from the real primitives and still run in virtual time — instant, deterministic, and it
// handles concurrent sleepers correctly (a hand-rolled fake clock would not).
const clock: Clock = {
  now: () => Date.now(),
  sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
};

async function runCalls(limiter: { acquire(): Promise<void> }, count: number): Promise<number[]> {
  const stamps: number[] = [];
  const calls = Array.from({ length: count }, async () => {
    await limiter.acquire();
    stamps.push(clock.now());
  });
  await vi.runAllTimersAsync();
  await Promise.all(calls);
  return stamps;
}

// Largest number of calls that landed inside any half-open window [s, s + windowMs).
function maxInAnyWindow(stamps: number[], windowMs: number): number {
  return Math.max(...stamps.map((s) => stamps.filter((t) => t >= s && t < s + windowMs).length));
}

describe('createRateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('never lets more calls through than the budget allows in any window', async () => {
    const limiter = createRateLimiter([{ limit: 10, windowMs: 1000 }], clock);

    const stamps = await runCalls(limiter, 20);

    expect(maxInAnyWindow(stamps, 1000)).toBeLessThanOrEqual(10);
  });

  it('delays calls over budget instead of dropping them, spanning at least two windows', async () => {
    const limiter = createRateLimiter([{ limit: 10, windowMs: 1000 }], clock);

    const stamps = await runCalls(limiter, 20);

    expect(stamps).toHaveLength(20);
    expect(Math.max(...stamps) - Math.min(...stamps)).toBeGreaterThanOrEqual(1000);
  });

  it('honours every budget at once, like Riot’s per-second and per-2-minutes limits', async () => {
    const limiter = createRateLimiter(
      [
        { limit: 3, windowMs: 1000 },
        { limit: 5, windowMs: 10_000 },
      ],
      clock,
    );

    const stamps = await runCalls(limiter, 8);

    expect(maxInAnyWindow(stamps, 1000)).toBeLessThanOrEqual(3);
    expect(maxInAnyWindow(stamps, 10_000)).toBeLessThanOrEqual(5);
  });
});
