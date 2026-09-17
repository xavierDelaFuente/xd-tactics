# CDragon fixtures

Recorded from the real source, per the CODEX's External data rules — never hand-authored, never
fetched in a test.

## `cdragon-set18.sample.json`

- **Source**: `https://raw.communitydragon.org/latest/cdragon/tft/en_us.json`
- **Recorded**: 2026-09-16
- **Scope**: the full `champions`, `traits` arrays and the `items` referenced by `set.items` for
  the live set at recording time (`mutator: TFTSet18`, set number 18). The source dump also
  contains every historical set (~24 MB); this fixture is narrowed to one set, per the "crawl
  narrow" constraint in `.mentor/PROJECT.md`.
- **Deliberately not cleaned.** It still contains the two placeholder items with `name: null`
  (`TFT_Item_Blank`, an unused augment slot) and a champion with `damage: null`
  (`DA_18_Kayle`, apparently unreleased at recording time). The adapter is expected to filter
  these — that's exactly what its test proves.

### Re-recording

```bash
curl -s https://raw.communitydragon.org/latest/cdragon/tft/en_us.json -o /tmp/cdragon-tft.json
node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('/tmp/cdragon-tft.json', 'utf8'));
const set = data.setData.find(s => s.mutator === '<current mutator, e.g. TFTSet19>');
const itemNames = new Set(set.items);
const fixture = {
  set: { number: set.number, mutator: set.mutator, name: set.name },
  champions: set.champions,
  traits: set.traits,
  items: data.items.filter(i => itemNames.has(i.apiName)),
};
fs.writeFileSync('cdragon-set<N>.sample.json', JSON.stringify(fixture, null, 2));
"
```

Find the current mutator by listing `data.setData.map(s => s.mutator)` and picking the entry with
no `_PVEMODE` / `_PAIRS` / `_TURBO` / `_Evolved` suffix and the highest `number`. Review the diff
like code — a shape change here is the early warning that CDragon's schema moved.
