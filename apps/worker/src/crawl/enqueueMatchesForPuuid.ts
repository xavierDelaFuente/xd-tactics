import type { Database } from '@xd-tactics/db';
import type { Kysely } from 'kysely';

export type MatchIdsResult =
  | { ok: true; value: string[] }
  | { ok: false; reason: 'not-found' | 'unauthorized' | 'rate-limited' };

// Narrow on purpose: this function only ever calls getMatchIds, so it shouldn't demand a full
// RiotClient — that also keeps the test's stub trivial.
export interface MatchIdsClient {
  getMatchIds(puuid: string, options?: { count?: number }): Promise<MatchIdsResult>;
}

export type EnqueueResult =
  | { ok: true; value: { enqueued: string[]; skipped: number } }
  | { ok: false; reason: 'not-found' | 'unauthorized' | 'rate-limited' };

export async function enqueueMatchesForPuuid(
  db: Kysely<Database>,
  client: MatchIdsClient,
  puuid: string,
  options?: { count?: number },
): Promise<EnqueueResult> {
  const idsResult = await client.getMatchIds(puuid, options);
  if (!idsResult.ok) return idsResult;

  const matchIds = idsResult.value;
  if (matchIds.length === 0) return { ok: true, value: { enqueued: [], skipped: 0 } };

  // ON CONFLICT DO NOTHING RETURNING only returns the rows actually inserted — dedup and the
  // "which ones are new" answer come from one atomic statement, with no separate SELECT to
  // check first (and so no race if two crawlers ever discover the same match at once).
  const rows = await db
    .insertInto('match_queue')
    .values(matchIds.map((matchId) => ({ match_id: matchId, puuid })))
    .onConflict((oc) => oc.column('match_id').doNothing())
    .returning('match_id')
    .execute();

  const enqueued = rows.map((row) => row.match_id);
  return { ok: true, value: { enqueued, skipped: matchIds.length - enqueued.length } };
}
