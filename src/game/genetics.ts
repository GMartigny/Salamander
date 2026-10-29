import type { Genome } from "./salamander";

/** Injectable randomness source, so draws can be tested. */
export type Random = () => number;

/**
 * Offspring genome from its parents (see doc/GDD.md, "Color inheritance"):
 * 1. primary color inherited, then possibly mutated;
 * 2. secondary color drawn without the primary;
 * 3. empty pool → forced mutation to a neighbor.
 * Pattern by fusion, detail influenced by decorations.
 */
export function breed(_mother: Genome, _father: Genome, _random: Random = Math.random): Genome {
  // TODO: implement once rarities are quantified.
  throw new Error("Not implemented");
}
