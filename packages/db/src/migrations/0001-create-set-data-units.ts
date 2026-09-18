import type { Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable('set_data_units')
    .addColumn('patch', 'varchar(255)', (col) => col.notNull())
    .addColumn('api_name', 'varchar(255)', (col) => col.notNull())
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('cost', 'integer', (col) => col.notNull())
    .addColumn('data', 'jsonb', (col) => col.notNull())
    .addPrimaryKeyConstraint('set_data_units_pkey', ['patch', 'api_name'])
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable('set_data_units').execute();
}
