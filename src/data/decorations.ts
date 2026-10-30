/**
 * Decoration types and themes (see doc/GDD.md, "Details: environment" and "Economy").
 */

import type { DetailId } from "./details";

export const DECORATION_TYPES = ["plant", "rock", "light", "toy", "shelter"] as const;

export type DecorationType = (typeof DECORATION_TYPES)[number];

export const DECORATION_TYPE_NAMES: Record<DecorationType, string> = {
  plant: "Plant",
  rock: "Rock",
  light: "Light",
  toy: "Toy",
  shelter: "Shelter",
};

export const DECORATION_THEMES = ["desert", "swamp", "cave", "deepOcean", "city", "jungle"] as const;

export type DecorationTheme = (typeof DECORATION_THEMES)[number];

export const DECORATION_THEME_NAMES: Record<DecorationTheme, string> = {
  desert: "Desert",
  swamp: "Swamp",
  cave: "Cave",
  deepOcean: "Deep ocean",
  city: "City",
  jungle: "Jungle",
};

/** Each theme favors exactly one detail. */
export const THEME_DETAILS: Record<DecorationTheme, Exclude<DetailId, "none">> = {
  desert: "cornum",
  swamp: "palmatum",
  cave: "lucidum",
  deepOcean: "oculum",
  city: "pumilum",
  jungle: "frondosum",
};
