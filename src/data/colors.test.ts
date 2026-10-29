import { describe, expect, it } from "vitest";
import { COLOR_IDS, MUTATION_LINKS, neighbors, STARTING_COLOR, WILDCARD_COLOR } from "./colors";

describe("graphe des couleurs", () => {
  it("compte 17 couleurs", () => {
    expect(COLOR_IDS).toHaveLength(17);
  });

  it("a des liens symétriques", () => {
    for (const [a, b] of MUTATION_LINKS) {
      expect(neighbors(a)).toContain(b);
      expect(neighbors(b)).toContain(a);
    }
  });

  it("rend chaque couleur accessible depuis le blanc", () => {
    const seen = new Set([STARTING_COLOR]);
    const queue = [STARTING_COLOR];
    while (queue.length) {
      for (const next of neighbors(queue.shift()!)) {
        if (!seen.has(next)) {
          seen.add(next);
          queue.push(next);
        }
      }
    }
    expect(seen.size).toBe(COLOR_IDS.length);
  });

  it("relie le caméléon à toutes les autres couleurs", () => {
    expect(neighbors(WILDCARD_COLOR)).toHaveLength(COLOR_IDS.length - 1);
  });

  it("ne permet le transparent que depuis le blanc", () => {
    const sources = COLOR_IDS.filter(
      (id) => id !== WILDCARD_COLOR && neighbors(id).includes("transparent"),
    );
    expect(sources).toEqual(["blanc"]);
  });
});
