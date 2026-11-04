import { BASE_SPECIMEN_PRICE, COLLECTION_REWARD_FACTOR, ORDERS } from "../data/balance";
import { COLLECTIONS, type Collection } from "../data/collections";
import { COLOR_IDS, COLORS, type ColorId } from "../data/colors";
import { PATTERN_IDS, type PatternId, PATTERNS } from "../data/patterns";
import { chance, pick, type Random } from "./random";
import { specimenPrice } from "./rarity";
import { type Genome, parseSpeciesName, type Salamander } from "./salamander";
import { type GameState, newId } from "./state";

/** Traits a delivered salamander must have; traits left out are free. */
export type Requirement = Partial<Pick<Genome, "primary" | "secondary" | "pattern">>;

export interface Order {
  id: string;
  /** One salamander per requirement. */
  requirements: Requirement[];
  reward: number;
  expiresAt: number;
}

const COMMON_WEIGHT = 50;
const BRIDGE_WEIGHT = 30;

function factor(weight: number): number {
  return Math.sqrt(100 / weight);
}

/** Colors an order may ask for: common ones, plus any the player has already found. */
function orderColors(state: GameState): ColorId[] {
  return COLOR_IDS.filter((c) => COLORS[c].weight >= COMMON_WEIGHT || state.discoveredColors.includes(c));
}

function orderPatterns(): PatternId[] {
  return PATTERN_IDS.filter((p) => p !== "iustus" && PATTERNS[p].weight >= BRIDGE_WEIGHT);
}

function requirementReward(requirement: Requirement): number {
  let reward = ORDERS.rewardFactor * BASE_SPECIMEN_PRICE;
  if (requirement.primary) reward *= factor(COLORS[requirement.primary].weight);
  if (requirement.secondary) reward *= factor(COLORS[requirement.secondary].weight);
  if (requirement.pattern) reward *= factor(PATTERNS[requirement.pattern].weight);
  return reward;
}

/** Two traits among primary color, secondary color and pattern. */
function newRequirement(state: GameState, random: Random): Requirement {
  const colors = orderColors(state);
  const primary = pick(colors, random);
  const secondary = pick(
    colors.filter((c) => c !== primary),
    random,
  );
  const pattern = pick(orderPatterns(), random);
  const kind = pick(["primary-pattern", "primary-secondary", "secondary-pattern"] as const, random);
  if (kind === "primary-pattern") return { primary, pattern };
  if (kind === "primary-secondary") return { primary, secondary };
  return { secondary, pattern };
}

export function newOrder(state: GameState, now: number, random: Random): Order {
  const requirements = Array.from({ length: chance(0.3, random) ? 2 : 1 }, () => newRequirement(state, random));
  const reward = Math.round(requirements.reduce((sum, r) => sum + requirementReward(r), 0) / 5) * 5;
  return { id: newId(state, "c"), requirements, reward, expiresAt: now + ORDERS.duration };
}

/** Drops expired orders and opens new ones to fill the free slots. */
export function refreshOrders(state: GameState, now: number, random: Random): void {
  state.orders = (state.orders ?? []).filter((o) => o.expiresAt > now);
  while (state.orders.length < ORDERS.slots) state.orders.push(newOrder(state, now, random));
}

export function matches(salamander: Salamander, requirement: Requirement): boolean {
  const { genome } = salamander;
  if (salamander.stage !== "adult") return false;
  if (requirement.primary && genome.primary !== requirement.primary) return false;
  if (requirement.pattern && genome.pattern !== requirement.pattern) return false;
  if (requirement.secondary && (genome.pattern === "iustus" || genome.secondary !== requirement.secondary)) return false;
  return true;
}

/** Distinct adults that fill an order, one per requirement, or null when some requirement has no match. */
export function orderCandidates(state: GameState, order: Order): Salamander[] | null {
  const adults = state.terrariums.flatMap((t) => t.inhabitants);
  const chosen: Salamander[] = [];
  for (const requirement of order.requirements) {
    const match = adults.find((s) => !chosen.includes(s) && matches(s, requirement));
    if (!match) return null;
    chosen.push(match);
  }
  return chosen;
}

export function deliverOrder(state: GameState, orderId: string, now: number, random: Random = Math.random): string | null {
  const order = state.orders.find((o) => o.id === orderId);
  if (!order || order.expiresAt <= now) return "This order has expired";
  const candidates = orderCandidates(state, order);
  if (!candidates) return "You don't have the right salamanders yet";
  for (const salamander of candidates) {
    const terrarium = state.terrariums.find((t) => t.inhabitants.includes(salamander));
    terrarium?.inhabitants.splice(terrarium.inhabitants.indexOf(salamander), 1);
  }
  state.coins += order.reward;
  state.orders.splice(state.orders.indexOf(order), 1);
  refreshOrders(state, now, random);
  return null;
}

export function collectionReward(collection: Collection): number {
  const total = collection.members.reduce((sum, name) => {
    const genome = parseSpeciesName(name);
    return sum + (genome ? specimenPrice(genome) : 0);
  }, 0);
  return Math.round((COLLECTION_REWARD_FACTOR * total) / 10) * 10;
}

export function collectionProgress(state: GameState, collection: Collection): number {
  return collection.members.filter((name) => state.discovered.includes(name)).length;
}

/** Gives the reward of a collection whose members have all been discovered, once. */
export function claimCollection(state: GameState, collectionId: string): string | null {
  const collection = COLLECTIONS.find((c) => c.id === collectionId);
  if (!collection) return "Unavailable";
  state.claimedCollections ??= [];
  if (state.claimedCollections.includes(collection.id)) return "Already claimed";
  if (collectionProgress(state, collection) < collection.members.length) return "Collection not complete yet";
  state.claimedCollections.push(collection.id);
  state.coins += collectionReward(collection);
  return null;
}
