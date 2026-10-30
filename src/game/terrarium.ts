import { type DecorationQuality, TERRARIUM_SIZES, type TerrariumSize } from "../data/balance";
import type { DecorationTheme, DecorationType } from "../data/decorations";
import type { Salamander } from "./salamander";

/**
 * Bought at quality 1, then upgraded in place; quality adds happiness.
 * The theme favors one detail and personalizes the terrarium.
 */
export interface Decoration {
  id: string;
  name: string;
  type: DecorationType;
  theme: DecorationTheme;
  quality: DecorationQuality;
}

/** The terrarium is the breeding pen; eggs incubate inside and take up a slot. */
export interface Terrarium {
  id: string;
  /** Bought small, then upgraded in place; the size sets the capacity. */
  size: TerrariumSize;
  /** Purchase rank among the player's terrariums (1-based), used for prices. */
  rank: number;
  decorations: Decoration[];
  inhabitants: Salamander[];
}

export function hasRoom(terrarium: Terrarium): boolean {
  return terrarium.inhabitants.length < TERRARIUM_SIZES[terrarium.size].capacity;
}
