import { z } from 'zod';

export const matchUnitSchema = z.object({
  characterId: z.string(),
  tier: z.number().int(),
  itemNames: z.array(z.string()),
});

export const matchTraitSchema = z.object({
  name: z.string(),
  numUnits: z.number().int(),
  style: z.number().int(),
  tierCurrent: z.number().int(),
  tierTotal: z.number().int(),
});

export const participantSchema = z.object({
  puuid: z.string(),
  placement: z.number().int().min(1).max(8),
  level: z.number().int(),
  goldLeft: z.number().int(),
  units: z.array(matchUnitSchema),
  traits: z.array(matchTraitSchema),
});

export const matchSchema = z.object({
  id: z.string(),
  gameDatetime: z.number(),
  // Kept as Riot sends it, but do NOT read a patch out of this: on the real data it is the
  // placeholder "TFT Unreal Version ?.?.?.?". Which patch a match belongs to is an open
  // question (.mentor/PROJECT.md, Open Question 6) — that's why gameDatetime is kept too.
  gameVersion: z.string(),
  queueId: z.number().int(),
  setNumber: z.number().int(),
  participants: z.array(participantSchema),
});

export type MatchUnit = z.infer<typeof matchUnitSchema>;
export type MatchTrait = z.infer<typeof matchTraitSchema>;
export type Participant = z.infer<typeof participantSchema>;
export type Match = z.infer<typeof matchSchema>;

export function parseMatch(input: unknown): Match {
  return matchSchema.parse(input);
}
