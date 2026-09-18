import { z } from 'zod';

export const unitStatsSchema = z.object({
  hp: z.number(),
  armor: z.number(),
  mr: z.number(),
  ad: z.number(),
  as: z.number(),
  range: z.number(),
});

// One entry per ability variable; `value` is indexed by star level (CDragon's real shape —
// a flat Record<string, number> can't express star-level scaling). Resolving a variable to a
// specific star level is Phase 1.4's job, not parsing's.
export const unitAbilityVariableSchema = z.object({
  name: z.string(),
  value: z.array(z.number()),
});

export type UnitAbilityVariable = z.infer<typeof unitAbilityVariableSchema>;

export const unitAbilitySchema = z.object({
  name: z.string(),
  mana: z.number(),
  variables: z.array(unitAbilityVariableSchema),
});

export const unitSchema = z.object({
  apiName: z.string(),
  name: z.string(),
  cost: z.number().int().min(1).max(5),
  traits: z.array(z.string()),
  stats: unitStatsSchema,
  ability: unitAbilitySchema,
});

export type Unit = z.infer<typeof unitSchema>;

export function parseUnit(input: unknown): Unit {
  return unitSchema.parse(input);
}
