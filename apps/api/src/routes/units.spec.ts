import { unitSchema } from '@xd-tactics/domain';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { buildApp } from '../app';

describe('GET /static/units', () => {
  it('returns a zod-valid list of every mocked unit', async () => {
    const app = buildApp();

    const response = await app.inject({ method: 'GET', url: '/static/units' });

    const units = z.array(unitSchema).parse(response.json());
    expect(units.length).toBeGreaterThan(0);
  });
});

describe('GET /static/units/:apiName', () => {
  it('returns the matching unit', async () => {
    const app = buildApp();

    const response = await app.inject({ method: 'GET', url: '/static/units/DA_Gromp18_AP' });

    const unit = unitSchema.parse(response.json());
    expect(unit.name).toBe('Gromp');
  });

  it('404s for an unknown apiName', async () => {
    const app = buildApp();

    const response = await app.inject({ method: 'GET', url: '/static/units/NOPE' });

    expect(response.statusCode).toBe(404);
  });
});
