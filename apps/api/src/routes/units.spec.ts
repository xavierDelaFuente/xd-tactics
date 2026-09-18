import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import type { Database } from '@xd-tactics/db';
import { syncUnitsForPatch } from '@xd-tactics/db';
import {
  clearDbAfterTest,
  configureDbForTest,
  fixtureUnit,
  stopContainerAfterTest,
} from '@xd-tactics/db/test-utils';
import type { Kysely } from 'kysely';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from '../app';

describe('GET /static/units/:apiName', () => {
  let container: StartedPostgreSqlContainer;
  let db: Kysely<Database>;

  beforeAll(async () => {
    ({ db, container } = await configureDbForTest());

    await syncUnitsForPatch(db, '15.1', [
      fixtureUnit({
        ability: {
          name: 'Get Excited!',
          mana: 50,
          variables: [{ name: 'Damage', value: [100, 150, 200] }],
        },
      }),
    ]);
  }, 60_000);

  afterAll(async () => {
    await clearDbAfterTest(db);
    await stopContainerAfterTest(container);
  });

  it('returns the unit for the given patch with variables resolved to star 1 by default', async () => {
    const app = buildApp(db);

    const response = await app.inject({
      method: 'GET',
      url: '/static/units/TFT15_Jinx?patch=15.1',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().ability.variables).toEqual({ Damage: 100 });
  });

  it('resolves variables to the requested star level', async () => {
    const app = buildApp(db);

    const response = await app.inject({
      method: 'GET',
      url: '/static/units/TFT15_Jinx?patch=15.1&star=3',
    });

    expect(response.json().ability.variables).toEqual({ Damage: 200 });
  });

  it('400s when patch is missing', async () => {
    const app = buildApp(db);

    const response = await app.inject({ method: 'GET', url: '/static/units/TFT15_Jinx' });

    expect(response.statusCode).toBe(400);
  });

  it('404s for a unit that was never synced under that patch', async () => {
    const app = buildApp(db);

    const response = await app.inject({
      method: 'GET',
      url: '/static/units/TFT15_Jinx?patch=99.9',
    });

    expect(response.statusCode).toBe(404);
  });

  it('falls back to star 1 for a non-numeric star value instead of returning NaN-corrupted data', async () => {
    const app = buildApp(db);

    const response = await app.inject({
      method: 'GET',
      url: '/static/units/TFT15_Jinx?patch=15.1&star=abc',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().ability.variables).toEqual({ Damage: 100 });
  });
});
