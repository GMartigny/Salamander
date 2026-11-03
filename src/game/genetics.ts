import { DETAIL_INHERIT_CHANCE, FEW_DECORATIONS_IUSTUS_CHANCE, MUTATION_CHANCE } from "../data/balance";
import { type ColorId, COLORS, neighbors, WILDCARD_COLOR } from "../data/colors";
import type { DetailId } from "../data/details";
import { THEME_DETAILS } from "../data/decorations";
import { fusionResult, type PatternId } from "../data/patterns";
import { chance, pick, type Random, weightedPick } from "./random";
import type { Genome } from "./salamander";
import { hasFewDecorations, mainTheme, type Terrarium, themeDetailChance } from "./terrarium";

/** What happened during a birth, to fill the discovery map. */
export interface BirthReport {
  genome: Genome;
  /** Color mutations observed, as [from, to]. */
  mutations: [ColorId, ColorId][];
  /** Pattern fusion that happened, as [parent, parent, result]. */
  fusion: [PatternId, PatternId, PatternId] | null;
  /** Parent patterns that have no recipe, as [parent, parent]. */
  noFusion: [PatternId, PatternId] | null;
}

/** Mutates to a neighbor in the color graph, picked by rarity weight. */
function mutate(color: ColorId, random: Random, exclude?: ColorId): ColorId {
  const options = neighbors(color).filter((c) => c !== exclude || c === WILDCARD_COLOR);
  return weightedPick(options, (c) => COLORS[c].weight, random);
}

function inheritColor(color: ColorId, random: Random, mutations: [ColorId, ColorId][]): ColorId {
  if (!chance(MUTATION_CHANCE, random)) return color;
  const mutated = mutate(color, random);
  mutations.push([color, mutated]);
  return mutated;
}

function samePair(a: ColorId, b: ColorId): boolean {
  return a === b && a !== WILDCARD_COLOR;
}

function inheritPattern(mother: Genome, father: Genome, terrarium: Terrarium, random: Random, report: BirthReport): PatternId {
  // A recipe always works, so one try is enough to know whether two patterns fuse.
  const fused = fusionResult(mother.pattern, father.pattern);
  if (fused) {
    report.fusion = [mother.pattern, father.pattern, fused];
    return fused;
  }
  report.noFusion = [mother.pattern, father.pattern];
  if (hasFewDecorations(terrarium) && chance(FEW_DECORATIONS_IUSTUS_CHANCE, random)) return "iustus";
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
export function breed(mother: Genome, father: Genome, terrarium: Terrarium, random: Random = Math.random): BirthReport {
  const report: BirthReport = { genome: mother, mutations: [], fusion: null, noFusion: null };
  const primary = inheritColor(pick([mother.primary, father.primary], random), random, report.mutations);

  const pool = [mother.secondary, father.secondary].filter((c) => !samePair(c, primary));
  let secondary: ColorId;
  if (pool.length) {
    secondary = inheritColor(pick(pool, random), random, report.mutations);
  } else {
    secondary = mutate(mother.secondary, random, primary);
    report.mutations.push([mother.secondary, secondary]);
  }
  if (samePair(secondary, primary)) {
    const forced = mutate(secondary, random, primary);
    report.mutations.push([secondary, forced]);
    secondary = forced;
  }

  report.genome = {
    primary,
    secondary,
    pattern: inheritPattern(mother, father, terrarium, random, report),
    detail: inheritDetail(mother, father, terrarium, random),
  };
  return report;
}
