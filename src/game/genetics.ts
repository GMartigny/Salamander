import { DETAIL_INHERIT_CHANCE, FEW_DECORATIONS_IUSTUS_CHANCE, FUSION_CHANCE, MUTATION_CHANCE } from "../data/balance";
import { type ColorId, COLORS, neighbors, WILDCARD_COLOR } from "../data/colors";
import type { DetailId } from "../data/details";
import { THEME_DETAILS } from "../data/decorations";
import { fusionResult, type PatternId } from "../data/patterns";
import { chance, pick, type Random, weightedPick } from "./random";
import type { Genome } from "./salamander";
import { hasFewDecorations, mainTheme, type Terrarium, themeDetailChance } from "./terrarium";

/** Mutates to a neighbor in the color graph, picked by rarity weight. */
function mutate(color: ColorId, random: Random, exclude?: ColorId): ColorId {
  const options = neighbors(color).filter((c) => c !== exclude || c === WILDCARD_COLOR);
  return weightedPick(options, (c) => COLORS[c].weight, random);
}

function inheritColor(color: ColorId, random: Random): ColorId {
  return chance(MUTATION_CHANCE, random) ? mutate(color, random) : color;
}

function samePair(a: ColorId, b: ColorId): boolean {
  return a === b && a !== WILDCARD_COLOR;
}

function inheritPattern(mother: Genome, father: Genome, terrarium: Terrarium, random: Random): PatternId {
  if (hasFewDecorations(terrarium) && chance(FEW_DECORATIONS_IUSTUS_CHANCE, random)) return "iustus";
  const fused = fusionResult(mother.pattern, father.pattern);
  if (fused && chance(FUSION_CHANCE, random)) return fused;
  return pick([mother.pattern, father.pattern], random);
}

function inheritDetail(mother: Genome, father: Genome, terrarium: Terrarium, random: Random): DetailId {
  const main = mainTheme(terrarium);
  if (main && chance(themeDetailChance(terrarium), random)) return THEME_DETAILS[main.theme];
  const parentDetails = [mother.detail, father.detail].filter((d) => d !== "none");
  if (parentDetails.length && chance(DETAIL_INHERIT_CHANCE, random)) return pick(parentDetails, random);
  return "none";
}

/**
 * Offspring genome from its parents (see doc/GDD.md, "Color inheritance"):
 * 1. primary color inherited from a parent, then possibly mutated;
 * 2. secondary color drawn from the parents' secondary colors, without the primary;
 * 3. empty pool → forced mutation to a neighbor.
 * Pattern by fusion, detail influenced by the terrarium's decorations.
 */
export function breed(mother: Genome, father: Genome, terrarium: Terrarium, random: Random = Math.random): Genome {
  const primary = inheritColor(pick([mother.primary, father.primary], random), random);

  const pool = [mother.secondary, father.secondary].filter((c) => !samePair(c, primary));
  let secondary = pool.length ? inheritColor(pick(pool, random), random) : mutate(mother.secondary, random, primary);
  if (samePair(secondary, primary)) secondary = mutate(secondary, random, primary);

  return {
    primary,
    secondary,
    pattern: inheritPattern(mother, father, terrarium, random),
    detail: inheritDetail(mother, father, terrarium, random),
  };
}
