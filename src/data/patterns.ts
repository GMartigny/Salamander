/**
 * Patterns (see doc/GDD.md, "Patterns: fusion").
 * Fusion recipes are still to be defined.
 */

export const PATTERN_IDS = [
  "recta",
  "riga",
  "folia",
  "nuba",
  "macula",
  "puncta",
  "annula",
  "progressa",
  "gamba",
  "capita",
  "voluta",
  "sagitta",
  "stella",
  "crania",
  "iustus",
] as const;

export type PatternId = (typeof PATTERN_IDS)[number];

export const PATTERN_NAMES: Record<PatternId, string> = {
  recta: "Vertical lines",
  riga: "Zebra",
  folia: "Leaf",
  nuba: "Clouds",
  macula: "Splash",
  puncta: "Dots",
  annula: "Rings",
  progressa: "Gradient",
  gamba: "Legs only",
  capita: "Head only",
  voluta: "Swirls",
  sagitta: "Arrows",
  stella: "Star",
  crania: "Skull",
  iustus: "No pattern",
};

/** Fusion recipe: two parent patterns can produce a new pattern. */
export interface FusionRecipe {
  parents: readonly [PatternId, PatternId];
  result: PatternId;
  chance: number;
}

// TODO: define the recipes (example taken from the GDD).
export const FUSION_RECIPES: FusionRecipe[] = [
  { parents: ["puncta", "annula"], result: "stella", chance: 0.05 },
];
