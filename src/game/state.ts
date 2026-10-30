import type { DecorationQuality } from "../data/balance";
import type { DecorationTheme, DecorationType } from "../data/decorations";
import type { Genome, Salamander, Sex } from "./salamander";
import type { Terrarium } from "./terrarium";

export interface SpecimenOffer {
  id: string;
  genome: Genome;
  sex: Sex;
  price: number;
}

export interface DecorationOffer {
  id: string;
  type: DecorationType;
  theme: DecorationTheme;
}

/** A bought specimen on its way to a terrarium; it already takes up a slot there. */
export interface Delivery {
  salamander: Salamander;
  terrariumId: string;
  arrivesAt: number;
}

/** Full game state, serializable for local saves. */
export interface GameState {
  coins: number;
  terrariums: Terrarium[];
  market: {
    specimens: SpecimenOffer[];
    decorations: DecorationOffer[];
    refreshedAt: number;
  };
  deliveries: Delivery[];
  /** Species names discovered (encyclopedia). */
  discovered: string[];
  /** Highest quality reached for each decoration, keyed "theme:type". */
  decorationsSeen: Record<string, DecorationQuality>;
  /** Whether the very first laying of the game has happened. */
  hasLaid: boolean;
  /** Counter for unique ids. */
  nextId: number;
  /** Timestamp (ms) of the last update, used to catch up on offline progress. */
  lastTick: number;
}

export function newId(state: GameState, prefix: string): string {
  state.nextId += 1;
  return `${prefix}${state.nextId}`;
}
