import {
  DECORATION_PRICES,
  FIRST_LAYING_DELAY,
  INCUBATION_DURATION,
  MARKET,
  MAX_TERRARIUMS,
  PUPA_DURATION,
  TERRARIUM_UPGRADES,
  terrariumPrice,
} from "../data/balance";
import { COLOR_IDS } from "../data/colors";
import type { DecorationType } from "../data/decorations";
import { DETAIL_IDS } from "../data/details";
import { PATTERN_IDS } from "../data/patterns";
import { breed } from "./genetics";
import { refreshMarket } from "./market";
import { pick, type Random } from "./random";
import { sellPrice } from "./rarity";
import { type Genome, type Salamander, speciesName } from "./salamander";
import { type GameState, newId } from "./state";
import { breedingPair, capacity, layingDelay, type Terrarium } from "./terrarium";

/** Enough for a small terrarium and a pair of common salamanders. */
export const STARTING_COINS = 220;

export function newGame(now: number, random: Random = Math.random): GameState {
  const state: GameState = {
    coins: STARTING_COINS,
    terrariums: [],
    market: { specimens: [], decorations: [], refreshedAt: now },
    deliveries: [],
    discovered: [],
    decorationsSeen: {},
    hasLaid: false,
    nextId: 0,
    lastTick: now,
  };
  refreshMarket(state, now, random);
  return state;
}

/** Number of distinct species: two distinct colors (or chameleon twice) per pattern, a hidden secondary without pattern. */
export const TOTAL_SPECIES = (() => {
  const colors = COLOR_IDS.length;
  const patterns = PATTERN_IDS.length - 1;
  const colorPairs = colors * (colors - 1) + 1;
  return (colorPairs * patterns + colors) * DETAIL_IDS.length;
})();

export function discover(state: GameState, genome: Genome): void {
  const name = speciesName(genome);
  if (!state.discovered.includes(name)) state.discovered.push(name);
}

export function occupied(state: GameState, terrarium: Terrarium): number {
  return terrarium.inhabitants.length + state.deliveries.filter((d) => d.terrariumId === terrarium.id).length;
}

export function hasRoom(state: GameState, terrarium: Terrarium): boolean {
  return occupied(state, terrarium) < capacity(terrarium);
}

/** Schedules the next laying when a pair can breed, or cancels it when not. */
function schedule(state: GameState, terrarium: Terrarium, from: number, random: Random): void {
  if (!breedingPair(terrarium) || !hasRoom(state, terrarium)) {
    terrarium.nextLayingAt = null;
  } else if (terrarium.nextLayingAt === null) {
    terrarium.nextLayingAt = from + (state.hasLaid ? layingDelay(terrarium, random) : FIRST_LAYING_DELAY);
  }
}

function stageEnd(salamander: Salamander): number {
  if (salamander.stage === "egg") return salamander.stageSince + INCUBATION_DURATION;
  if (salamander.stage === "pupa") return salamander.stageSince + PUPA_DURATION;
  return Infinity;
}

function lay(state: GameState, terrarium: Terrarium, at: number, random: Random): void {
  const adults = terrarium.inhabitants.filter((s) => s.stage === "adult");
  const mother = pick(adults.filter((s) => s.sex === "female"), random);
  const father = pick(adults.filter((s) => s.sex === "male"), random);
  terrarium.inhabitants.push({
    id: newId(state, "s"),
    genome: breed(mother.genome, father.genome, terrarium, random),
    sex: pick(["female", "male"] as const, random),
    stage: "egg",
    stageSince: at,
  });
  state.hasLaid = true;
  terrarium.nextLayingAt = null;
}

/** Plays every event of a terrarium up to `now`, in order, so offline time is caught up exactly. */
function advanceTerrarium(state: GameState, terrarium: Terrarium, now: number, random: Random): void {
  schedule(state, terrarium, state.lastTick, random);
  for (;;) {
    const growing = terrarium.inhabitants.reduce<Salamander | null>(
      (next, s) => (next === null || stageEnd(s) < stageEnd(next) ? s : next),
      null,
    );
    const growAt = growing ? stageEnd(growing) : Infinity;
    const layAt = terrarium.nextLayingAt ?? Infinity;
    const at = Math.min(growAt, layAt);
    if (at > now) break;
    if (growing && growAt <= layAt) {
      growing.stage = growing.stage === "egg" ? "pupa" : "adult";
      growing.stageSince = growAt;
      if (growing.stage === "adult") discover(state, growing.genome);
    } else {
      lay(state, terrarium, layAt, random);
    }
    schedule(state, terrarium, at, random);
  }
}

/** Advances the whole game to `now`: market rotation, deliveries, growth and laying. */
export function advance(state: GameState, now: number, random: Random = Math.random): void {
  if (now - state.market.refreshedAt >= MARKET.rotation) {
    const rotations = Math.floor((now - state.market.refreshedAt) / MARKET.rotation);
    refreshMarket(state, state.market.refreshedAt + rotations * MARKET.rotation, random);
  }

  for (const delivery of state.deliveries.filter((d) => d.arrivesAt <= now)) {
    const terrarium = state.terrariums.find((t) => t.id === delivery.terrariumId);
    state.deliveries.splice(state.deliveries.indexOf(delivery), 1);
    if (!terrarium) continue;
    terrarium.inhabitants.push({ ...delivery.salamander, stageSince: delivery.arrivesAt });
    discover(state, delivery.salamander.genome);
    schedule(state, terrarium, Math.max(delivery.arrivesAt, state.lastTick), random);
  }

  for (const terrarium of state.terrariums) advanceTerrarium(state, terrarium, now, random);
  state.lastTick = now;
}

// Player actions: each returns an error message, or null when it succeeded.

function findTerrarium(state: GameState, id: string): Terrarium | undefined {
  return state.terrariums.find((t) => t.id === id);
}

function spend(state: GameState, price: number): string | null {
  if (state.coins < price) return "Not enough coins";
  state.coins -= Math.round(price);
  return null;
}

export function buySpecimen(state: GameState, offerId: string, terrariumId: string, now: number): string | null {
  const offer = state.market.specimens.find((o) => o.id === offerId);
  const terrarium = findTerrarium(state, terrariumId);
  if (!offer || !terrarium) return "Unavailable";
  if (!hasRoom(state, terrarium)) return "This terrarium is full";
  const error = spend(state, offer.price);
  if (error) return error;
  state.market.specimens.splice(state.market.specimens.indexOf(offer), 1);
  state.deliveries.push({
    salamander: { id: newId(state, "s"), genome: offer.genome, sex: offer.sex, stage: "adult", stageSince: now },
    terrariumId,
    arrivesAt: now + MARKET.delivery,
  });
  return null;
}

export function sellSalamander(state: GameState, salamanderId: string, now: number, random: Random = Math.random): string | null {
  const terrarium = state.terrariums.find((t) => t.inhabitants.some((s) => s.id === salamanderId));
  const salamander = terrarium?.inhabitants.find((s) => s.id === salamanderId);
  if (!terrarium || !salamander) return "Unavailable";
  if (salamander.stage !== "adult") return "Only adults can be sold";
  terrarium.inhabitants.splice(terrarium.inhabitants.indexOf(salamander), 1);
  state.coins += sellPrice(salamander.genome);
  schedule(state, terrarium, now, random);
  return null;
}

export function moveSalamander(
  state: GameState,
  salamanderId: string,
  terrariumId: string,
  now: number,
  random: Random = Math.random,
): string | null {
  const from = state.terrariums.find((t) => t.inhabitants.some((s) => s.id === salamanderId));
  const to = findTerrarium(state, terrariumId);
  const salamander = from?.inhabitants.find((s) => s.id === salamanderId);
  if (!from || !to || !salamander || from === to) return "Unavailable";
  if (!hasRoom(state, to)) return "This terrarium is full";
  from.inhabitants.splice(from.inhabitants.indexOf(salamander), 1);
  to.inhabitants.push(salamander);
  schedule(state, from, now, random);
  schedule(state, to, now, random);
  return null;
}

export function nextTerrariumPrice(state: GameState): number {
  return terrariumPrice("small", state.terrariums.length + 1);
}

export function buyTerrarium(state: GameState): string | null {
  if (state.terrariums.length >= MAX_TERRARIUMS) return `At most ${MAX_TERRARIUMS} terrariums`;
  const error = spend(state, nextTerrariumPrice(state));
  if (error) return error;
  state.terrariums.push({
    id: newId(state, "t"),
    size: "small",
    rank: state.terrariums.length + 1,
    decorations: [],
    inhabitants: [],
    nextLayingAt: null,
  });
  return null;
}

export function upgradePrice(terrarium: Terrarium): number | null {
  const next = TERRARIUM_UPGRADES[terrarium.size];
  return next ? terrariumPrice(next, terrarium.rank) : null;
}

export function upgradeTerrarium(state: GameState, terrariumId: string, now: number, random: Random = Math.random): string | null {
  const terrarium = findTerrarium(state, terrariumId);
  const next = terrarium && TERRARIUM_UPGRADES[terrarium.size];
  const price = terrarium && upgradePrice(terrarium);
  if (!terrarium || !next || price === null || price === undefined) return "Unavailable";
  const error = spend(state, price);
  if (error) return error;
  terrarium.size = next;
  schedule(state, terrarium, now, random);
  return null;
}

function seeDecoration(state: GameState, terrarium: Terrarium, type: DecorationType): void {
  const decoration = terrarium.decorations.find((d) => d.type === type);
  if (!decoration) return;
  const key = `${decoration.theme}:${type}`;
  state.decorationsSeen[key] = Math.max(state.decorationsSeen[key] ?? 1, decoration.quality) as 1 | 2 | 3;
}

/** Places the decoration in its type's slot, replacing any decoration already there. */
export function buyDecoration(state: GameState, offerId: string, terrariumId: string): string | null {
  const offer = state.market.decorations.find((o) => o.id === offerId);
  const terrarium = findTerrarium(state, terrariumId);
  if (!offer || !terrarium) return "Unavailable";
  const error = spend(state, DECORATION_PRICES.purchase);
  if (error) return error;
  state.market.decorations.splice(state.market.decorations.indexOf(offer), 1);
  terrarium.decorations = terrarium.decorations.filter((d) => d.type !== offer.type);
  terrarium.decorations.push({ type: offer.type, theme: offer.theme, quality: 1 });
  seeDecoration(state, terrarium, offer.type);
  return null;
}

export function decorationUpgradePrice(quality: 1 | 2 | 3): number | null {
  if (quality === 1) return DECORATION_PRICES.upgradeTo2;
  if (quality === 2) return DECORATION_PRICES.upgradeTo3;
  return null;
}

export function upgradeDecoration(state: GameState, terrariumId: string, type: DecorationType): string | null {
  const terrarium = findTerrarium(state, terrariumId);
  const decoration = terrarium?.decorations.find((d) => d.type === type);
  const price = decoration && decorationUpgradePrice(decoration.quality);
  if (!terrarium || !decoration || !price) return "Unavailable";
  const error = spend(state, price);
  if (error) return error;
  decoration.quality = (decoration.quality + 1) as 2 | 3;
  seeDecoration(state, terrarium, type);
  return null;
}
