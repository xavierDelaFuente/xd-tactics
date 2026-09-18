import { itemSchema, traitSchema, unitSchema } from '@xd-tactics/domain';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { buildApp } from '../app';

describe('GET /static/units', () => {
  it('returns a zod-valid, non-empty list', async () => {
    const app = buildApp();

    const response = await app.inject({ method: 'GET', url: '/static/units' });

    const list = z.array(unitSchema).parse(response.json());
    expect(list.length).toBeGreaterThan(0);
  });
});

describe.each([
  {
    path: '/static/items',
    schema: itemSchema,
    knownApiName: 'TFT_Item_ForceOfNature',
    knownName: "Tactician's Crown",
  },
  {
    path: '/static/traits',
    schema: traitSchema,
    knownApiName: 'DA_18_Elderwood',
    knownName: 'Elderwood',
  },
])('GET $path', ({ path, schema, knownApiName, knownName }) => {
  it('returns a zod-valid, non-empty list', async () => {
    const app = buildApp();

    const response = await app.inject({ method: 'GET', url: path });

    const list = z.array(schema).parse(response.json());
    expect(list.length).toBeGreaterThan(0);
  });

  it('returns the matching entity by apiName', async () => {
    const app = buildApp();

    const response = await app.inject({ method: 'GET', url: `${path}/${knownApiName}` });

    const entity = schema.parse(response.json()) as { name: string };
    expect(entity.name).toBe(knownName);
  });

  it('404s for an unknown apiName', async () => {
    const app = buildApp();

    const response = await app.inject({ method: 'GET', url: `${path}/NOPE` });

    expect(response.statusCode).toBe(404);
  });
});
