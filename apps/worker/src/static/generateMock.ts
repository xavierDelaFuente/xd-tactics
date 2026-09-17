import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { adaptCDragonSetData } from './cdragonAdapter';

// Freezes the adapter's output against the committed fixture into a static JSON file that
// apps/api serves for now, in place of a real Postgres-backed read (Phase 1.3/1.4). Deliberate
// scope cut, not an accident: it unblocks the web app on real unit data before Postgres,
// Testcontainers and migrations exist. Re-run whenever the fixture changes:
//
//   pnpm --filter @xd-tactics/worker exec tsx src/static/generateMock.ts

const fixturePath = fileURLToPath(new URL('./fixtures/cdragon-set18.sample.json', import.meta.url));
const outputPath = fileURLToPath(
  new URL('../../../api/src/static/mock-set-data.json', import.meta.url),
);

async function main() {
  const { readFileSync } = await import('node:fs');
  const fixture = JSON.parse(readFileSync(fixturePath, 'utf8'));
  const adapted = adaptCDragonSetData(fixture);

  writeFileSync(outputPath, `${JSON.stringify(adapted, null, 2)}\n`);
  console.log(
    `wrote ${adapted.units.length} units, ${adapted.items.length} items, ${adapted.traits.length} traits to ${outputPath}`,
  );
}

main();
