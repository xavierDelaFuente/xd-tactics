import type { ExplorerRow } from '@xd-tactics/contracts';
import Fastify from 'fastify';
import { getAllUnits, getUnitByApiName } from './static/units';

const HARDCODED_ROW: ExplorerRow = {
  key: 'TFT15_Jinx',
  name: 'Jinx',
  n: 1,
  avgPlace: 4.5,
  top4: 0.55,
  win: 0.12,
};

export function buildApp() {
  const app = Fastify();

  app.get('/explorer', async (): Promise<ExplorerRow[]> => [HARDCODED_ROW]);

  app.get('/static/units', async () => getAllUnits());

  app.get<{ Params: { apiName: string } }>('/static/units/:apiName', async (request, reply) => {
    const unit = getUnitByApiName(request.params.apiName);
    if (!unit) {
      return reply.code(404).send({ error: 'unit not found' });
    }
    return unit;
  });

  return app;
}
