import type { UnitAbilityVariable } from './unit';

export function resolveAbilityVariables(
  variables: UnitAbilityVariable[],
  starLevel: number,
): Record<string, number> {
  const resolved: Record<string, number> = {};
  // Clamp below 1 before computing the index: `.at()` treats a negative index as
  // "count from the end", so an un-clamped starLevel <= 0 would silently wrap around
  // and return an arbitrary middle value instead of the first one.
  const index = Math.max(1, starLevel) - 1;

  for (const variable of variables) {
    resolved[variable.name] = variable.value.at(index) ?? variable.value.at(-1) ?? 0;
  }

  return resolved;
}
