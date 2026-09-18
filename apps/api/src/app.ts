import type { ExplorerRow } from '@xd-tactics/contracts';
import Fastify, { type FastifyInstance } from 'fastify';
import {
  getAllItems,
  getAllTraits,
  getAllUnits,
  getItemByApiName,
  getTraitByApiName,
  getUnitByApiName,
} from './static/setData';

const HARDCODED_ROW: ExplorerRow = {
  key: 'TFT15_Jinx',
  name: 'Jinx',
  n: 1,
  avgPlace: 4.5,
  top4: 0.55,
  win: 0.12,
};

// Units, items and traits are all "look up by apiName, or list everything" — same shape,
// registered once instead of three times.
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

export function buildApp() {
  const app = Fastify();

  app.get('/explorer', async (): Promise<ExplorerRow[]> => [HARDCODED_ROW]);

  registerStaticResource(app, '/static/units', getAllUnits, getUnitByApiName);
  registerStaticResource(app, '/static/items', getAllItems, getItemByApiName);
  registerStaticResource(app, '/static/traits', getAllTraits, getTraitByApiName);

  return app;
}
