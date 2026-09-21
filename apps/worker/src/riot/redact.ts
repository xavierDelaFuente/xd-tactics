// Recorded Riot responses go into a public repo, so player identities are replaced before they
// are written to disk. The replacement keeps the *shape* (a PUUID stays 78 chars, names stay
// strings) and is consistent within one recording run — the same real PUUID always maps to the
// same fake one across every fixture, so cross-references (an account's puuid appearing in a
// match's participants) still line up.

const PUUID_PATTERN = /^[A-Za-z0-9_-]{78}$/;
const NAME_KEYS = new Set(['gameName', 'riotIdGameName']);
const TAG_KEYS = new Set(['tagLine', 'riotIdTagline']);

export const REDACTED_PUUID_PREFIX = 'REDACTED_';

export function createRedactor() {
  const puuids = new Map<string, string>();
  const names = new Map<string, string>();

  const fakePuuid = (real: string): string => {
    let fake = puuids.get(real);
    if (!fake) {
      fake = `${REDACTED_PUUID_PREFIX}${puuids.size + 1}`.padEnd(78, '_');
      puuids.set(real, fake);
    }
    return fake;
  };

  const fakeName = (real: string): string => {
    let fake = names.get(real);
    if (!fake) {
      fake = `Player${names.size + 1}`;
      names.set(real, fake);
    }
    return fake;
  };

  function redact<T>(value: T): T {
    return walk(value) as T;
  }

  function walk(value: unknown, key?: string): unknown {
    if (typeof value === 'string') {
      if (PUUID_PATTERN.test(value)) return fakePuuid(value);
      if (key && NAME_KEYS.has(key)) return fakeName(value);
      if (key && TAG_KEYS.has(key)) return 'EUW';
      return value;
    }
    if (Array.isArray(value)) return value.map((item) => walk(item));
    if (value !== null && typeof value === 'object') {
      return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, walk(v, k)]));
    }
    return value;
  }

  return redact;
}
