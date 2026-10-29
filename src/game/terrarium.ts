import type { DetailId } from "../data/details";
import type { Salamander } from "./salamander";

/** Une décoration augmente la chance de reproduction et favorise certains détails. */
export interface Decoration {
  id: string;
  name: string;
  breedingBonus: number;
  favoredDetails: DetailId[];
}

/** Le terrarium sert d'enclos de reproduction ; les œufs y incubent et occupent une place. */
export interface Terrarium {
  id: string;
  capacity: number;
  decorations: Decoration[];
  inhabitants: Salamander[];
}

export function hasRoom(terrarium: Terrarium): boolean {
  return terrarium.inhabitants.length < terrarium.capacity;
}
