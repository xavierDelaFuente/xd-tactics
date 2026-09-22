import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import type { Database } from '@xd-tactics/db';
import {
  clearDbAfterTest,
  configureDbForTest,
  stopContainerAfterTest,
} from '@xd-tactics/db/test-utils';
import type { Kysely } from 'kysely';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { enqueueMatchesForPuuid } from '../enqueueMatchesForPuuid';

type MatchIdsResult = { ok: true; value: string[] } | { ok: false; reason: 'not-found' };

// The Riot HTTP contract is already covered by riotClient.spec.ts against recorded fixtures.
// This is an integration test of the dedup logic against a *real* Postgres — the client is a
// stub that only needs to satisfy getMatchIds.
function stubRiotClient(response: MatchIdsResult) {
  return { getMatchIds: async () => response };
}

const found = (value: string[]): MatchIdsResult => ({ ok: true, value });
const notFound = (): MatchIdsResult => ({ ok: false, reason: 'not-found' });

describe('enqueueMatchesForPuuid', () => {
  let container: StartedPostgreSqlContainer;
  let db: Kysely<Database>;

  beforeAll(async () => {
    ({ db, container } = await configureDbForTest());
  }, 60_000);

  afterAll(async () => {
    await clearDbAfterTest(db);
    await stopContainerAfterTest(container);
  });

  it('enqueues every match id the client returns', async () => {
    const client = stubRiotClient(found(['M1', 'M2', 'M3']));

    const result = await enqueueMatchesForPuuid(db, client, 'puuid-a');

    expect(result).toEqual({ ok: true, value: { enqueued: ['M1', 'M2', 'M3'], skipped: 0 } });
  });

  it('skips match ids already in the queue, without erroring', async () => {
    const client = stubRiotClient(found(['M1', 'M2', 'M4']));

    // M1 and M2 are already queued from the previous test — same puuid, overlapping ids.
    const result = await enqueueMatchesForPuuid(db, client, 'puuid-a');

    expect(result).toEqual({ ok: true, value: { enqueued: ['M4'], skipped: 2 } });
  });

  it('is safe to call twice with the exact same ids — no duplicate rows, nothing re-enqueued', async () => {
    const client = stubRiotClient(found(['M5']));

    await enqueueMatchesForPuuid(db, client, 'puuid-b');
    const second = await enqueueMatchesForPuuid(db, client, 'puuid-b');

    expect(second).toEqual({ ok: true, value: { enqueued: [], skipped: 1 } });
    const rows = await db
      .selectFrom('match_queue')
      .select('match_id')
      .where('match_id', '=', 'M5')
      .execute();
    expect(rows).toHaveLength(1);
  });

  it('does not touch the database when the Riot client fails', async () => {
    const client = stubRiotClient(notFound());

    const result = await enqueueMatchesForPuuid(db, client, 'puuid-unknown');

    expect(result).toEqual({ ok: false, reason: 'not-found' });
    const rows = await db
      .selectFrom('match_queue')
      .select('match_id')
      .where('puuid', '=', 'puuid-unknown')
      .execute();
    expect(rows).toHaveLength(0);
  });

  it('handles an empty match list without attempting an insert', async () => {
    const client = stubRiotClient(found([]));

    const result = await enqueueMatchesForPuuid(db, client, 'puuid-c');

    expect(result).toEqual({ ok: true, value: { enqueued: [], skipped: 0 } });
  });
});
