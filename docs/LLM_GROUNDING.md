# How the coach avoids hallucinating

You named the problem correctly: there are two halves, and only one of them is a statistics
problem.

**Half one — the numbers.** Avg placement, top-4 rate, best items on a unit. This half is easy:
it lives in our own database. The model asks for it with a tool call and never produces a figure
itself. If a number appears in the output that no tool returned, that is a bug we can detect
mechanically, not a judgement call.

**Half two — what a champion actually does.** This is where you expect hallucination, and you are
right. But the failure is avoidable, because *this is not a language problem*. It only becomes one
if we let the model answer from memory.

---

## The core move: the model never recalls, and never computes

Three things a model is bad at, all removed from its job:

| Job | Who does it |
|---|---|
| Knowing a champion's stats and ability values | CDragon sync → typed record, passed as context |
| Knowing what the ability *means* mechanically | Hand-authored effect catalogue (below) |
| Working out which item is better | Deterministic combat calculator in `packages/domain` |
| Choosing what to compare, and explaining it | **The model** |

What's left for the model is genuinely the thing it's good at: reading a situation, deciding which
comparison matters, and saying why in a sentence a player understands. It cannot invent a stat,
because it never writes one.

## The effect catalogue — the part that costs real work

Set data gives us numbers (`Ability.Variables: { Damage: [0,180,270,405] }`). It does **not** give
us semantics: does that damage hit one target or a cone? Does the shred stack with Sunder? Does
the shield expire before the second cast?

So we encode semantics once, by hand, as a closed set of typed primitives:

```ts
type Effect =
  | { kind: 'damage';  dmgType: 'physical'|'magic'|'true'; scaling: Scaling; target: Targeting }
  | { kind: 'shield';  amount: Scaling; durationMs: number }
  | { kind: 'heal';    amount: Scaling }
  | { kind: 'cc';      cc: 'stun'|'knockup'|'root'|'disarm'; durationMs: number; target: Targeting }
  | { kind: 'statMod'; stat: Stat; amount: Scaling; durationMs: number|'combat'; scope: Scope }
  | { kind: 'shred';   resist: 'armor'|'mr'; pct: number; durationMs: number }
  | { kind: 'summon';  unit: string; count: number };

type Targeting =
  | { shape: 'single' }
  | { shape: 'cone'; hexes: number }
  | { shape: 'circle'; radiusHexes: number }
  | { shape: 'line'; lengthHexes: number }
  | { shape: 'adjacent' };
```

Because the schema is **closed**, the model cannot describe an effect that does not exist —
there is no field for it. A cone is a cone or it is nothing.

Cost, honestly: ~60 units per set, maybe fifteen minutes each to author and test. A day of work
per set, plus patch-day touch-ups. That is the real price of not hallucinating, and it is the one
part of this project that cannot be automated away. It is also fully unit-testable, which nothing
about a prompt is.

**Refusal is the fallback.** If a unit has no catalogue entry for the current patch, the coach
says "no data for Kobuko on 16.3" — produced by code checking a lookup, not by the model deciding
to be modest.

## The calculator does the arithmetic

Given typed effects plus base stats, `packages/domain` computes the things itemization actually
turns on:

- effective HP against a stated physical/magic mix, with shred and sunder applied in order
- time to first cast from starting mana, mana per attack, mana per hit taken
- damage per cast and sustained DPS with the attack-speed cap applied
- whether a target is inside a given ability's footprint from a given hex

These are pure functions over fixture inputs. They are the cheapest tests in the codebase and
they are the ones that make the advice true.

## What a request actually looks like

1. Client sends a validated game state (board, bench, inventory, stage, enemy boards).
2. Server assembles context: the typed record + catalogue entry for every unit on the board, at
   the current patch. Nothing else.
3. Model plans, calling tools: `getUnit`, `getItem`, `getAggregate`, `simulateCombat`.
4. Model returns a closed-schema response — a list of `{ unit, item, reason, citations[] }`.
5. Validator rejects any recommendation whose numbers do not trace to a tool result.
6. UI renders reasoning with its citations visible.

## Two test layers

**Deterministic, in CI.** Stubbed model, fixed game state. Asserts the plumbing: tools were
called, the schema held, citations are present and resolve, an uncited number is rejected, a
missing catalogue entry produces a refusal. These never call a provider and never flake.

**Eval suite, on prompt or model change.** ~30 hand-labelled states, each with an expert "best"
answer and a set of clearly-wrong answers. Scored, tracked over time, gating prompt changes. The
prompt is a versioned artifact; changing it without an eval run is an untested deploy.

---

## The short version

Hallucination is not reduced by better prompting here — it is designed out. The model is given no
opportunity to state a fact or produce a number. It reads structured truth, calls tools for the
rest, and its entire contribution is judgement and phrasing. The expensive, unglamorous effect
catalogue is what buys that, and there is no shortcut around it.
