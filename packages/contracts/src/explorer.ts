import { z } from 'zod';

export const explorerRowSchema = z.object({
  key: z.string(),
  name: z.string(),
  n: z.number().int().nonnegative(),
  avgPlace: z.number(),
  top4: z.number(),
  win: z.number(),
});

export type ExplorerRow = z.infer<typeof explorerRowSchema>;

export const explorerResponseSchema = z.array(explorerRowSchema);

export type ExplorerResponse = z.infer<typeof explorerResponseSchema>;
