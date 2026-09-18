import type { Database } from '@xd-tactics/db';
import { createDb } from '@xd-tactics/db';
import type { Kysely } from 'kysely';

// Only /static/units/:apiName needs Postgres — every other route (explorer, items, traits,
// the units list) is still mock-backed. A missing DATABASE_URL must degrade (that one route
// 500s on its own, per buildApp's db? contract), never throw and take the whole server down.
export function createDbFromEnv(env: NodeJS.ProcessEnv): Kysely<Database> | undefined {
  const databaseUrl = env.DATABASE_URL;
  if (!databaseUrl) {
    return undefined;
  }
  return createDb(databaseUrl);
}
