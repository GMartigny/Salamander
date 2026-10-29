import type { DecorationTheme, DecorationType } from "../data/decorations";
import type { Salamander } from "./salamander";

/**
 * A decoration's quality adds happiness and sets its price;
 * its theme favors one detail and personalizes the terrarium.
 */
export interface Decoration {
  id: string;
  name: string;
  type: DecorationType;
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
