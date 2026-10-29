import type { Salamander } from "./salamander";

/** Decoration themes (list to be completed, see doc/GDD.md, "Economy"). */
export type DecorationTheme = "desert" | "swamp" | "jungle";

/**
 * A decoration's quality adds happiness and sets its price;
 * its theme favors certain details and personalizes the terrarium.
 */
export interface Decoration {
  id: string;
  name: string;
  theme: DecorationTheme;
  quality: number;
}

/** The terrarium is the breeding pen; eggs incubate inside and take up a slot. */
export interface Terrarium {
  id: string;
  capacity: number;
  decorations: Decoration[];
  inhabitants: Salamander[];
}

export function hasRoom(terrarium: Terrarium): boolean {
  return terrarium.inhabitants.length < terrarium.capacity;
}
