import type { Unit } from '@xd-tactics/domain';
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { getUnit } from '../getUnit';
import { migrateToLatest } from '../migrator';
import type { Database } from '../schema';
import { syncUnitsForPatch } from '../syncUnitsForPatch';

function fixtureUnit(overrides: Partial<Unit> = {}): Unit {
  return {
    apiName: 'TFT15_Jinx',
    name: 'Jinx',
    cost: 4,
    traits: ['Rebel'],
    stats: { hp: 800, armor: 20, mr: 20, ad: 55, as: 0.65, range: 5 },
    ability: { name: 'Get Excited!', mana: 50, variables: [] },
    ...overrides,
  };
}

describe('syncUnitsForPatch + getUnit', () => {
  let container: StartedPostgreSqlContainer;
  let db: Kysely<Database>;

  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:18').start();
    db = new Kysely<Database>({
      dialect: new PostgresDialect({
        pool: new Pool({ connectionString: container.getConnectionUri() }),
      }),
    });

    const { error } = await migrateToLatest(db);
    if (error) throw error;
  }, 60_000);

  afterAll(async () => {
    await db.destroy();
    await container.stop();
  });

  it("returns each patch's own stats for the same unit", async () => {
    await syncUnitsForPatch(db, '15.1', [fixtureUnit({ stats: { ...fixtureUnit().stats, hp: 800 } })]);
    await syncUnitsForPatch(db, '15.2', [fixtureUnit({ stats: { ...fixtureUnit().stats, hp: 900 } })]);

    const unitFromA = await getUnit(db, 'TFT15_Jinx', '15.1');
    const unitFromB = await getUnit(db, 'TFT15_Jinx', '15.2');

    expect(unitFromA?.stats.hp).toBe(800);
    expect(unitFromB?.stats.hp).toBe(900);
  });

  it('upserts rather than duplicating when the same patch is synced twice', async () => {
    await syncUnitsForPatch(db, '15.3', [fixtureUnit({ cost: 3 })]);
    await syncUnitsForPatch(db, '15.3', [fixtureUnit({ cost: 4 })]);

    const unit = await getUnit(db, 'TFT15_Jinx', '15.3');

    expect(unit?.cost).toBe(4);
  });

  it('returns undefined for a patch that was never synced', async () => {
    const unit = await getUnit(db, 'TFT15_Jinx', '99.9');

    expect(unit).toBeUndefined();
  });
});
