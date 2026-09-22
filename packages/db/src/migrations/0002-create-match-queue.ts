import { type Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable('match_queue')
    .addColumn('match_id', 'varchar(255)', (col) => col.notNull().primaryKey())
    .addColumn('puuid', 'varchar(255)', (col) => col.notNull())
    .addColumn('discovered_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable('match_queue').execute();
}
