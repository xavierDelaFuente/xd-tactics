import { fileURLToPath } from 'node:url';
import { buildApp } from './app';
import { createDbFromEnv } from './createDbFromEnv';

try {
  process.loadEnvFile(fileURLToPath(new URL('../../../.env', import.meta.url)));
} catch {
  // .env is optional locally (see .env.example); in CI/production DATABASE_URL is
  // expected to already be set in the environment.
}

const port = Number(process.env.PORT ?? 3001);
const db = createDbFromEnv(process.env);

if (!db) {
  console.warn(
    'DATABASE_URL is not set — /static/units/:apiName will 500. Copy .env.example to .env to enable it.',
  );
}

const app = buildApp(db);

app
  .listen({ port, host: '0.0.0.0' })
  .then(() => app.log.info(`api listening on :${port}`))
  .catch((error: unknown) => {
    app.log.error(error);
    process.exit(1);
  });
