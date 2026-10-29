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

export interface Salamander {
  id: string;
  genome: Genome;
  sex: Sex;
  stage: Stage;
  /** Sets the breeding rate; raised by the quality of the terrarium's decorations. */
  happiness: number;
  /** Timestamp (ms) when the current stage started. */
  stageSince: number;
}

/**
 * Latin species name (see doc/GDD.md, "Species names"):
 * primary color (-us), secondary color + pattern (-o + -ata), detail (-um), e.g. "Albus rubropunctata cornum".
 * Without a pattern, the hidden secondary color is left out ("nudata"); without a detail, the last word is left out.
 */
export function speciesName({ primary, secondary, pattern, detail }: Genome): string {
  const first = COLORS[primary].latin;
  const second = pattern === "iustus" ? PATTERNS.iustus.latin : COLORS[secondary].prefix + PATTERNS[pattern].latin;
  const words = [first.charAt(0).toUpperCase() + first.slice(1), second];
  if (detail !== "none") words.push(detail);
  return words.join(" ");
}
