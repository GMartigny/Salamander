import type { Terrarium } from "./terrarium";

/** Full game state, serializable for local saves. */
export interface GameState {
  coins: number;
  terrariums: Terrarium[];
  /** Keys of discovered combinations (encyclopedia). */
  discovered: string[];
  /** Timestamp (ms) of the last update, used to catch up on offline progress. */
  lastTick: number;
}

// TODO: starting budget = a small terrarium + a pair of common salamanders.
export function createInitialState(now: number = Date.now()): GameState {
  return {
    coins: 0,
    terrariums: [],
    discovered: [],
    lastTick: now,
  };
}
