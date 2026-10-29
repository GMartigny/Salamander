import type { ColorId } from "../data/colors";
import type { DetailId } from "../data/details";
import type { PatternId } from "../data/patterns";

/** Les quatre gènes d'une salamandre (voir doc/GDD.md, « Génétique »). */
export interface Genome {
  /** Couleur de fond. */
  primary: ColorId;
  /** Couleur du pattern ; toujours différente de la principale, sauf caméléon / caméléon. */
  secondary: ColorId;
  pattern: PatternId;
  detail: DetailId;
}

export type Sex = "male" | "female";

/** Œuf → pupe → adulte ; l'adulte vit indéfiniment. */
export type Stage = "egg" | "pupa" | "adult";

export interface Salamander {
  id: string;
  genome: Genome;
  sex: Sex;
  stage: Stage;
  /** Horodatage (ms) du passage au stade courant. */
  stageSince: number;
}

/** Nom d'espèce latin, construit à partir des gènes. */
export function speciesName(_genome: Genome): string {
  // TODO : définir l'ordre et l'accord des termes latins.
  throw new Error("Non implémenté");
}
