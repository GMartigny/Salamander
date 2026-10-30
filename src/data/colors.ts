/**
 * Colors and mutation graph (see doc/GDD.md, "Colors and mutations").
 * Latin names come from the "Espèces" spreadsheet (light blue = cyan, dark blue = blue, neon green = lime green),
 * adapted to the species naming convention (see doc/GDD.md, "Species names").
 */

export const COLOR_IDS = [
  "white",
  "silver",
  "gold",
  "yellow",
  "orange",
  "red",
  "brown",
  "pink",
  "purple",
  "lightBlue",
  "darkBlue",
  "lightGreen",
  "neonGreen",
  "pineGreen",
  "black",
  "transparent",
  "chameleon",
] as const;

export type ColorId = (typeof COLOR_IDS)[number];

export interface ColorDef {
  id: ColorId;
  name: string;
  /** Word used for the primary color in species names, always ending in -us. */
  latin: string;
  /** Combining form used before the pattern for the secondary color: the word with -us replaced by -o. */
  prefix: string;
  /** Relative weight when a mutation picks this color: higher is more common (temporary values). */
  weight: number;
}

export const COLORS: Record<ColorId, ColorDef> = {
  white: { id: "white", name: "White", latin: "albus", prefix: "albo", weight: 100 },
  silver: { id: "silver", name: "Silver", latin: "argenteus", prefix: "argenteo", weight: 10 },
  gold: { id: "gold", name: "Gold", latin: "aureus", prefix: "aureo", weight: 10 },
  yellow: { id: "yellow", name: "Yellow", latin: "flavus", prefix: "flavo", weight: 50 },
  orange: { id: "orange", name: "Orange", latin: "rutilus", prefix: "rutilo", weight: 50 },
  red: { id: "red", name: "Red", latin: "rubeus", prefix: "rubeo", weight: 30 },
  brown: { id: "brown", name: "Brown", latin: "fuscus", prefix: "fusco", weight: 50 },
  pink: { id: "pink", name: "Pink", latin: "roseus", prefix: "roseo", weight: 50 },
  purple: { id: "purple", name: "Purple", latin: "purpureus", prefix: "purpureo", weight: 10 },
  lightBlue: { id: "lightBlue", name: "Light blue", latin: "azureus", prefix: "azureo", weight: 50 },
  darkBlue: { id: "darkBlue", name: "Dark blue", latin: "caeruleus", prefix: "caeruleo", weight: 50 },
  lightGreen: { id: "lightGreen", name: "Light green", latin: "viridus", prefix: "virido", weight: 50 },
  neonGreen: { id: "neonGreen", name: "Neon green", latin: "citreus", prefix: "citreo", weight: 50 },
  pineGreen: { id: "pineGreen", name: "Pine green", latin: "prasinus", prefix: "prasino", weight: 50 },
  black: { id: "black", name: "Black", latin: "ebenus", prefix: "ebeno", weight: 30 },
  transparent: { id: "transparent", name: "Transparent", latin: "vitreus", prefix: "vitreo", weight: 1 },
  chameleon: { id: "chameleon", name: "Chameleon", latin: "mutabilus", prefix: "mutabilo", weight: 1 },
};

/** Starting color of the game. */
export const STARTING_COLOR: ColorId = "white";

/** Color linked to every other color (very rare transition). */
export const WILDCARD_COLOR: ColorId = "chameleon";

/**
 * Mutation links, valid both ways.
 * The chameleon is not listed here: it is linked to every color.
 */
export const MUTATION_LINKS: ReadonlyArray<readonly [ColorId, ColorId]> = [
  ["white", "yellow"],
  ["white", "lightGreen"],
  ["white", "silver"],
  ["white", "lightBlue"],
  ["white", "transparent"],
  ["yellow", "orange"],
  ["yellow", "neonGreen"],
  ["lightGreen", "pineGreen"],
  ["silver", "black"],
  ["lightBlue", "darkBlue"],
  ["neonGreen", "pineGreen"],
  ["pineGreen", "black"],
  ["black", "darkBlue"],
  ["orange", "gold"],
  ["orange", "red"],
  ["darkBlue", "purple"],
  ["black", "brown"],
  ["red", "brown"],
  ["red", "pink"],
  ["purple", "pink"],
];

/** Colors that `color` can mutate into. */
export function neighbors(color: ColorId): ColorId[] {
  if (color === WILDCARD_COLOR) {
    return COLOR_IDS.filter((id) => id !== WILDCARD_COLOR);
  }
  const result = new Set<ColorId>();
  for (const [a, b] of MUTATION_LINKS) {
    if (a === color) result.add(b);
    if (b === color) result.add(a);
  }
  result.add(WILDCARD_COLOR);
  return [...result];
}
