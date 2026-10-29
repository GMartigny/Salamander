/**
 * Détails (voir doc/GDD.md, « Détails : environnement »).
 * Leur apparition est influencée par les décorations du terrarium.
 */

export const DETAIL_IDS = [
  "aucun",
  "cornum",
  "palmatum",
  "lucidum",
  "oculum",
  "pumilum",
  "frondosum",
] as const;

export type DetailId = (typeof DETAIL_IDS)[number];

export const DETAIL_NAMES: Record<DetailId, string> = {
  aucun: "Aucun",
  cornum: "Corné",
  palmatum: "Palmé",
  lucidum: "Luminescent",
  oculum: "Gros yeux",
  pumilum: "Nain",
  frondosum: "Feuillu",
};
