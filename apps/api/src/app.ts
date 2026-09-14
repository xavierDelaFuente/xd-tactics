import type { ExplorerRow } from '@xd-tactics/contracts';
import Fastify from 'fastify';

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

  return app;
}
