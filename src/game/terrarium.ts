import {
  DECORATION_HAPPINESS,
  type DecorationQuality,
  DETAIL_MAX_CHANCE,
  DETAIL_MIN_DECORATIONS,
  FEW_DECORATIONS_MAX,
  MATING_DELAY,
  MAX_DECORATIONS,
  MIXED_THEME_PENALTY,
  TERRARIUM_SIZES,
  type TerrariumSize,
} from "../data/balance";
import { DECORATION_THEMES, type DecorationTheme, type DecorationType } from "../data/decorations";
import { between, type Random } from "./random";
import type { Salamander } from "./salamander";

/**
 * Bought at quality 1, then upgraded in place; quality adds happiness.
 * The theme favors one detail and personalizes the terrarium.
 */
export interface Decoration {
  type: DecorationType;
  theme: DecorationTheme;
  quality: DecorationQuality;
  /** Coins spent on it (purchase and upgrades), to compute its resale price. */
  spent: number;
}

/** The terrarium is the breeding pen; eggs incubate inside and take up a slot. */
export interface Terrarium {
  id: string;
  /** Bought small, then upgraded in place; the size sets the capacity. */
  size: TerrariumSize;
  /** Purchase rank among the player's terrariums (1-based), used for prices. */
  rank: number;
  /** At most one decoration per type. */
  decorations: Decoration[];
  inhabitants: Salamander[];
}

export function capacity(terrarium: Terrarium): number {
  return TERRARIUM_SIZES[terrarium.size].capacity;
}

/** The theme with the most decorations, and how many decorations share it. */
export function mainTheme(terrarium: Terrarium): { theme: DecorationTheme; count: number } | null {
  let best: { theme: DecorationTheme; count: number } | null = null;
  for (const theme of DECORATION_THEMES) {
    const count = terrarium.decorations.filter((d) => d.theme === theme).length;
    if (count > 0 && (!best || count > best.count)) best = { theme, count };
  }
  return best;
}

/** From 0 to 1: quality of the decorations, minus a penalty for each one outside the main theme. */
export function happiness(terrarium: Terrarium): number {
  const main = mainTheme(terrarium);
  const offTheme = main ? terrarium.decorations.length - main.count : 0;
  const total = terrarium.decorations.reduce((sum, d) => sum + DECORATION_HAPPINESS[d.quality], 0);
  return Math.min(1, Math.max(0, total - offTheme * MIXED_THEME_PENALTY));
}

/** Chance of the main theme's detail: from 2 same-theme decorations, up to 10% with 5. */
export function themeDetailChance(terrarium: Terrarium): number {
  const main = mainTheme(terrarium);
  if (!main || main.count < DETAIL_MIN_DECORATIONS) return 0;
  return (DETAIL_MAX_CHANCE * (main.count - DETAIL_MIN_DECORATIONS + 1)) / (MAX_DECORATIONS - DETAIL_MIN_DECORATIONS + 1);
}

export function hasFewDecorations(terrarium: Terrarium): boolean {
  return terrarium.decorations.length <= FEW_DECORATIONS_MAX;
}

/** Random delay before a female gets pregnant; both bounds shrink linearly with happiness. */
export function matingDelay(terrarium: Terrarium, random: Random): number {
  const h = happiness(terrarium);
  const [slowMin, slowMax] = MATING_DELAY.unhappy;
  const [fastMin, fastMax] = MATING_DELAY.happy;
  return between(slowMin + (fastMin - slowMin) * h, slowMax + (fastMax - slowMax) * h, random);
}

export function adultMales(terrarium: Terrarium): Salamander[] {
  return terrarium.inhabitants.filter((s) => s.stage === "adult" && s.sex === "male");
}
