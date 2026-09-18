import { parseUnit, type Unit } from '@xd-tactics/domain';
import type { Kysely } from 'kysely';
import type { Database } from './schema';

export async function getUnit(
  db: Kysely<Database>,
  apiName: string,
  patch: string,
): Promise<Unit | undefined> {
  const row = await db
    .selectFrom('set_data_units')
    .select('data')
    .where('api_name', '=', apiName)
    .where('patch', '=', patch)
    .executeTakeFirst();

  if (!row) return undefined;

  return parseUnit(row.data);
}
