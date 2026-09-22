import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { REDACTED_PUUID_PREFIX } from '../redact';

// The repo is public and these files are recorded from the live Riot API. This guard fails if a
// raw (un-redacted) recording is ever committed — e.g. re-recorded by hand, bypassing recordFixtures.
const fixturesDir = fileURLToPath(new URL('../fixtures/', import.meta.url));
const fixtures = readdirSync(fixturesDir)
  .filter((file) => file.endsWith('.json'))
  .map((file) => ({ file, text: readFileSync(`${fixturesDir}${file}`, 'utf8') }));

describe('recorded Riot fixtures', () => {
  it('contain no real PUUIDs — every 78-character id is a redacted placeholder', () => {
    for (const { file, text } of fixtures) {
      const ids = text.match(/"[A-Za-z0-9_-]{78}"/g) ?? [];
      const real = ids.filter((id) => !id.startsWith(`"${REDACTED_PUUID_PREFIX}`));

      expect(real, `${file} holds an un-redacted PUUID`).toEqual([]);
    }
  });

  it('contain no real player names — only Player<N> placeholders', () => {
    for (const { file, text } of fixtures) {
      const names = [...text.matchAll(/"(?:gameName|riotIdGameName)":\s*"([^"]+)"/g)].map(
        (match) => match[1],
      );
      const real = names.filter((name) => !/^Player\d+$/.test(name ?? ''));

      expect(real, `${file} holds an un-redacted player name`).toEqual([]);
    }
  });
});
