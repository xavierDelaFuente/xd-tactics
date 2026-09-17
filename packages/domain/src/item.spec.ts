import { describe, expect, it } from 'vitest';
import { parseItem } from './item';

// Deeper shape-variety coverage (real, messy source data) comes from the CDragon
// adapter's fixture-backed test in apps/worker — this just locks the domain shape.
describe('parseItem', () => {
  it('parses a fixture item to the documented shape', () => {
    const fixtureItem = {
      apiName: 'TFT_Item_InfinityEdge',
      name: 'Infinity Edge',
      unique: false,
      associatedTraits: [],
      composition: ['TFT_Item_BFSword', 'TFT_Item_SparringGloves'],
    };

    const item = parseItem(fixtureItem);

    expect(item).toEqual(fixtureItem);
  });
});
