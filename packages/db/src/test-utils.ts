import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import type { Unit } from '@xd-tactics/domain';
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { afterAll } from 'vitest';

import { migrateToLatest } from './migrator';
import type { Database } from './schema';

export async function configureDbForTest() {
  const container = await new PostgreSqlContainer('postgres:18').start();
  const db = new Kysely<Database>({
    dialect: new PostgresDialect({
      pool: new Pool({ connectionString: container.getConnectionUri() }),
    }),
  });

  const { error } = await migrateToLatest(db);
  if (error) throw error;

  return { db, container };
}

export function clearDbAfterTest(db: Kysely<Database>) {
  return db.destroy();
}

export async function stopContainerAfterTest(container: StartedPostgreSqlContainer): Promise<void> {
  await container.stop();
}

export async function setupDbForTest() {
  const { db, container } = await configureDbForTest();

  afterAll(async () => {
    await clearDbAfterTest(db);
    await stopContainerAfterTest(container);
  });

  return db;
}

export function fixtureUnit(overrides: Partial<Unit> = {}): Unit {
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
