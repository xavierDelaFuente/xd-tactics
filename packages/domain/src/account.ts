import { z } from 'zod';

export const accountSchema = z.object({
  puuid: z.string(),
  gameName: z.string(),
  tagLine: z.string(),
});

export type Account = z.infer<typeof accountSchema>;

export function parseAccount(input: unknown): Account {
  return accountSchema.parse(input);
}
