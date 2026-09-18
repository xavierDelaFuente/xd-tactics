import { fileURLToPath } from 'node:url';
import { createDb } from '@xd-tactics/db';
import { buildApp } from './app';

try {
  process.loadEnvFile(fileURLToPath(new URL('../../../.env', import.meta.url)));
} catch {
  // .env is optional locally (see .env.example); in CI/production DATABASE_URL is
  // expected to already be set in the environment.
}

const port = Number(process.env.PORT ?? 3001);
const databaseUrl = process.env.DATABASE_URL;

// Only /static/units/:apiName needs Postgres — every other route (explorer, items, traits,
// the units list) is still mock-backed. A missing DATABASE_URL shouldn't take the whole
// server down; buildApp already 500s just that one route when db is undefined.
if (!databaseUrl) {
  console.warn(
    'DATABASE_URL is not set — /static/units/:apiName will 500. Copy .env.example to .env to enable it.',
  );
}

const db = databaseUrl ? createDb(databaseUrl) : undefined;
const app = buildApp(db);

app
  .listen({ port, host: '0.0.0.0' })
  .then(() => app.log.info(`api listening on :${port}`))
  .catch((error: unknown) => {
    app.log.error(error);
    process.exit(1);
  });
