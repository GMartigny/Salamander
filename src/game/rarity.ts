import { BASE_SPECIMEN_PRICE, DETAIL_PRICE_FACTOR, SELL_RATIO } from "../data/balance";
import { COLORS } from "../data/colors";
import { PATTERNS } from "../data/patterns";
import type { Genome } from "./salamander";

const MOST_COMMON_WEIGHT = 100;

/** Price factor of a trait from its rarity weight: 1 for the most common, 10 for a weight of 1. */
function factor(weight: number): number {
  return Math.sqrt(MOST_COMMON_WEIGHT / weight);
}

/** Purchase price of a specimen, from the rarity of its traits. */
export function specimenPrice({ primary, secondary, pattern, detail }: Genome): number {
  const secondaryFactor = pattern === "iustus" ? 1 : factor(COLORS[secondary].weight);
  const detailFactor = detail === "none" ? 1 : DETAIL_PRICE_FACTOR;
  const price =
    BASE_SPECIMEN_PRICE * factor(COLORS[primary].weight) * secondaryFactor * factor(PATTERNS[pattern].weight) * detailFactor;
  return Math.round(price);
}

export function sellPrice(genome: Genome): number {
  return Math.round(specimenPrice(genome) * SELL_RATIO);
}
