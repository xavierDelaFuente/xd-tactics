import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type { Kysely } from 'kysely';
import { FileMigrationProvider, Migrator } from 'kysely/migration';

export async function migrateToLatest<DB>(db: Kysely<DB>) {
  const migrationFolder = path.join(path.dirname(fileURLToPath(import.meta.url)), 'migrations');

  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder,
      // Windows: FileMigrationProvider's default import(filePath) passes a raw "C:\..." path
      // to Node's ESM loader, which only accepts file:// URLs and throws
      // ERR_UNSUPPORTED_ESM_URL_SCHEME. pathToFileURL fixes it on every OS.
      import: (modulePath) => import(pathToFileURL(modulePath).href),
    }),
  });

  return migrator.migrateToLatest();
}
