import type { ExplorerRow } from '@xd-tactics/contracts';
import type { Database } from '@xd-tactics/db';
import { getUnit } from '@xd-tactics/db';
import { resolveAbilityVariables } from '@xd-tactics/domain';
import Fastify, { type FastifyInstance } from 'fastify';
import type { Kysely } from 'kysely';
import {
  getAllItems,
  getAllTraits,
  getAllUnits,
  getItemByApiName,
  getTraitByApiName,
} from './static/setData';

const HARDCODED_ROW: ExplorerRow = {
  key: 'TFT15_Jinx',
  name: 'Jinx',
  n: 1,
  avgPlace: 4.5,
  top4: 0.55,
  win: 0.12,
};

// Items and traits are "look up by apiName, or list everything" — same shape, registered once
// instead of twice. Units diverges: its single-entity route is patch/star-aware and reads from
// Postgres, not the static mock, so it gets its own registration below.
function registerStaticResource<T>(
  app: FastifyInstance,
  path: string,
  getAll: () => T[],
  getByApiName: (apiName: string) => T | undefined,
) {
  app.get(path, async () => getAll());

  app.get<{ Params: { apiName: string } }>(`${path}/:apiName`, async (request, reply) => {
    const entity = getByApiName(request.params.apiName);
    if (!entity) {
      return reply.code(404).send({ error: 'not found' });
    }
    return entity;
  });
}

function parseStarLevel(star: string | undefined): number {
  const parsed = Number(star);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export function buildApp(db?: Kysely<Database>) {
  const app = Fastify();

  app.get('/explorer', async (): Promise<ExplorerRow[]> => [HARDCODED_ROW]);

  app.get('/static/units', async () => getAllUnits());

  app.get<{ Params: { apiName: string }; Querystring: { patch?: string; star?: string } }>(
    '/static/units/:apiName',
    async (request, reply) => {
      const { patch, star } = request.query;
      if (!patch) {
        return reply.code(400).send({ error: 'patch query param is required' });
      }
      if (!db) {
        return reply.code(500).send({ error: 'database not configured' });
      }

      const unit = await getUnit(db, request.params.apiName, patch);
      if (!unit) {
        return reply.code(404).send({ error: 'not found' });
      }

      return {
        ...unit,
        ability: {
          name: unit.ability.name,
          mana: unit.ability.mana,
          variables: resolveAbilityVariables(unit.ability.variables, parseStarLevel(star)),
        },
      };
    },
  );

  registerStaticResource(app, '/static/items', getAllItems, getItemByApiName);
  registerStaticResource(app, '/static/traits', getAllTraits, getTraitByApiName);

  return app;
}
