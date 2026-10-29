/**
 * Patterns (voir doc/GDD.md, « Patterns : fusion »).
 * Les recettes de fusion restent à définir.
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
  recta: "Lignes verticales",
  riga: "Zébré",
  folia: "Feuille",
  nuba: "Nuages",
  macula: "Splash",
  puncta: "Points",
  annula: "Anneaux",
  progressa: "Dégradé",
  gamba: "Pattes seules",
  capita: "Tête seule",
  voluta: "Volutes",
  sagitta: "Flèches",
  stella: "Étoile",
  crania: "Crâne",
  iustus: "Sans pattern",
};

/** Recette de fusion : deux patterns parents peuvent donner un nouveau pattern. */
export interface FusionRecipe {
  parents: readonly [PatternId, PatternId];
  result: PatternId;
  chance: number;
}

// TODO : définir les recettes (exemple tiré du GDD).
export const FUSION_RECIPES: FusionRecipe[] = [
  { parents: ["puncta", "annula"], result: "stella", chance: 0.05 },
];
