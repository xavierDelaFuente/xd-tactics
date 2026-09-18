import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { Kysely, PostgresDialect, sql } from 'kysely';
import { Pool } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { migrateToLatest } from '../migrator';

describe('migrateToLatest', () => {
  let container: StartedPostgreSqlContainer;
  let db: Kysely<unknown>;

  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:18').start();
    db = new Kysely({
      dialect: new PostgresDialect({
        pool: new Pool({ connectionString: container.getConnectionUri() }),
      }),
    });
  }, 60_000);

  afterAll(async () => {
    await db.destroy();
    await container.stop();
  });

  it('creates a set_data_units table keyed by (patch, api_name)', async () => {
    const { error } = await migrateToLatest(db);
    console.log(error);
    expect(error).toBeUndefined();

    // Two rows sharing an api_name but different patches must both be insertable —
    // that's the whole point of this table. If the primary key is wrong (e.g. just
    // api_name), the second insert throws a unique-violation and this test fails.
    await sql`
      insert into set_data_units (patch, api_name, name, cost, data)
      values ('15.1', 'TFT15_Jinx', 'Jinx', 4, '{}'),
             ('15.2', 'TFT15_Jinx', 'Jinx', 4, '{}')
    `.execute(db);

    const rows = await sql<{ patch: string }>`
      select patch from set_data_units where api_name = 'TFT15_Jinx' order by patch
    `.execute(db);

    expect(rows.rows.map((r) => r.patch)).toEqual(['15.1', '15.2']);
  });
});
