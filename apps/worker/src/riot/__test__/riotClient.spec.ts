import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, vi } from 'vitest';
import { createRiotClient } from '../riotClient';

// Contract tests: the client is exercised against *recorded* Riot responses (see
// ../fixtures/README.md) through an injected fetch. Nothing here touches the network.

const fixture = (name: string) =>
  JSON.parse(
    readFileSync(fileURLToPath(new URL(`../fixtures/${name}.json`, import.meta.url)), 'utf8'),
  );

const json = (body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body), { status: 200, ...init });
const status = (code: number, headers: Record<string, string> = {}) =>
  new Response(null, { status: code, headers });

function setup(...responses: Response[]) {
  const calls: string[] = []; // interleaved log of 'acquire' / 'fetch', to prove ordering
  const fetchFn = vi.fn<typeof fetch>(async () => {
    calls.push('fetch');
    const next = responses.shift();
    if (!next) throw new Error('unexpected extra request');
    return next;
  });
  const limiter = {
    acquire: vi.fn(async () => {
      calls.push('acquire');
    }),
  };
  const clock = { now: () => 0, sleep: vi.fn(async () => {}) };
  const client = createRiotClient({
    apiKey: 'test-key',
    platform: 'euw1',
    region: 'europe',
    fetch: fetchFn,
    limiter,
    clock,
  });
  return { client, fetchFn, limiter, clock, calls };
}

const account = fixture('account');
const matchFixture = fixture('match');

describe('requests', () => {
  it('sends the API key and uses the regional host for match ids', async () => {
    const { client, fetchFn } = setup(json(fixture('match-ids')));

    await client.getMatchIds(account.puuid, { count: 5 });

    const [url, init] = fetchFn.mock.calls[0] ?? [];
    expect(url).toBe(
      `https://europe.api.riotgames.com/tft/match/v1/matches/by-puuid/${account.puuid}/ids?count=5`,
    );
    expect(new Headers(init?.headers).get('X-Riot-Token')).toBe('test-key');
  });

  it('uses the platform host for league entries', async () => {
    const { client, fetchFn } = setup(json(fixture('league-page')));

    await client.getLeagueEntries({ tier: 'DIAMOND', division: 'I', page: 1 });

    expect(fetchFn.mock.calls[0]?.[0]).toBe(
      'https://euw1.api.riotgames.com/tft/league/v1/entries/DIAMOND/I?queue=RANKED_TFT&page=1',
    );
  });

  it('waits on the rate limiter before every request', async () => {
    const { client, calls } = setup(json(fixture('match-ids')));

    await client.getMatchIds(account.puuid);

    expect(calls).toEqual(['acquire', 'fetch']);
  });
});

describe('parsing recorded responses into domain types', () => {
  it('resolves an account by Riot ID', async () => {
    const { client } = setup(json(account));

    const result = await client.getAccountByRiotId('Player1', 'EUW');

    expect(result).toEqual({
      ok: true,
      value: { puuid: account.puuid, gameName: account.gameName, tagLine: account.tagLine },
    });
  });

  it('returns match ids as a list of strings', async () => {
    const { client } = setup(json(fixture('match-ids')));

    const result = await client.getMatchIds(account.puuid);

    expect(result).toEqual({ ok: true, value: fixture('match-ids') });
  });

  it('parses a match into camelCase domain types with all 8 placements', async () => {
    const { client } = setup(json(matchFixture));

    const result = await client.getMatch(matchFixture.metadata.match_id);

    if (!result.ok) throw new Error('expected a match');
    const { match } = result.value;
    expect(match.id).toBe(matchFixture.metadata.match_id);
    expect(match.participants.map((p) => p.placement).sort()).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    const first = match.participants[0];
    expect(first).toMatchObject({
      puuid: matchFixture.info.participants[0].puuid,
      goldLeft: matchFixture.info.participants[0].gold_left,
      level: matchFixture.info.participants[0].level,
    });
    expect(first?.units[0]).toMatchObject({
      characterId: matchFixture.info.participants[0].units[0].character_id,
      tier: matchFixture.info.participants[0].units[0].tier,
    });
    expect(first?.traits[0]).toMatchObject({
      name: matchFixture.info.participants[0].traits[0].name,
      tierCurrent: matchFixture.info.participants[0].traits[0].tier_current,
    });
  });

  it('hands back the raw payload untouched, so the raw store can keep it verbatim', async () => {
    const { client } = setup(json(matchFixture));

    const result = await client.getMatch(matchFixture.metadata.match_id);

    if (!result.ok) throw new Error('expected a match');
    expect(result.value.raw).toEqual(matchFixture);
  });

  it('parses league entries', async () => {
    const { client } = setup(json(fixture('league-page')));

    const result = await client.getLeagueEntries({ tier: 'DIAMOND', division: 'I', page: 1 });

    if (!result.ok) throw new Error('expected entries');
    expect(result.value).toHaveLength(5);
    expect(result.value[0]).toMatchObject({ tier: 'DIAMOND', rank: 'I', queueType: 'RANKED_TFT' });
  });

  it('fails loudly, not silently, when Riot changes the shape of a match', async () => {
    const { client } = setup(json({ metadata: { match_id: 'EUW1_1' }, info: {} }));

    await expect(client.getMatch('EUW1_1')).rejects.toThrow();
  });
});

describe('failure modes', () => {
  it('returns a typed not-found on 404 instead of throwing', async () => {
    const { client } = setup(status(404));

    const result = await client.getMatch('EUW1_0');

    expect(result).toEqual({ ok: false, reason: 'not-found' });
  });

  it.each([401, 403])('returns a typed unauthorized on %i — an expired dev key', async (code) => {
    const { client } = setup(status(code));

    const result = await client.getMatchIds(account.puuid);

    expect(result).toEqual({ ok: false, reason: 'unauthorized' });
  });

  it('backs off for Retry-After seconds on a 429, then retries and succeeds', async () => {
    const { client, clock, limiter } = setup(
      status(429, { 'Retry-After': '2' }),
      json(fixture('match-ids')),
    );

    const result = await client.getMatchIds(account.puuid);

    expect(result).toEqual({ ok: true, value: fixture('match-ids') });
    expect(clock.sleep).toHaveBeenCalledWith(2000);
    expect(limiter.acquire).toHaveBeenCalledTimes(2); // the retry goes back through the limiter
  });

  it('gives up with a typed rate-limited result after maxRetries consecutive 429s', async () => {
    const { client, fetchFn } = setup(
      ...Array.from({ length: 4 }, () => status(429, { 'Retry-After': '1' })),
    );

    const result = await client.getMatchIds(account.puuid);

    expect(result).toEqual({ ok: false, reason: 'rate-limited' });
    expect(fetchFn).toHaveBeenCalledTimes(4); // the first attempt + 3 retries
  });
});
