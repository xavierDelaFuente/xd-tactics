import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Re-records ./fixtures/versions.json from Data Dragon's live, public versions list.
//
//   pnpm --filter @xd-tactics/worker run record:patch-versions
//
// No API key needed — this endpoint is public. Unlike the Riot fixtures, nothing here
// identifies a player, so no redaction step applies.

const outDir = fileURLToPath(new URL('./fixtures/', import.meta.url));

async function main() {
  const response = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
  if (!response.ok) {
    throw new Error(`Data Dragon responded ${response.status}`);
  }
  const versions = (await response.json()) as string[];

  mkdirSync(outDir, { recursive: true });
  // The real list goes back to Data Dragon's earliest tracked patch (hundreds of entries) — a
  // slice of ~30 is more than enough to cover the cadence and normalization logic under test.
  writeFileSync(`${outDir}versions.json`, `${JSON.stringify(versions.slice(0, 30), null, 2)}\n`);
  console.log(
    `recorded ${versions.length > 30 ? '30 of ' : ''}${Math.min(30, versions.length)} versions`,
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
