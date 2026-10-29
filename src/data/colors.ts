/**
 * Colors and mutation graph (see doc/GDD.md, "Colors and mutations").
 * Latin names come from the "Espèces" spreadsheet (light blue = cyan, dark blue = blue, neon green = lime green).
 * Their final form depends on the species naming convention, still to decide.
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
  latin: string;
  /** Relative weight when a mutation picks this color: higher is more common (temporary values). */
  weight: number;
}

export const COLORS: Record<ColorId, ColorDef> = {
  white: { id: "white", name: "White", latin: "albus", weight: 100 },
  silver: { id: "silver", name: "Silver", latin: "argenteus", weight: 10 },
  gold: { id: "gold", name: "Gold", latin: "aureus", weight: 10 },
  yellow: { id: "yellow", name: "Yellow", latin: "flavus", weight: 50 },
  orange: { id: "orange", name: "Orange", latin: "rutilus", weight: 50 },
  red: { id: "red", name: "Red", latin: "rubeus", weight: 30 },
  brown: { id: "brown", name: "Brown", latin: "fuscus", weight: 50 },
  pink: { id: "pink", name: "Pink", latin: "violaceus", weight: 50 },
  purple: { id: "purple", name: "Purple", latin: "purpureus", weight: 10 },
  lightBlue: { id: "lightBlue", name: "Light blue", latin: "azureus", weight: 50 },
  darkBlue: { id: "darkBlue", name: "Dark blue", latin: "caeruleus", weight: 50 },
  lightGreen: { id: "lightGreen", name: "Light green", latin: "viridis", weight: 50 },
  neonGreen: { id: "neonGreen", name: "Neon green", latin: "citreus", weight: 50 },
  pineGreen: { id: "pineGreen", name: "Pine green", latin: "prasinus", weight: 50 },
  black: { id: "black", name: "Black", latin: "ebenus", weight: 30 },
  transparent: { id: "transparent", name: "Transparent", latin: "vitreus", weight: 1 },
  chameleon: { id: "chameleon", name: "Chameleon", latin: "talpus", weight: 1 },
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
