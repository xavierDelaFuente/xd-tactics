import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  type Item,
  parseItem,
  parseTrait,
  parseUnit,
  type Trait,
  type Unit,
} from '@xd-tactics/domain';

// Phase 1.3/1.4 will replace this with a Postgres read. Until then, mock-set-data.json (frozen
// via apps/worker's generateMock script) is the "source" — reading it here, and re-validating
// through parse*, keeps this file's contract identical to what the real read will expose.
const mockPath = fileURLToPath(new URL('./mock-set-data.json', import.meta.url));

interface MockSetData {
  units: Unit[];
  items: Item[];
  traits: Trait[];
}

let cached: MockSetData | undefined;

function loadMockSetData(): MockSetData {
  if (!cached) {
    const raw = JSON.parse(readFileSync(mockPath, 'utf8')) as {
      units: unknown[];
      items: unknown[];
      traits: unknown[];
    };
    cached = {
      units: raw.units.map(parseUnit),
      items: raw.items.map(parseItem),
      traits: raw.traits.map(parseTrait),
    };
  }
  return cached;
}

export function getAllUnits(): Unit[] {
  return loadMockSetData().units;
}

export function getUnitByApiName(apiName: string): Unit | undefined {
  return loadMockSetData().units.find((unit) => unit.apiName === apiName);
}

export function getAllItems(): Item[] {
  return loadMockSetData().items;
}

export function getItemByApiName(apiName: string): Item | undefined {
  return loadMockSetData().items.find((item) => item.apiName === apiName);
}

export function getAllTraits(): Trait[] {
  return loadMockSetData().traits;
}

export function getTraitByApiName(apiName: string): Trait | undefined {
  return loadMockSetData().traits.find((trait) => trait.apiName === apiName);
}
