import {
  type Account,
  accountSchema,
  type Clock,
  type LeagueEntry,
  leagueEntrySchema,
  type Match,
  type RateLimiter,
} from '@xd-tactics/domain';
import { z } from 'zod';
import { riotMatchSchema } from './riotSchemas';

// Expected outcomes are values, not exceptions: a missing match or an expired key is something
// the crawl has to *handle*. Anything unexpected (a 5xx, a payload whose shape changed) throws.
export type RiotFailureReason = 'not-found' | 'unauthorized' | 'rate-limited';
export type RiotResult<T> = { ok: true; value: T } | { ok: false; reason: RiotFailureReason };

export class RiotHttpError extends Error {
  constructor(
    readonly status: number,
    readonly path: string,
  ) {
    super(`Riot responded ${status} for ${path}`);
    this.name = 'RiotHttpError';
  }
}

export interface RiotClientOptions {
  apiKey: string;
  /** Platform routing value that serves league data, e.g. `euw1`. */
  platform: string;
  /** Regional routing value that serves account and match data, e.g. `europe`. */
  region: string;
  fetch: typeof fetch;
  limiter: RateLimiter;
  clock: Clock;
  /** How many times a 429 is retried before giving up as `rate-limited`. Default 3. */
  maxRetries?: number;
}

export interface LeagueQuery {
  tier: string;
  division: string;
  page: number;
}

export interface RiotClient {
  getAccountByRiotId(gameName: string, tagLine: string): Promise<RiotResult<Account>>;
  getMatchIds(puuid: string, options?: { count?: number }): Promise<RiotResult<string[]>>;
  /** `raw` is Riot's payload exactly as received, for the raw store (parsed data is derived). */
  getMatch(matchId: string): Promise<RiotResult<{ match: Match; raw: unknown }>>;
  getLeagueEntries(query: LeagueQuery): Promise<RiotResult<LeagueEntry[]>>;
}

const DEFAULT_RETRY_AFTER_SECONDS = 1;

export function createRiotClient(options: RiotClientOptions): RiotClient {
  const { apiKey, platform, region, limiter, clock, maxRetries = 3 } = options;
  const regionalHost = `https://${region}.api.riotgames.com`;
  const platformHost = `https://${platform}.api.riotgames.com`;
  const segment = encodeURIComponent;

  async function request<T>(url: string, parse: (body: unknown) => T): Promise<RiotResult<T>> {
    for (let attempt = 0; ; attempt++) {
      // Every attempt — including a retry after a 429 — goes back through the limiter.
      await limiter.acquire();
      const response = await options.fetch(url, { headers: { 'X-Riot-Token': apiKey } });

      if (response.status === 429) {
        if (attempt >= maxRetries) return { ok: false, reason: 'rate-limited' };
        await clock.sleep(retryAfterMs(response));
        continue;
      }
      if (response.status === 404) return { ok: false, reason: 'not-found' };
      // 401/403 is how an expired development key shows up (they last 24h).
      if (response.status === 401 || response.status === 403) {
        return { ok: false, reason: 'unauthorized' };
      }
      if (!response.ok) throw new RiotHttpError(response.status, new URL(url).pathname);

      return { ok: true, value: parse(await response.json()) };
    }
  }

  return {
    getAccountByRiotId: (gameName, tagLine) =>
      request(
        `${regionalHost}/riot/account/v1/accounts/by-riot-id/${segment(gameName)}/${segment(tagLine)}`,
        (body) => accountSchema.parse(body),
      ),

    getMatchIds: (puuid, { count } = {}) =>
      request(
        `${regionalHost}/tft/match/v1/matches/by-puuid/${segment(puuid)}/ids${
          count === undefined ? '' : `?count=${count}`
        }`,
        (body) => z.array(z.string()).parse(body),
      ),

    getMatch: (matchId) =>
      request(`${regionalHost}/tft/match/v1/matches/${segment(matchId)}`, (body) => ({
        match: riotMatchSchema.parse(body),
        raw: body,
      })),

    getLeagueEntries: ({ tier, division, page }) =>
      request(
        `${platformHost}/tft/league/v1/entries/${segment(tier)}/${segment(division)}?queue=RANKED_TFT&page=${page}`,
        (body) => z.array(leagueEntrySchema).parse(body),
      ),
  };
}

function retryAfterMs(response: Response): number {
  const seconds = Number(response.headers.get('Retry-After'));
  return (Number.isFinite(seconds) && seconds > 0 ? seconds : DEFAULT_RETRY_AFTER_SECONDS) * 1000;
}
