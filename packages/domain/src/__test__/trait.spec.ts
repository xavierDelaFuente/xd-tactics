import { describe, expect, it } from 'vitest';
import { parseTrait } from '../trait';

// Deeper shape-variety coverage (real, messy source data) comes from the CDragon
// adapter's fixture-backed test in apps/worker — this just locks the domain shape.
describe('parseTrait', () => {
  it('parses a fixture trait to the documented shape', () => {
    const fixtureTrait = {
      apiName: 'DA_18_Elderwood',
      name: 'Elderwood',
      tiers: [
        { minUnits: 3, maxUnits: 4, style: 1 },
        { minUnits: 5, maxUnits: 6, style: 3 },
      ],
    };

    const trait = parseTrait(fixtureTrait);

    expect(trait).toEqual(fixtureTrait);
  });
});
