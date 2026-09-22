import { buildPatchCalendar, type Clock, type PatchWindow } from '@xd-tactics/domain';
import { fetchPatchVersions, toDistinctPatches } from './fetchPatchVersions';

// The one place I/O (fetching the version list) and the pure domain calendar meet — an adapter
// at the edge, per the CODEX. Everything before this line can be tested with a fixture;
// everything after (buildPatchCalendar) is already tested without one.
export async function getPatchCalendar(
  fetchFn: typeof fetch = fetch,
  clock: Clock = { now: Date.now, sleep: () => Promise.resolve() },
): Promise<PatchWindow[]> {
  const versions = await fetchPatchVersions(fetchFn);
  return buildPatchCalendar(toDistinctPatches(versions), clock.now());
}
