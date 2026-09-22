import { describe, expect, it } from 'vitest';
import { buildPatchCalendar, patchForDate } from '../patchCalendar';

const DAY = 24 * 60 * 60 * 1000;
const NOW = 1_700_000_000_000;

describe('buildPatchCalendar', () => {
  it('spaces windows cadenceDays apart, most-recent version starting at referenceNow', () => {
    const calendar = buildPatchCalendar(['26.3', '26.2', '26.1'], NOW, 14);

    expect(calendar).toEqual([
      { patch: '26.3', startsAt: NOW },
      { patch: '26.2', startsAt: NOW - 14 * DAY },
      { patch: '26.1', startsAt: NOW - 28 * DAY },
    ]);
  });

  it('defaults to a 14-day cadence', () => {
    const calendar = buildPatchCalendar(['26.2', '26.1'], NOW);

    expect(calendar[1]?.startsAt).toBe(NOW - 14 * DAY);
  });
});

describe('patchForDate', () => {
  const calendar = buildPatchCalendar(['26.3', '26.2', '26.1'], NOW, 14);

  it('assigns a match played exactly on a patch boundary to that patch', () => {
    expect(patchForDate(calendar, NOW - 14 * DAY)).toBe('26.2');
  });

  it('assigns a match played between two boundaries to the later (already-shipped) patch', () => {
    // 26.2 starts 14 days ago and 26.3 starts now — 7 days ago falls between the two, so it's
    // 26.2, not 26.3 (which hadn't shipped yet) and not 26.1 (already superseded).
    expect(patchForDate(calendar, NOW - 7 * DAY)).toBe('26.2');
  });

  it('assigns a match newer than every window to the current (most recent) patch', () => {
    expect(patchForDate(calendar, NOW + 5 * DAY)).toBe('26.3');
  });

  it('returns undefined for a match older than the calendar goes back — refuses, does not guess', () => {
    expect(patchForDate(calendar, NOW - 100 * DAY)).toBeUndefined();
  });

  it('does not require the calendar to be pre-sorted', () => {
    const shuffled = [calendar[1], calendar[2], calendar[0]].filter((w) => w !== undefined);

    expect(patchForDate(shuffled, NOW - 7 * DAY)).toBe('26.2');
  });
});
