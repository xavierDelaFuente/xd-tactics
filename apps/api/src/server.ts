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

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required — copy .env.example to .env and fill it in');
}

const db = createDb(databaseUrl);
const app = buildApp(db);

app
  .listen({ port, host: '0.0.0.0' })
  .then(() => app.log.info(`api listening on :${port}`))
  .catch((error: unknown) => {
    app.log.error(error);
    process.exit(1);
  });
