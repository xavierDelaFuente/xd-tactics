import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createDb, migrateToLatest, syncUnitsForPatch } from '@xd-tactics/db';
import { adaptCDragonSetData } from './cdragonAdapter';

// Placeholder patch label — nothing tracks real Riot patch strings until Phase 2's ingestion
// exists. This just needs to be stable and honest that it's not a real patch number yet.
const PATCH = 'dev-set18';

try {
  process.loadEnvFile(fileURLToPath(new URL('../../../../.env', import.meta.url)));
} catch {
  // .env is optional locally (see .env.example); in CI/production DATABASE_URL is
  // expected to already be set in the environment.
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required — copy .env.example to .env and fill it in');
  }

  const fixturePath = fileURLToPath(
    new URL('./fixtures/cdragon-set18.sample.json', import.meta.url),
  );
  const fixture = JSON.parse(readFileSync(fixturePath, 'utf8'));
  const { units } = adaptCDragonSetData(fixture);

  const db = createDb(databaseUrl);
  const { error } = await migrateToLatest(db);
  if (error) throw error;

  await syncUnitsForPatch(db, PATCH, units);
  console.log(`seeded ${units.length} units under patch "${PATCH}"`);

  await db.destroy();
}

main();
