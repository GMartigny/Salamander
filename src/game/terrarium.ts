import type { DetailId } from "../data/details";
import type { Salamander } from "./salamander";

/** A decoration increases the breeding chance and favors certain details. */
export interface Decoration {
  id: string;
  name: string;
  breedingBonus: number;
  favoredDetails: DetailId[];
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
