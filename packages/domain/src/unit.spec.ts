import { describe, expect, it } from 'vitest';
import { ZodError } from 'zod';
import { parseUnit } from './unit';

const fixtureUnit = {
  apiName: 'TFT15_Jinx',
  cost: 4,
  traits: ['Rebel', 'Sharpshooter'],
  stats: { hp: 800, armor: 20, mr: 20, ad: 55, as: 0.65, range: 5 },
  ability: { name: 'Get Excited!', mana: 50, variables: { damage: 150 } },
};

describe('parseUnit', () => {
  it('parses a fixture unit to the documented shape', () => {
    const unit = parseUnit(fixtureUnit);

    expect(unit).toEqual(fixtureUnit);
  });

  it('ignores an unknown field', () => {
    const unit = parseUnit({ ...fixtureUnit, wikiUrl: 'https://example.com' });

    expect(unit).not.toHaveProperty('wikiUrl');
  });

  it('throws a field-level error when a required field is missing', () => {
    const { cost, ...withoutCost } = fixtureUnit;
    void cost;

    let caught: unknown;
    try {
      parseUnit(withoutCost);
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(ZodError);
    expect((caught as ZodError).issues[0]?.path).toEqual(['cost']);
  });
});
