import { COLORS, type ColorId } from "../data/colors";
import type { DetailId } from "../data/details";
import { PATTERNS, type PatternId } from "../data/patterns";

/** The four genes of a salamander (see doc/GDD.md, "Genetics"). */
export interface Genome {
  /** Background color. */
  primary: ColorId;
  /** Pattern color; always differs from the primary, except chameleon / chameleon. */
  secondary: ColorId;
  pattern: PatternId;
  detail: DetailId;
}

export type Sex = "male" | "female";

/** Egg → pupa → adult; adults live forever. */
export type Stage = "egg" | "pupa" | "adult";

export interface Pregnancy {
  /** Genome of the male that fertilized the female. */
  father: Genome;
  /** Timestamp (ms) of the mating; the egg is laid after the gestation, as soon as there is room. */
  since: number;
}

export interface Salamander {
  id: string;
  genome: Genome;
  sex: Sex;
  stage: Stage;
  /** Timestamp (ms) when the current stage started. */
  stageSince: number;
  /** Females only: current pregnancy. */
  pregnancy?: Pregnancy | null;
  /** Females only: timestamp (ms) of the next mating, or null when no male is around. */
  nextMatingAt?: number | null;
  /** Females only: no mating before this timestamp (ms), after laying. */
  restUntil?: number;
  /** Mutations and fusion that produced this egg, revealed on the discovery map at adulthood. */
  birth?: {
    mutations: [string, string][];
    fusion: [string, string, string] | null;
    noFusion?: [string, string] | null;
  };
}

/**
 * Latin species name (see doc/GDD.md, "Species names"):
 * primary color (-us), secondary color + pattern (-o + -ata), detail (-um), e.g. "Albus Rubeopunctata Cornum".
 * Without a pattern, the hidden secondary color is left out ("nudata"); without a detail, the last word is left out.
 */
export function speciesName({ primary, secondary, pattern, detail }: Genome): string {
  const words = [
    COLORS[primary].latin,
    pattern === "iustus" ? PATTERNS.iustus.latin : COLORS[secondary].prefix + PATTERNS[pattern].latin,
  ];
  if (detail !== "none") words.push(detail);
  return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}
