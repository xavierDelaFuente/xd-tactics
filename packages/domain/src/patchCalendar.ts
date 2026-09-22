export interface PatchWindow {
  patch: string;
  startsAt: number;
}

// Riot exposes no patch release dates anywhere (checked: Data Dragon's versions.json, its
// realms endpoint, CDragon's content-metadata.json — none carry a date). This approximates each
// patch's start by counting backward from `referenceNow` in `cadenceDays` steps over an
// ordered, most-recent-first version list. TFT patches are *roughly* biweekly — a behaviour,
// not a rule — so these boundaries are a deliberate approximation, not ground truth. Acceptable
// for a learning project with thin sample sizes anyway; revisit only if exact boundaries start
// to matter.
export function buildPatchCalendar(
  versionsNewestFirst: string[],
  referenceNow: number,
  cadenceDays = 14,
): PatchWindow[] {
  const cadenceMs = cadenceDays * 24 * 60 * 60 * 1000;
  return versionsNewestFirst.map((patch, i) => ({
    patch,
    startsAt: referenceNow - i * cadenceMs,
  }));
}

// The latest window whose start is at or before `gameDatetime` — i.e. the most recent patch
// that had already shipped when the match was played. A match older than every window in the
// calendar returns undefined rather than a guess: a refusal, not a wrong answer.
export function patchForDate(calendar: PatchWindow[], gameDatetime: number): string | undefined {
  return calendar
    .filter((window) => window.startsAt <= gameDatetime)
    .reduce<PatchWindow | undefined>(
      (latest, window) => (!latest || window.startsAt > latest.startsAt ? window : latest),
      undefined,
    )?.patch;
}
