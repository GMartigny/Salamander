import type { Genome } from "./salamander";

/** Source d'aléatoire injectable pour rendre les tirages testables. */
export type Random = () => number;

/**
 * Génome d'un petit à partir de ses parents (voir doc/GDD.md, « Hérédité des couleurs ») :
 * 1. couleur principale héritée puis mutation éventuelle ;
 * 2. couleur secondaire tirée sans la principale ;
 * 3. pool vide → mutation forcée vers une voisine.
 * Pattern par fusion, détail influencé par les décorations.
 */
export function breed(_mother: Genome, _father: Genome, _random: Random = Math.random): Genome {
  // TODO : implémenter une fois les raretés chiffrées.
  throw new Error("Non implémenté");
}
