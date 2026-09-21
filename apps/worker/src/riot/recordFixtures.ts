import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createRedactor } from './redact';

// Re-records the Riot fixtures under ./fixtures from the live API, redacting player identities.
// Needs a valid RIOT_API_KEY (development keys expire every 24h — regenerate on the portal).
//
//   pnpm --filter @xd-tactics/worker run record:riot [gameName] [tagLine]
//
// Uses plain fetch on purpose: the fixtures must not depend on the client they are used to test.
// Review the resulting `git diff` like code — a shape change there is the early warning that
// Riot's schema moved.

try {
  process.loadEnvFile(fileURLToPath(new URL('../../../../.env', import.meta.url)));
} catch {
  // .env is optional; RIOT_API_KEY may already be in the environment.
}

const apiKey = process.env.RIOT_API_KEY;
const platform = process.env.RIOT_PLATFORM ?? 'euw1';
const region = process.env.RIOT_REGION ?? 'europe';
const [gameName = 'Asnewyla', tagLine = 'EUW'] = process.argv.slice(2);

if (!apiKey) {
  throw new Error('RIOT_API_KEY is not set — put a fresh development key in .env');
}

const outDir = fileURLToPath(new URL('./fixtures/', import.meta.url));
const redact = createRedactor();
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function get(url: string): Promise<unknown> {
  const response = await fetch(url, { headers: { 'X-Riot-Token': apiKey as string } });
  if (!response.ok) {
    throw new Error(
      `${response.status} ${response.statusText} for ${url.replace(/\/[^/]{60,}/g, '/<puuid>')}`,
    );
  }
  await sleep(200); // stay far inside the 20 req/s dev-key budget
  return response.json();
}

function save(name: string, body: unknown) {
  writeFileSync(`${outDir}${name}.json`, `${JSON.stringify(redact(body), null, 2)}\n`);
  console.log(`recorded ${name}.json`);
}

async function main() {
  mkdirSync(outDir, { recursive: true });
  const regional = `https://${region}.api.riotgames.com`;
  const platformHost = `https://${platform}.api.riotgames.com`;

  const account = (await get(
    `${regional}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
  )) as { puuid: string };

  const matchIds = (await get(
    `${regional}/tft/match/v1/matches/by-puuid/${account.puuid}/ids?count=5`,
  )) as string[];
  const firstMatchId = matchIds[0];
  if (!firstMatchId) throw new Error('that account has no TFT matches to record');

  const match = await get(`${regional}/tft/match/v1/matches/${firstMatchId}`);
  const leaguePage = (await get(
    `${platformHost}/tft/league/v1/entries/DIAMOND/I?queue=RANKED_TFT&page=1`,
  )) as unknown[];

  save('account', account);
  save('match-ids', matchIds);
  save('match', match);
  // A real page holds ~200 entries; a slice of the real array is enough to pin the shape.
  save('league-page', leaguePage.slice(0, 5));
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
