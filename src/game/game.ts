import {
  DECORATION_PRICES,
  DECORATION_SELL_RATIO,
  FIRST_MATING_DELAY,
  GESTATION_DURATION,
  INCUBATION_DURATION,
  MARKET,
  MAX_TERRARIUMS,
  PUPA_DURATION,
  REST_DURATION,
  TERRARIUM_UPGRADES,
  terrariumPrice,
} from "../data/balance";
import { COLOR_IDS } from "../data/colors";
import type { DecorationType } from "../data/decorations";
import { DETAIL_IDS } from "../data/details";
import { PATTERN_IDS } from "../data/patterns";
import { breed } from "./genetics";
import { refreshOrders } from "./goals";
import { refreshMarket } from "./market";
import { pick, type Random } from "./random";
import { sellPrice } from "./rarity";
import { type Salamander, speciesName } from "./salamander";
import { type GameState, newId } from "./state";
import { adultMales, capacity, matingDelay, type Terrarium } from "./terrarium";

/** Enough for a small terrarium and a pair of common salamanders. */
export const STARTING_COINS = 220;

export function newGame(now: number, random: Random = Math.random): GameState {
  const state: GameState = {
    coins: STARTING_COINS,
    terrariums: [],
    market: { specimens: [], decorations: [], refreshedAt: now },
    deliveries: [],
    discovered: [],
    discoveredColors: [],
    discoveredLinks: [],
    discoveredRecipes: [],
    triedWithoutResult: [],
    orders: [],
    claimedCollections: [],
    decorationsSeen: {},
    hasMated: false,
    nextId: 0,
    lastTick: now,
  };
  refreshMarket(state, now, random);
  refreshOrders(state, now, random);
  return state;
}

/** Number of distinct species: two distinct colors (or chameleon twice) per pattern, a hidden secondary without pattern. */
export const TOTAL_SPECIES = (() => {
  const colors = COLOR_IDS.length;
  const patterns = PATTERN_IDS.length - 1;
  const colorPairs = colors * (colors - 1) + 1;
  return (colorPairs * patterns + colors) * DETAIL_IDS.length;
})();

function addOnce(list: string[], item: string): void {
  if (!list.includes(item)) list.push(item);
}

export function linkKey(a: string, b: string): string {
  return [a, b].sort().join("|");
}

export function recipeKey(a: string, b: string): string {
  return [a, b].sort().join("+");
}

/** Records a salamander the player now owns as an adult: species, colors and how it was born. */
export function discover(state: GameState, salamander: Pick<Salamander, "genome" | "birth">): void {
  const { genome, birth } = salamander;
  addOnce(state.discovered, speciesName(genome));
  addOnce(state.discoveredColors, genome.primary);
  if (genome.pattern !== "iustus") addOnce(state.discoveredColors, genome.secondary);
  for (const [from, to] of birth?.mutations ?? []) addOnce(state.discoveredLinks, linkKey(from, to));
  if (birth?.fusion) addOnce(state.discoveredRecipes, recipeKey(birth.fusion[0], birth.fusion[1]));
  if (birth?.noFusion) addOnce((state.triedWithoutResult ??= []), recipeKey(birth.noFusion[0], birth.noFusion[1]));
}

export function occupied(state: GameState, terrarium: Terrarium): number {
  return terrarium.inhabitants.length + state.deliveries.filter((d) => d.terrariumId === terrarium.id).length;
}

export function hasRoom(state: GameState, terrarium: Terrarium): boolean {
  return occupied(state, terrarium) < capacity(terrarium);
}

/** Schedules the next mating of each available female when a male is around, or cancels it when not. */
function schedule(state: GameState, terrarium: Terrarium, from: number, random: Random): void {
  const hasMale = adultMales(terrarium).length > 0;
  for (const female of terrarium.inhabitants) {
    if (female.sex !== "female" || female.stage !== "adult") continue;
    if (female.pregnancy || !hasMale) {
      female.nextMatingAt = null;
    } else if (female.nextMatingAt == null) {
      const start = Math.max(from, female.restUntil ?? 0);
      female.nextMatingAt = start + (state.hasMated ? matingDelay(terrarium, random) : FIRST_MATING_DELAY);
    }
  }
}

function stageEnd(salamander: Salamander): number {
  if (salamander.stage === "egg") return salamander.stageSince + INCUBATION_DURATION;
  if (salamander.stage === "pupa") return salamander.stageSince + PUPA_DURATION;
  return Infinity;
}

export function layingDue(female: Salamander): number | null {
  return female.pregnancy ? female.pregnancy.since + GESTATION_DURATION : null;
}

type TerrariumEvent = { at: number; salamander: Salamander; kind: "grow" | "mate" | "lay" };

/** The earliest thing that will happen in a terrarium. Laying waits for a free slot. */
function nextEvent(state: GameState, terrarium: Terrarium, floor: number): TerrariumEvent | null {
  let next: TerrariumEvent | null = null;
  const consider = (at: number, salamander: Salamander, kind: TerrariumEvent["kind"]) => {
    if (!next || at < next.at) next = { at, salamander, kind };
  };
  const room = hasRoom(state, terrarium);
  for (const s of terrarium.inhabitants) {
    if (s.stage !== "adult") consider(stageEnd(s), s, "grow");
    if (s.nextMatingAt != null) consider(s.nextMatingAt, s, "mate");
    const due = layingDue(s);
    if (due !== null && room) consider(Math.max(due, floor), s, "lay");
  }
  return next;
}

/** Plays every event of a terrarium up to `now`, in order, so offline time is caught up exactly. */
function advanceTerrarium(state: GameState, terrarium: Terrarium, now: number, random: Random): void {
  const floor = state.lastTick;
  schedule(state, terrarium, floor, random);
  for (let event = nextEvent(state, terrarium, floor); event && event.at <= now; event = nextEvent(state, terrarium, floor)) {
    const { at, salamander, kind } = event;
    if (kind === "grow") {
      salamander.stage = salamander.stage === "egg" ? "pupa" : "adult";
      salamander.stageSince = at;
      if (salamander.stage === "adult") discover(state, salamander);
    } else if (kind === "mate") {
      salamander.pregnancy = { father: pick(adultMales(terrarium), random).genome, since: at };
      salamander.nextMatingAt = null;
      state.hasMated = true;
    } else if (salamander.pregnancy) {
      const birth = breed(salamander.genome, salamander.pregnancy.father, terrarium, random);
      terrarium.inhabitants.push({
        id: newId(state, "s"),
        genome: birth.genome,
        sex: pick(["female", "male"] as const, random),
        stage: "egg",
        stageSince: at,
        birth: { mutations: birth.mutations, fusion: birth.fusion, noFusion: birth.noFusion },
      });
      salamander.pregnancy = null;
      salamander.restUntil = at + REST_DURATION;
    }
    schedule(state, terrarium, at, random);
  }
}

/** Advances the whole game to `now`: market rotation, deliveries, growth, mating and laying. */
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
    discover(state, delivery.salamander);
    schedule(state, terrarium, Math.max(delivery.arrivesAt, state.lastTick), random);
  }

  for (const terrarium of state.terrariums) advanceTerrarium(state, terrarium, now, random);
  refreshOrders(state, now, random);
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
  if (terrarium.decorations.some((d) => d.type === offer.type && d.theme === offer.theme)) return "This terrarium already has it";
  const error = spend(state, DECORATION_PRICES.purchase);
  if (error) return error;
  state.market.decorations.splice(state.market.decorations.indexOf(offer), 1);
  terrarium.decorations = terrarium.decorations.filter((d) => d.type !== offer.type);
  terrarium.decorations.push({ type: offer.type, theme: offer.theme, quality: 1, spent: DECORATION_PRICES.purchase });
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
  decoration.spent += price;
  seeDecoration(state, terrarium, type);
  return null;
}

export function decorationSellPrice(spent: number): number {
  return Math.round(spent * DECORATION_SELL_RATIO);
}

export function sellDecoration(state: GameState, terrariumId: string, type: DecorationType): string | null {
  const terrarium = findTerrarium(state, terrariumId);
  const decoration = terrarium?.decorations.find((d) => d.type === type);
  if (!terrarium || !decoration) return "Unavailable";
  terrarium.decorations.splice(terrarium.decorations.indexOf(decoration), 1);
  state.coins += decorationSellPrice(decoration.spent);
  return null;
}
