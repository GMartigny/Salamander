import { describe, expect, it } from "vitest";
import { COLOR_IDS, MUTATION_LINKS, neighbors, STARTING_COLOR, WILDCARD_COLOR } from "./colors";

describe("color graph", () => {
  it("has 17 colors", () => {
    expect(COLOR_IDS).toHaveLength(17);
  });

  it("has symmetric links", () => {
    for (const [a, b] of MUTATION_LINKS) {
      expect(neighbors(a)).toContain(b);
      expect(neighbors(b)).toContain(a);
    }
  });

  it("makes every color reachable from white", () => {
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

  it("links the chameleon to every other color", () => {
    expect(neighbors(WILDCARD_COLOR)).toHaveLength(COLOR_IDS.length - 1);
  });

  it("only allows transparent from white", () => {
    const sources = COLOR_IDS.filter(
      (id) => id !== WILDCARD_COLOR && neighbors(id).includes("transparent"),
    );
    expect(sources).toEqual(["white"]);
  });
});
