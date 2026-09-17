import {
  type Item,
  parseItem,
  parseTrait,
  parseUnit,
  type Trait,
  type Unit,
} from '@xd-tactics/domain';

// Raw CDragon shapes below are typed loosely, for mapping ergonomics only — they are NOT the
// validation gate. Each mapped object still goes through parseUnit/parseItem/parseTrait, which
// is where "parse, do not cast" actually happens: a missing or wrong-type field surfaces as a
// ZodError from the domain parser, not a silent `undefined` here.

interface RawChampionStats {
  hp: number | null;
  armor: number | null;
  magicResist: number | null;
  damage: number | null;
  attackSpeed: number | null;
  range: number | null;
  mana: number | null;
}

interface RawChampion {
  apiName: string;
  name: string;
  cost: number;
  traits: string[];
  stats: RawChampionStats;
  ability: {
    name: string;
    variables: Array<{ name: string; value: number[] }>;
  };
}

interface RawItem {
  apiName: string;
  name: string | null;
  unique: boolean;
  associatedTraits: string[];
  composition: string[];
}

interface RawTraitEffect {
  minUnits: number | null;
  maxUnits: number | null;
  style: number | null;
}

interface RawTrait {
  apiName: string;
  name: string;
  effects: RawTraitEffect[];
}

export interface CDragonSetPayload {
  champions: unknown[];
  items: unknown[];
  traits: unknown[];
}

export interface AdaptedSetData {
  units: Unit[];
  items: Item[];
  traits: Trait[];
}

// CDragon carries every champion it has ever defined, including jungle monsters (no traits,
// often cost 0) and units whose stats aren't finalized yet (a null core stat). Neither is a
// unit a player can field — the domain schema requires complete numbers, and this filter is
// the documented reason some raw entries never reach it.
function isPlayableChampion(raw: RawChampion): boolean {
  const hasCompleteStats = Object.values(raw.stats).every((value) => value != null);
  return raw.cost >= 1 && raw.cost <= 5 && raw.traits.length > 0 && hasCompleteStats;
}

function toUnit(raw: RawChampion): Unit {
  return parseUnit({
    apiName: raw.apiName,
    name: raw.name,
    cost: raw.cost,
    traits: raw.traits,
    stats: {
      hp: raw.stats.hp,
      armor: raw.stats.armor,
      mr: raw.stats.magicResist,
      ad: raw.stats.damage,
      as: raw.stats.attackSpeed,
      range: raw.stats.range,
    },
    ability: {
      name: raw.ability.name,
      mana: raw.stats.mana,
      variables: raw.ability.variables,
    },
  });
}

// A handful of raw entries are unused placeholder slots (e.g. TFT_Item_Blank) that carry no
// name — not real items, so they never reach parseItem.
function isRealItem(raw: RawItem): boolean {
  return raw.name !== null;
}

function toItem(raw: RawItem): Item {
  return parseItem({
    apiName: raw.apiName,
    name: raw.name,
    unique: raw.unique,
    associatedTraits: raw.associatedTraits,
    composition: raw.composition,
  });
}

function hasCompleteTier(
  effect: RawTraitEffect,
): effect is { minUnits: number; maxUnits: number; style: number } {
  return effect.minUnits != null && effect.maxUnits != null && effect.style != null;
}

// A trait can carry a tier with a null minUnits (seen on DA_18_Eclipse, its only tier) —
// another apparently-unreleased entry. Dropping the incomplete tier can leave a trait with
// none at all; a trait with zero usable tiers isn't real, so it's dropped too.
function toTrait(raw: RawTrait): Trait | null {
  const tiers = raw.effects.filter(hasCompleteTier);

  if (tiers.length === 0) {
    return null;
  }

  return parseTrait({ apiName: raw.apiName, name: raw.name, tiers });
}

export function adaptCDragonSetData(payload: CDragonSetPayload): AdaptedSetData {
  const champions = payload.champions as RawChampion[];
  const items = payload.items as RawItem[];
  const traits = payload.traits as RawTrait[];

  return {
    units: champions.filter(isPlayableChampion).map(toUnit),
    items: items.filter(isRealItem).map(toItem),
    traits: traits.map(toTrait).filter((trait) => trait !== null),
  };
}
