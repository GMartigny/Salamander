/**
 * Patterns (see doc/GDD.md, "Patterns: fusion").
 * Fusion recipes mirror the "Mélange des pattern" tab of the "Espèces" spreadsheet.
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

export interface PatternDef {
  id: PatternId;
  name: string;
  /** Relative weight, higher is more common (temporary values). */
  weight: number;
}

export const PATTERNS: Record<PatternId, PatternDef> = {
  recta: { id: "recta", name: "Vertical lines", weight: 100 },
  riga: { id: "riga", name: "Zebra", weight: 50 },
  folia: { id: "folia", name: "Leaf", weight: 50 },
  nuba: { id: "nuba", name: "Clouds", weight: 30 },
  macula: { id: "macula", name: "Splash", weight: 50 },
  puncta: { id: "puncta", name: "Dots", weight: 30 },
  annula: { id: "annula", name: "Rings", weight: 50 },
  progressa: { id: "progressa", name: "Gradient", weight: 50 },
  gamba: { id: "gamba", name: "Legs only", weight: 50 },
  capita: { id: "capita", name: "Head only", weight: 50 },
  voluta: { id: "voluta", name: "Swirls", weight: 50 },
  sagitta: { id: "sagitta", name: "Arrows", weight: 50 },
  stella: { id: "stella", name: "Star", weight: 50 },
  crania: { id: "crania", name: "Skull", weight: 1 },
  iustus: { id: "iustus", name: "No pattern", weight: 50 },
};

/** Fusion recipe: crossing these two parent patterns can produce a new pattern. */
export interface FusionRecipe {
  parents: readonly [PatternId, PatternId];
  result: PatternId;
}

/**
 * Each result appears in exactly one recipe. Recta is the base pattern and never a result.
 * Dots (puncta) and clouds (nuba) are the bridges that lead to the rarer patterns.
 */
export const FUSION_RECIPES: readonly FusionRecipe[] = [
  { parents: ["recta", "recta"], result: "riga" },
  { parents: ["recta", "riga"], result: "sagitta" },
  { parents: ["riga", "riga"], result: "annula" },
  { parents: ["annula", "annula"], result: "puncta" },
  { parents: ["puncta", "puncta"], result: "nuba" },
  { parents: ["nuba", "nuba"], result: "macula" },
  { parents: ["recta", "nuba"], result: "progressa" },
  { parents: ["puncta", "annula"], result: "stella" },
  { parents: ["nuba", "sagitta"], result: "folia" },
  { parents: ["folia", "folia"], result: "voluta" },
  { parents: ["annula", "progressa"], result: "gamba" },
  { parents: ["gamba", "gamba"], result: "capita" },
  { parents: ["puncta", "capita"], result: "crania" },
];

/** Pattern produced by fusing two parent patterns, if a recipe exists (order does not matter). */
export function fusionResult(a: PatternId, b: PatternId): PatternId | undefined {
  return FUSION_RECIPES.find(
    ({ parents: [x, y] }) => (x === a && y === b) || (x === b && y === a),
  )?.result;
}
