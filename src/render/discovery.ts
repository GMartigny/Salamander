import { COLOR_IDS, COLORS, type ColorId, MUTATION_LINKS, WILDCARD_COLOR } from "../data/colors";
import { FUSION_RECIPES, PATTERNS } from "../data/patterns";
import { linkKey, recipeKey } from "../game/game";
import type { GameState } from "../game/state";
import { COLOR_HEX } from "./salamander";

/** Position of each color on the map, laid out like the "Couleurs" drawing: from white on the left to the rarest colors. */
const POSITIONS: Record<ColorId, [number, number]> = {
  white: [32, 150],
  transparent: [32, 250],
  yellow: [104, 60],
  lightGreen: [104, 150],
  silver: [104, 205],
  lightBlue: [104, 270],
  orange: [184, 35],
  neonGreen: [184, 100],
  pineGreen: [184, 150],
  black: [184, 205],
  darkBlue: [184, 270],
  gold: [262, 35],
  red: [262, 95],
  brown: [262, 180],
  purple: [262, 270],
  pink: [330, 180],
  chameleon: [330, 60],
};

export const TOTAL_LINKS = MUTATION_LINKS.length + COLOR_IDS.length - 1;

/** The color graph, showing only discovered colors and the mutations observed between them. */
export function discoveryMapSvg(state: GameState): string {
  const found = new Set(state.discoveredColors);
  const links = new Set(state.discoveredLinks);
  const edges = [
    ...MUTATION_LINKS,
    ...COLOR_IDS.filter((c) => c !== WILDCARD_COLOR).map((c) => [c, WILDCARD_COLOR] as const),
  ]
    .filter(([a, b]) => found.has(a) && found.has(b) && links.has(linkKey(a, b)))
    .map(([a, b]) => {
      const [x1, y1] = POSITIONS[a];
      const [x2, y2] = POSITIONS[b];
      const dashed = b === WILDCARD_COLOR || b === "transparent" || a === "transparent";
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="currentColor" stroke-opacity=".45" stroke-width="1.5" ${dashed ? 'stroke-dasharray="4 3"' : ""}/>`;
    });
  const nodes = COLOR_IDS.filter((c) => found.has(c)).map((c) => {
    const [x, y] = POSITIONS[c];
    const fill = c === "transparent" ? `fill="${COLOR_HEX[c]}" fill-opacity=".5"` : `fill="${COLOR_HEX[c]}"`;
    const animate =
      c === WILDCARD_COLOR
        ? `<animate attributeName="fill" values="#d93b30;#f2d43d;#5bc8e8;#8e44ad;#d93b30" dur="8s" repeatCount="indefinite"/>`
        : "";
    return `<g><circle cx="${x}" cy="${y}" r="13" ${fill} stroke="currentColor" stroke-opacity=".5">${animate}</circle>
      <text x="${x}" y="${y + 25}" text-anchor="middle" font-size="9" fill="currentColor">${COLORS[c].name}</text></g>`;
  });
  return `<svg viewBox="0 0 362 300" class="discovery-map" role="img" aria-label="Map of discovered colors">${edges.join("")}${nodes.join("")}</svg>`;
}

/** Fusion recipes the player has seen happen. */
export function recipesList(state: GameState): string {
  const found = new Set(state.discoveredRecipes);
  const items = FUSION_RECIPES.filter(({ parents: [a, b] }) => found.has(recipeKey(a, b))).map(
    ({ parents: [a, b], result }) => `<li>${PATTERNS[a].name} + ${PATTERNS[b].name} → <strong>${PATTERNS[result].name}</strong></li>`,
  );
  return `<p>${items.length} / ${FUSION_RECIPES.length} recipes found</p><ul class="recipes">${items.join("")}</ul>`;
}
