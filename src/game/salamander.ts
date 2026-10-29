import type { ColorId } from "../data/colors";
import type { DetailId } from "../data/details";
import type { PatternId } from "../data/patterns";

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

/** Latin species name, built from the genes. */
export function speciesName(_genome: Genome): string {
  // TODO: define the order and agreement of the Latin terms.
  throw new Error("Not implemented");
}
