import { z } from 'zod';

// One player's standing in one ranked queue. Riot returns more (veteran, hotStreak, ...); only
// what the crawl needs is kept — a seed list of players to pull matches for.
export const leagueEntrySchema = z.object({
  puuid: z.string(),
  queueType: z.string(),
  tier: z.string(),
  rank: z.string(),
  leaguePoints: z.number().int(),
  wins: z.number().int(),
  losses: z.number().int(),
});

export type LeagueEntry = z.infer<typeof leagueEntrySchema>;

export function parseLeagueEntry(input: unknown): LeagueEntry {
  return leagueEntrySchema.parse(input);
}
