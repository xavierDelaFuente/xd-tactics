import { describe, expect, it } from 'vitest';
import { resolveAbilityVariables } from '../resolveAbilityVariables';

describe('resolveAbilityVariables', () => {
  it('resolves each variable to its value at the given star level', () => {
    const variables = [{ name: 'Damage', value: [100, 150, 200] }];

    const resolved = resolveAbilityVariables(variables, 2);

    expect(resolved).toEqual({ Damage: 150 });
  });

  it('resolves multiple variables independently', () => {
    const variables = [
      { name: 'Damage', value: [100, 150, 200] },
      { name: 'Heal', value: [50, 75, 100] },
    ];

    const resolved = resolveAbilityVariables(variables, 3);

    expect(resolved).toEqual({ Damage: 200, Heal: 100 });
  });

  it("clamps to the array's last value when the star level exceeds it", () => {
    // Real CDragon data: some variables carry more entries than there are star levels
    // (patch-history or level-scaling artifacts), others carry fewer. Star 5 on a
    // 2-entry array should not be undefined — it should hold at the last real value.
    const variables = [{ name: 'Heal', value: [10, 20] }];

    const resolved = resolveAbilityVariables(variables, 5);

    expect(resolved).toEqual({ Heal: 20 });
  });

  it('returns an empty object when there are no variables', () => {
    expect(resolveAbilityVariables([], 1)).toEqual({});
  });

  it('resolves star level 1 to the first value', () => {
    const variables = [{ name: 'Damage', value: [100, 150, 200] }];

    expect(resolveAbilityVariables(variables, 1)).toEqual({ Damage: 100 });
  });

  it('clamps a star level below 1 to the first value, not a wrapped-around one', () => {
    // Regression: `.at()` treats a negative index as "count from the end", so an
    // un-clamped starLevel of 0 or -1 would silently return the last (or some
    // arbitrary middle) value instead of the first — wrong in a way that looks
    // plausible, which is worse than an obvious crash.
    const variables = [{ name: 'Damage', value: [100, 150, 200] }];

    expect(resolveAbilityVariables(variables, 0)).toEqual({ Damage: 100 });
    expect(resolveAbilityVariables(variables, -1)).toEqual({ Damage: 100 });
  });

  it('defaults to 0 for a variable with no values at all', () => {
    const variables = [{ name: 'Damage', value: [] }];

    expect(resolveAbilityVariables(variables, 1)).toEqual({ Damage: 0 });
  });
});
