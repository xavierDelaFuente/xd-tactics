import { describe, expect, it } from 'vitest';
import { createDbFromEnv } from './createDbFromEnv';

describe('createDbFromEnv', () => {
  it('returns undefined when DATABASE_URL is not set, instead of throwing', () => {
    // Regression: server.ts used to throw here, which took down the *entire* server —
    // including every route that never touches Postgres. This must degrade, not crash.
    expect(() => createDbFromEnv({})).not.toThrow();
    expect(createDbFromEnv({})).toBeUndefined();
  });

  it('returns a db instance when DATABASE_URL is set', () => {
    const db = createDbFromEnv({ DATABASE_URL: 'postgres://user:pass@localhost:5432/db' });

    expect(db).toBeDefined();
  });
});
