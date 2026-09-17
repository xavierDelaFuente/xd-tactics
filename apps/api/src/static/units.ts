import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseUnit, type Unit } from '@xd-tactics/domain';

// Phase 1.3/1.4 will replace this with a Postgres read. Until then, mock-set-data.json (frozen
// via apps/worker's generateMock script) is the "source" — reading it here, and re-validating
// through parseUnit, keeps this file's contract identical to what the real read will expose.
const mockPath = fileURLToPath(new URL('./mock-set-data.json', import.meta.url));

let cachedUnits: Unit[] | undefined;

function loadUnits(): Unit[] {
  if (!cachedUnits) {
    const raw = JSON.parse(readFileSync(mockPath, 'utf8')) as { units: unknown[] };
    cachedUnits = raw.units.map(parseUnit);
  }
  return cachedUnits;
}

export function getAllUnits(): Unit[] {
  return loadUnits();
}

export function getUnitByApiName(apiName: string): Unit | undefined {
  return loadUnits().find((unit) => unit.apiName === apiName);
}
