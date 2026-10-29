/**
 * Colors and mutation graph (see doc/GDD.md, "Colors and mutations").
 * Latin names come from the "Espèces" spreadsheet; those marked "to confirm" are still open.
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
}

export const COLORS: Record<ColorId, ColorDef> = {
  white: { id: "white", name: "White", latin: "albus" },
  silver: { id: "silver", name: "Silver", latin: "argenteus" },
  gold: { id: "gold", name: "Gold", latin: "aureus" },
  yellow: { id: "yellow", name: "Yellow", latin: "flavus" },
  orange: { id: "orange", name: "Orange", latin: "rutilus" },
  red: { id: "red", name: "Red", latin: "rubeus" },
  brown: { id: "brown", name: "Brown", latin: "fuscus" },
  pink: { id: "pink", name: "Pink", latin: "violaceus" },
  purple: { id: "purple", name: "Purple", latin: "purpureus" },
  lightBlue: { id: "lightBlue", name: "Light blue", latin: "azureus" }, // to confirm
  darkBlue: { id: "darkBlue", name: "Dark blue", latin: "caeruleus" }, // to confirm
  lightGreen: { id: "lightGreen", name: "Light green", latin: "viridis" },
  neonGreen: { id: "neonGreen", name: "Neon green", latin: "citreus" }, // to confirm
  pineGreen: { id: "pineGreen", name: "Pine green", latin: "prasinus" },
  black: { id: "black", name: "Black", latin: "ebenus" },
  transparent: { id: "transparent", name: "Transparent", latin: "vitreus" },
  chameleon: { id: "chameleon", name: "Chameleon", latin: "talpus" }, // to confirm
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
