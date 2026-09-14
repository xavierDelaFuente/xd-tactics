import { explorerResponseSchema } from '@xd-tactics/contracts';
import { describe, expect, it } from 'vitest';
import { buildApp } from '../app';

describe('GET /explorer', () => {
  it('returns a zod-valid payload with exactly one row', async () => {
    const app = buildApp();

    const response = await app.inject({ method: 'GET', url: '/explorer?pivot=unit' });

    const body = explorerResponseSchema.parse(response.json());
    expect(body).toHaveLength(1);
  });
});
