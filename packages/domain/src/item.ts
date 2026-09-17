import { z } from 'zod';

export const itemSchema = z.object({
  apiName: z.string(),
  name: z.string(),
  unique: z.boolean(),
  associatedTraits: z.array(z.string()),
  composition: z.array(z.string()),
});

export type Item = z.infer<typeof itemSchema>;

export function parseItem(input: unknown): Item {
  return itemSchema.parse(input);
}
