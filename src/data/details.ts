/**
 * Details (see doc/GDD.md, "Details: environment").
 * Their appearance is influenced by terrarium decorations.
 */

export const DETAIL_IDS = [
  "none",
  "cornum",
  "palmatum",
  "lucidum",
  "oculum",
  "pumilum",
  "frondosum",
] as const;

export type DetailId = (typeof DETAIL_IDS)[number];

export const DETAIL_NAMES: Record<DetailId, string> = {
  none: "None",
  cornum: "Horned",
  palmatum: "Webbed",
  lucidum: "Luminescent",
  oculum: "Big eyes",
  pumilum: "Dwarf",
  frondosum: "Leafy",
};
