import { z } from 'zod';

export const traitTierSchema = z.object({
  minUnits: z.number().int(),
  maxUnits: z.number().int(),
  style: z.number().int(),
});

export const traitSchema = z.object({
  apiName: z.string(),
  name: z.string(),
  tiers: z.array(traitTierSchema),
});

export type Trait = z.infer<typeof traitSchema>;

export function parseTrait(input: unknown): Trait {
  return traitSchema.parse(input);
}
