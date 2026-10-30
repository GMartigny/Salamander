/**
 * Balancing values (see doc/GDD.md). Temporary numbers, to be tuned by playing.
 */

const SECOND = 1000;
const MINUTE = 60 * SECOND;

/** Delay between two layings, as a [min, max] range in ms. */
export const LAYING_DELAY = {
  /** With base happiness (0). */
  unhappy: [3 * MINUTE, 5 * MINUTE],
  /** With maximum happiness (1): 5 decorations of the same theme. */
  happy: [1 * MINUTE, 2 * MINUTE],
} as const;

/** The very first laying of a new game is forced to happen quickly. */
export const FIRST_LAYING_DELAY = 10 * SECOND;

export const INCUBATION_DURATION = 30 * SECOND;
export const PUPA_DURATION = 2 * MINUTE;

/** Decoration slots per terrarium (one per decoration type). */
export const MAX_DECORATIONS = 5;

export type DecorationQuality = 1 | 2 | 3;

/** Happiness added by one decoration, by quality (5 decorations at quality 3 = maximum happiness 1). */
export const DECORATION_HAPPINESS: Record<DecorationQuality, number> = { 1: 0.1, 2: 0.15, 3: 0.2 };

/** Purchase price at quality 1, then the price of each upgrade. */
export const DECORATION_PRICES = { purchase: 50, upgradeTo2: 150, upgradeTo3: 450 } as const;

/** A terrarium with at most this many decorations favors no pattern (iustus). */
export const FEW_DECORATIONS_MAX = 1;

/** Happiness lost for each decoration outside the terrarium's main theme (happiness ranges 0 to 1). */
export const MIXED_THEME_PENALTY = 0.05;

/** Same-theme decorations needed before the theme's detail can appear. */
export const DETAIL_MIN_DECORATIONS = 2;

/** Chance of the theme's detail with all 5 decorations of that theme; scales linearly from the minimum. */
export const DETAIL_MAX_CHANCE = 0.1;

export const TERRARIUM_SIZES = {
  small: { capacity: 4, basePrice: 100 },
  medium: { capacity: 7, basePrice: 1_000 },
  large: { capacity: 10, basePrice: 10_000 },
} as const;

export type TerrariumSize = keyof typeof TERRARIUM_SIZES;

/** Each new terrarium costs this much more than the previous one. */
export const TERRARIUM_PRICE_FACTOR = 1.5;

export const MAX_TERRARIUMS = 10;

/** Terrariums are bought small, then upgraded in place to medium, then large. */
export const TERRARIUM_UPGRADES: Record<TerrariumSize, TerrariumSize | null> = {
  small: "medium",
  medium: "large",
  large: null,
};

/**
 * Price to buy (small) or upgrade to (medium, large) the n-th terrarium owned (1-based).
 * Upgrades follow the rank of the terrarium they apply to.
 */
export function terrariumPrice(size: TerrariumSize, n: number): number {
  return TERRARIUM_SIZES[size].basePrice * TERRARIUM_PRICE_FACTOR ** (n - 1);
}

/** Chance for each inherited color to mutate to a neighbor in the graph. */
export const MUTATION_CHANCE = 0.1;

/** Chance that two parent patterns with a recipe produce the recipe's result. */
export const FUSION_CHANCE = 0.7;

/** Chance to inherit a parent's detail when the terrarium's theme gives none. */
export const DETAIL_INHERIT_CHANCE = 0.2;

/** Chance of no pattern (iustus) in a terrarium with few decorations. */
export const FEW_DECORATIONS_IUSTUS_CHANCE = 0.1;

/** Price of the most common salamander; rarer traits multiply it. */
export const BASE_SPECIMEN_PRICE = 20;

/** Price multiplier for a salamander with a detail. */
export const DETAIL_PRICE_FACTOR = 3;

/** Share of the price received when selling. */
export const SELL_RATIO = 0.5;

export const MARKET = {
  rotation: 10 * MINUTE,
  specimens: 4,
  /** Low-rarity specimens always offered: one male and one female. */
  lowRarity: 2,
  decorations: 3,
  delivery: 30 * SECOND,
} as const;
