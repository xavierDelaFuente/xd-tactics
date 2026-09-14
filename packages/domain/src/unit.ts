import { z } from 'zod';

export const unitStatsSchema = z.object({
  hp: z.number(),
  armor: z.number(),
  mr: z.number(),
  ad: z.number(),
  as: z.number(),
  range: z.number(),
});

export const unitAbilitySchema = z.object({
  name: z.string(),
  mana: z.number(),
  variables: z.record(z.string(), z.number()),
});

export const unitSchema = z.object({
  apiName: z.string(),
  cost: z.number().int().min(1).max(5),
  traits: z.array(z.string()),
  stats: unitStatsSchema,
  ability: unitAbilitySchema,
});

export type Unit = z.infer<typeof unitSchema>;

export function parseUnit(input: unknown): Unit {
  return unitSchema.parse(input);
}
