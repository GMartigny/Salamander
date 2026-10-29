/**
 * Couleurs et graphe des mutations (voir doc/GDD.md, « Couleurs et mutations »).
 * Les noms latins reprennent le tableau « Espèces » ; ceux marqués « à confirmer » restent à trancher.
 */

export const COLOR_IDS = [
  "blanc",
  "argent",
  "dore",
  "jaune",
  "orange",
  "rouge",
  "marron",
  "rose",
  "violet",
  "bleuClair",
  "bleuFonce",
  "vertClair",
  "vertNeon",
  "vertSapin",
  "noir",
  "transparent",
  "cameleon",
] as const;

export type ColorId = (typeof COLOR_IDS)[number];

export interface ColorDef {
  id: ColorId;
  name: string;
  latin: string;
}

export const COLORS: Record<ColorId, ColorDef> = {
  blanc: { id: "blanc", name: "Blanc", latin: "albus" },
  argent: { id: "argent", name: "Argent", latin: "argenteus" },
  dore: { id: "dore", name: "Doré", latin: "aureus" },
  jaune: { id: "jaune", name: "Jaune", latin: "flavus" },
  orange: { id: "orange", name: "Orange", latin: "rutilus" },
  rouge: { id: "rouge", name: "Rouge", latin: "rubeus" },
  marron: { id: "marron", name: "Marron", latin: "fuscus" },
  rose: { id: "rose", name: "Rose", latin: "violaceus" },
  violet: { id: "violet", name: "Violet", latin: "purpureus" },
  bleuClair: { id: "bleuClair", name: "Bleu clair", latin: "azureus" }, // à confirmer
  bleuFonce: { id: "bleuFonce", name: "Bleu foncé", latin: "caeruleus" }, // à confirmer
  vertClair: { id: "vertClair", name: "Vert clair", latin: "viridis" },
  vertNeon: { id: "vertNeon", name: "Vert néon", latin: "citreus" }, // à confirmer
  vertSapin: { id: "vertSapin", name: "Vert sapin", latin: "prasinus" },
  noir: { id: "noir", name: "Noir", latin: "ebenus" },
  transparent: { id: "transparent", name: "Transparent", latin: "vitreus" },
  cameleon: { id: "cameleon", name: "Caméléon", latin: "talpus" }, // à confirmer
};

/** Couleur de départ du jeu. */
export const STARTING_COLOR: ColorId = "blanc";

/** Couleur reliée à toutes les autres (transition très rare). */
export const WILDCARD_COLOR: ColorId = "cameleon";

/**
 * Liens de mutation, valables dans les deux sens.
 * Le caméléon n'apparaît pas ici : il est relié à toutes les couleurs.
 */
export const MUTATION_LINKS: ReadonlyArray<readonly [ColorId, ColorId]> = [
  ["blanc", "jaune"],
  ["blanc", "vertClair"],
  ["blanc", "argent"],
  ["blanc", "bleuClair"],
  ["blanc", "transparent"],
  ["jaune", "orange"],
  ["jaune", "vertNeon"],
  ["vertClair", "vertSapin"],
  ["argent", "noir"],
  ["bleuClair", "bleuFonce"],
  ["vertNeon", "vertSapin"],
  ["vertSapin", "noir"],
  ["noir", "bleuFonce"],
  ["orange", "dore"],
  ["orange", "rouge"],
  ["bleuFonce", "violet"],
  ["noir", "marron"],
  ["rouge", "marron"],
  ["rouge", "rose"],
  ["violet", "rose"],
];

/** Couleurs vers lesquelles `color` peut muter. */
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
