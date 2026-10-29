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

/** Price of a terrarium of a given size, when it is the n-th terrarium owned (1-based, all sizes counted). */
export function terrariumPrice(size: TerrariumSize, n: number): number {
  return TERRARIUM_SIZES[size].basePrice * TERRARIUM_PRICE_FACTOR ** (n - 1);
}
