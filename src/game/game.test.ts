import { describe, expect, it } from "vitest";
import { terrariumPrice } from "../data/balance";
import { advance, buySpecimen, buyTerrarium, newGame, STARTING_COINS } from "./game";
import { breed } from "./genetics";
import type { Random } from "./random";
import type { Genome } from "./salamander";
import type { Terrarium } from "./terrarium";

/** Deterministic random numbers (mulberry32). */
function seeded(seed: number): Random {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const emptyTerrarium: Terrarium = {
  id: "t",
  size: "small",
  rank: 1,
  decorations: [],
  inhabitants: [],
  nextLayingAt: null,
};

const SECOND = 1000;

describe("breed", () => {
  const random = seeded(1);
  const mother: Genome = { primary: "white", secondary: "yellow", pattern: "puncta", detail: "none" };
  const father: Genome = { primary: "yellow", secondary: "white", pattern: "annula", detail: "none" };
  const children = Array.from({ length: 2000 }, () => breed(mother, father, emptyTerrarium, random));

  it("never gives the same primary and secondary color, except chameleon", () => {
    for (const child of children) {
      if (child.primary !== "chameleon") expect(child.secondary).not.toBe(child.primary);
    }
  });

  it("fuses patterns with a recipe most of the time", () => {
    const stars = children.filter((c) => c.pattern === "stella").length / children.length;
    expect(stars).toBeGreaterThan(0.55);
    expect(stars).toBeLessThan(0.75);
  });
});

describe("game", () => {
  it("starts with a common pair on the market and enough coins for it", () => {
    const state = newGame(0, seeded(2));
    const [female, male] = state.market.specimens;
    expect(female?.sex).toBe("female");
    expect(male?.sex).toBe("male");
    expect(STARTING_COINS).toBeGreaterThanOrEqual(terrariumPrice("small", 1) + (female?.price ?? 0) + (male?.price ?? 0));
  });

  it("delivers, lays a first egg quickly and raises it to adulthood", () => {
    const random = seeded(3);
    const state = newGame(0, random);
    expect(buyTerrarium(state)).toBeNull();
    const terrarium = state.terrariums[0]!;
    const [female, male] = state.market.specimens;
    expect(buySpecimen(state, female!.id, terrarium.id, 0)).toBeNull();
    expect(buySpecimen(state, male!.id, terrarium.id, 0)).toBeNull();

    advance(state, 30 * SECOND, random);
    expect(terrarium.inhabitants).toHaveLength(2);

    advance(state, 40 * SECOND, random);
    expect(terrarium.inhabitants.map((s) => s.stage)).toContain("egg");

    advance(state, (40 + 30 + 120) * SECOND, random);
    expect(terrarium.inhabitants.filter((s) => s.stage === "adult")).toHaveLength(3);
    expect(state.discovered.length).toBeGreaterThanOrEqual(2);
  });

  it("catches up offline time until the terrarium is full", () => {
    const random = seeded(4);
    const state = newGame(0, random);
    buyTerrarium(state);
    const terrarium = state.terrariums[0]!;
    const [female, male] = state.market.specimens;
    buySpecimen(state, female!.id, terrarium.id, 0);
    buySpecimen(state, male!.id, terrarium.id, 0);
    advance(state, 24 * 3600 * SECOND, random);
    expect(terrarium.inhabitants).toHaveLength(4);
    expect(terrarium.nextLayingAt).toBeNull();
  });
});
