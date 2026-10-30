import { MARKET } from "../data/balance";
import { COLOR_IDS, COLORS } from "../data/colors";
import { DECORATION_THEMES, DECORATION_TYPES } from "../data/decorations";
import { DETAIL_IDS } from "../data/details";
import { PATTERN_IDS, PATTERNS } from "../data/patterns";
import { chance, pick, type Random, weightedPick } from "./random";
import { specimenPrice } from "./rarity";
import type { Genome, Sex } from "./salamander";
import { type GameState, newId } from "./state";

const COMMON_WEIGHT = 50;
const MARKET_DETAIL_CHANCE = 0.1;

/** A genome made only of common traits, without detail. */
function commonGenome(random: Random): Genome {
  const colors = COLOR_IDS.filter((c) => COLORS[c].weight >= COMMON_WEIGHT);
  const primary = pick(colors, random);
  const secondary = pick(
    colors.filter((c) => c !== primary),
    random,
  );
  const pattern = pick(
    PATTERN_IDS.filter((p) => PATTERNS[p].weight >= COMMON_WEIGHT && p !== "iustus"),
    random,
  );
  return { primary, secondary, pattern, detail: "none" };
}

/** A genome where every trait is drawn by rarity weight. */
function weightedGenome(random: Random): Genome {
  const primary = weightedPick(COLOR_IDS, (c) => COLORS[c].weight, random);
  const secondary = weightedPick(
    COLOR_IDS.filter((c) => c !== primary || c === "chameleon"),
    (c) => COLORS[c].weight,
    random,
  );
  const pattern = weightedPick(PATTERN_IDS, (p) => PATTERNS[p].weight, random);
  const detail = chance(MARKET_DETAIL_CHANCE, random) ? pick(DETAIL_IDS.filter((d) => d !== "none"), random) : "none";
  return { primary, secondary, pattern, detail };
}

/** New market offer: always a common male and female, then specimens drawn by rarity, and decorations. */
export function refreshMarket(state: GameState, now: number, random: Random): void {
  const specimens = Array.from({ length: MARKET.specimens }, (_, i) => {
    const genome = i < MARKET.lowRarity ? commonGenome(random) : weightedGenome(random);
    const sex: Sex = i < MARKET.lowRarity ? (i === 0 ? "female" : "male") : pick(["female", "male"] as const, random);
    return { id: newId(state, "o"), genome, sex, price: specimenPrice(genome) };
  });
  const decorations = Array.from({ length: MARKET.decorations }, () => ({
    id: newId(state, "d"),
    type: pick(DECORATION_TYPES, random),
    theme: pick(DECORATION_THEMES, random),
  }));
  state.market = { specimens, decorations, refreshedAt: now };
}
