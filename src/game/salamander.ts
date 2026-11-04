import { COLOR_IDS, COLORS, type ColorId } from "../data/colors";
import { DETAIL_IDS, type DetailId } from "../data/details";
import { PATTERN_IDS, PATTERNS, type PatternId } from "../data/patterns";

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

const capitalize = (word: string) => word.charAt(0).toUpperCase() + word.slice(1);

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
  return words.map(capitalize).join(" ");
}


/**
 * Genome described by a species name, or null if the name is not valid.
 * Without a pattern the secondary color is hidden: any color other than the primary is returned.
 */
export function parseSpeciesName(name: string): Genome | null {
  const [first, second, third] = name.split(" ");
  const primary = COLOR_IDS.find((c) => capitalize(COLORS[c].latin) === first);
  if (!primary || !second) return null;
  const detail = third === undefined ? "none" : DETAIL_IDS.find((d) => d !== "none" && capitalize(d) === third);
  if (!detail) return null;
  if (second === capitalize(PATTERNS.iustus.latin)) {
    const secondary = COLOR_IDS.find((c) => c !== primary) ?? primary;
    return { primary, secondary, pattern: "iustus", detail };
  }
  for (const secondary of COLOR_IDS) {
    for (const pattern of PATTERN_IDS) {
      if (pattern !== "iustus" && capitalize(COLORS[secondary].prefix + PATTERNS[pattern].latin) === second) {
        return { primary, secondary, pattern, detail };
      }
    }
  }
  return null;
}
