import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { adaptCDragonSetData } from './cdragonAdapter';

const fixturePath = fileURLToPath(new URL('./fixtures/cdragon-set18.sample.json', import.meta.url));
const fixture = JSON.parse(readFileSync(fixturePath, 'utf8'));

describe('adaptCDragonSetData', () => {
  it('yields units, items and traits with no unknown-shape errors', () => {
    const result = adaptCDragonSetData(fixture);

    // Counts are hand-verified against the fixture: 91 raw champions minus 18 non-playable
    // (PVE mobs, no traits) minus 1 with an unreleased null stat (DA_18_Kayle) = 73. 771 raw
    // item refs minus 2 unnamed placeholders = 769. 36 raw traits minus 1 left with zero
    // usable tiers after dropping its one null-minUnits tier (DA_18_Eclipse) = 35.
    expect(result.units).toHaveLength(73);
    expect(result.items).toHaveLength(769);
    expect(result.traits).toHaveLength(35);
  });
});
