import { z } from 'zod';

const versionsSchema = z.array(z.string());

export async function fetchPatchVersions(fetchFn: typeof fetch = fetch): Promise<string[]> {
  const response = await fetchFn('https://ddragon.leagueoflegends.com/api/versions.json');
  if (!response.ok) {
    throw new Error(`Data Dragon responded ${response.status}`);
  }
  return versionsSchema.parse(await response.json());
}

// "16.18.1" -> "16.18". The trailing segment is a build/hotfix number, not a new patch — folding
// it away here (not in the domain calendar, which just takes whatever list it's given) is where
// "what counts as one patch" is decided, right at the edge where Data Dragon's shape is read.
export function normalizePatch(version: string): string {
  const [major, minor] = version.split('.');
  return `${major}.${minor}`;
}

// Consecutive duplicates only: two hotfixes of the same patch collapse to one window, but two
// genuinely different patches that happen to share a normalized form (should never happen, but
// isn't assumed) stay distinct.
export function toDistinctPatches(versionsNewestFirst: string[]): string[] {
  const normalized = versionsNewestFirst.map(normalizePatch);
  return normalized.filter((patch, i) => patch !== normalized[i - 1]);
}
