import { matchSchema } from '@xd-tactics/domain';
import { z } from 'zod';

// Riot's raw TFT match shape (snake_case, as recorded in ./fixtures/match.json). This is the
// only place that knows those names: a rename upstream breaks this file and nothing inside.
// Fields we don't use are ignored; fields we do use are required, so a schema change fails
// loudly here instead of surfacing three layers later as `undefined`.
const rawMatchSchema = z.object({
  metadata: z.object({ match_id: z.string() }),
  info: z.object({
    game_datetime: z.number(),
    game_version: z.string(),
    queue_id: z.number(),
    tft_set_number: z.number(),
    participants: z.array(
      z.object({
        puuid: z.string(),
        placement: z.number(),
        level: z.number(),
        gold_left: z.number(),
        units: z.array(
          z.object({
            character_id: z.string(),
            tier: z.number(),
            itemNames: z.array(z.string()),
          }),
        ),
        traits: z.array(
          z.object({
            name: z.string(),
            num_units: z.number(),
            style: z.number(),
            tier_current: z.number(),
            tier_total: z.number(),
          }),
        ),
      }),
    ),
  }),
});

// raw Riot shape -> the domain's camelCase shape -> validated by the domain's own schema.
export const riotMatchSchema = rawMatchSchema
  .transform((raw) => ({
    id: raw.metadata.match_id,
    gameDatetime: raw.info.game_datetime,
    gameVersion: raw.info.game_version,
    queueId: raw.info.queue_id,
    setNumber: raw.info.tft_set_number,
    participants: raw.info.participants.map((p) => ({
      puuid: p.puuid,
      placement: p.placement,
      level: p.level,
      goldLeft: p.gold_left,
      units: p.units.map((u) => ({
        characterId: u.character_id,
        tier: u.tier,
        itemNames: u.itemNames,
      })),
      traits: p.traits.map((t) => ({
        name: t.name,
        numUnits: t.num_units,
        style: t.style,
        tierCurrent: t.tier_current,
        tierTotal: t.tier_total,
      })),
    })),
  }))
  .pipe(matchSchema);
