import { describe, expect, it } from 'vitest';
import { createRedactor, REDACTED_PUUID_PREFIX } from '../redact';

const realPuuid = (seed: string) => seed.repeat(78).slice(0, 78);

describe('createRedactor', () => {
  it('replaces a PUUID with a fake one of the same length', () => {
    const redact = createRedactor();

    const fake = redact(realPuuid('a'));

    expect(fake).toHaveLength(78);
    expect(fake.startsWith(REDACTED_PUUID_PREFIX)).toBe(true);
  });

  it('maps the same real PUUID to the same fake one everywhere, so cross-references survive', () => {
    const redact = createRedactor();
    const puuid = realPuuid('a');

    const account = redact({ puuid });
    const match = redact({ metadata: { participants: [realPuuid('b'), puuid] } });

    expect(match.metadata.participants[1]).toBe(account.puuid);
  });

  it('maps different real PUUIDs to different fake ones', () => {
    const redact = createRedactor();

    const [a, b] = redact([realPuuid('a'), realPuuid('b')]);

    expect(a).not.toBe(b);
  });

  it('replaces player names and tags on the known Riot keys only', () => {
    const redact = createRedactor();

    const redacted = redact({
      gameName: 'RealName',
      tagLine: '8694',
      riotIdGameName: 'AnotherReal',
      riotIdTagline: '1234',
      queueType: 'RANKED_TFT',
    });

    expect(redacted).toEqual({
      gameName: 'Player1',
      tagLine: 'EUW',
      riotIdGameName: 'Player2',
      riotIdTagline: 'EUW',
      queueType: 'RANKED_TFT',
    });
  });

  it('leaves non-identifying data untouched and does not mutate its input', () => {
    const redact = createRedactor();
    const input = { placement: 1, units: [{ character_id: 'DA_18_Alistar', tier: 2 }] };

    const output = redact(input);

    expect(output).toEqual(input);
    expect(output).not.toBe(input);
  });
});
