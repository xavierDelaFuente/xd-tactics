import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, vi } from 'vitest';
import { fetchPatchVersions, normalizePatch, toDistinctPatches } from '../fetchPatchVersions';

// Contract test against a recorded response (see ../fixtures/README.md) through an injected
// fetch. Nothing here touches the network.
const fixture = JSON.parse(
  readFileSync(fileURLToPath(new URL('../fixtures/versions.json', import.meta.url)), 'utf8'),
);

describe('fetchPatchVersions', () => {
  it('parses the recorded Data Dragon response into a list of version strings', async () => {
    const fetchFn = vi.fn(async () => new Response(JSON.stringify(fixture)));

    const versions = await fetchPatchVersions(fetchFn);

    expect(versions).toEqual(fixture);
    expect(fetchFn).toHaveBeenCalledWith('https://ddragon.leagueoflegends.com/api/versions.json');
  });

  it('throws on a non-OK response rather than returning an empty list silently', async () => {
    const fetchFn = vi.fn(async () => new Response(null, { status: 500 }));

    await expect(fetchPatchVersions(fetchFn)).rejects.toThrow();
  });
});

describe('normalizePatch', () => {
  it('drops the build/hotfix segment', () => {
    expect(normalizePatch('16.18.1')).toBe('16.18');
  });
});

describe('toDistinctPatches', () => {
  it('collapses consecutive hotfixes of the same patch to one entry, preserving order', () => {
    expect(toDistinctPatches(['16.18.2', '16.18.1', '16.17.1'])).toEqual(['16.18', '16.17']);
  });

  it('matches the real recorded list one-to-one when there are no hotfix duplicates', () => {
    // Every entry in the current recording happens to be a first release (".1"), so this is
    // also a live check that normalization doesn't accidentally merge distinct real patches.
    expect(toDistinctPatches(fixture)).toHaveLength(fixture.length);
  });
});
