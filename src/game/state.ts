import type { Terrarium } from "./terrarium";

/** État complet d'une partie, sérialisable pour la sauvegarde locale. */
export interface GameState {
  coins: number;
  terrariums: Terrarium[];
  /** Clés des combinaisons découvertes (encyclopédie). */
  discovered: string[];
  /** Horodatage (ms) de la dernière mise à jour, pour rattraper la progression hors ligne. */
  lastTick: number;
}

// TODO : budget de départ = un petit terrarium + un couple de salamandres communes.
export function createInitialState(now: number = Date.now()): GameState {
  return {
    coins: 0,
    terrariums: [],
    discovered: [],
    lastTick: now,
  };
}
