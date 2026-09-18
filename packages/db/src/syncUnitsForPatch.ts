import type { Unit } from '@xd-tactics/domain';
import type { Kysely } from 'kysely';
import type { Database } from './schema';

export async function syncUnitsForPatch(
  db: Kysely<Database>,
  patch: string,
  units: Unit[],
): Promise<void> {
  if (units.length === 0) return;

  await db
    .insertInto('set_data_units')
    .values(
      units.map((unit) => ({
        patch,
        api_name: unit.apiName,
        name: unit.name,
        cost: unit.cost,
        data: JSON.stringify(unit),
      })),
    )
    .onConflict((oc) =>
      oc.columns(['patch', 'api_name']).doUpdateSet((eb) => ({
        name: eb.ref('excluded.name'),
        cost: eb.ref('excluded.cost'),
        data: eb.ref('excluded.data'),
      })),
    )
    .execute();
}
