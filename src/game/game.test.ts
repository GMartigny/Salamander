import { describe, expect, it } from "vitest";
import { terrariumPrice } from "../data/balance";
import { advance, buyDecoration, buySpecimen, buyTerrarium, moveSalamander, newGame, sellDecoration, STARTING_COINS, upgradeDecoration } from "./game";
import { breed } from "./genetics";
import type { Random } from "./random";
import type { Genome, Salamander } from "./salamander";
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
};

const SECOND = 1000;

describe("breed", () => {
  const random = seeded(1);
  const mother: Genome = { primary: "white", secondary: "yellow", pattern: "puncta", detail: "none" };
  const father: Genome = { primary: "yellow", secondary: "white", pattern: "annula", detail: "none" };
  const children = Array.from({ length: 2000 }, () => breed(mother, father, emptyTerrarium, random).genome);

  it("never gives the same primary and secondary color, except chameleon", () => {
    for (const child of children) {
      if (child.primary !== "chameleon") expect(child.secondary).not.toBe(child.primary);
    }
  });

  it("always fuses patterns with a recipe", () => {
    expect(children.every((c) => c.pattern === "stella")).toBe(true);
  });

  it("reports parent patterns that have no recipe", () => {
    const plain: Genome = { primary: "white", secondary: "yellow", pattern: "folia", detail: "none" };
    const report = breed(plain, { ...plain, pattern: "crania" }, emptyTerrarium, seeded(9));
    expect(report.fusion).toBeNull();
    expect(report.noFusion).toEqual(["folia", "crania"]);
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

  it("never offers the exact same specimen or decoration twice", () => {
    const random = seeded(8);
    for (let i = 0; i < 300; i++) {
      const { market } = newGame(0, random);
      const specimens = market.specimens.map((o) => JSON.stringify([o.genome, o.sex]));
      const decorations = market.decorations.map((o) => `${o.theme}:${o.type}`);
      expect(new Set(specimens).size).toBe(specimens.length);
      expect(new Set(decorations).size).toBe(decorations.length);
    }
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

    // Delivery at 30 s, first mating 10 s later, then 30 s of gestation.
    advance(state, 75 * SECOND, random);
    expect(terrarium.inhabitants.map((s) => s.stage)).toContain("egg");

    advance(state, (70 + 30 + 120) * SECOND, random);
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
    expect(terrarium.inhabitants).toHaveLength(6);
  });

  it("lets one male fertilize several females", () => {
    const random = seeded(5);
    const state = newGame(0, random);
    buyTerrarium(state);
    const terrarium = state.terrariums[0]!;
    const adult = (sex: "female" | "male"): Salamander => ({
      id: sex + Math.random(),
      genome: { primary: "white", secondary: "yellow", pattern: "recta", detail: "none" },
      sex,
      stage: "adult",
      stageSince: 0,
    });
    const females = [adult("female"), adult("female")];
    terrarium.inhabitants.push(...females, adult("male"));
    advance(state, 6 * 60 * SECOND, random);
    expect(females.every((f) => f.restUntil !== undefined || f.pregnancy)).toBe(true);
    expect(terrarium.inhabitants.some((s) => s.stage !== "adult")).toBe(true);
  });

  it("keeps a pregnancy when the female moves, and waits for room to lay", () => {
    const random = seeded(6);
    const state = newGame(0, random);
    state.coins = 10_000;
    buyTerrarium(state);
    buyTerrarium(state);
    const [first, second] = state.terrariums as [Terrarium, Terrarium];
    const filler = (i: number): Salamander => ({
      id: "f" + i,
      genome: { primary: "black", secondary: "white", pattern: "riga", detail: "none" },
      sex: "male",
      stage: "adult",
      stageSince: 0,
    });
    second.inhabitants.push(...[0, 1, 2, 3, 4].map(filler));
    const mother: Salamander = {
      id: "m",
      genome: { primary: "white", secondary: "yellow", pattern: "recta", detail: "none" },
      sex: "female",
      stage: "adult",
      stageSince: 0,
      pregnancy: { father: filler(9).genome, since: 0 },
    };
    first.inhabitants.push(mother);
    expect(moveSalamander(state, "m", second.id, 0, random)).toBeNull();
    expect(second.inhabitants).toHaveLength(6);
    advance(state, 60 * SECOND, random);
    expect(mother.pregnancy).not.toBeNull();
    second.inhabitants.splice(0, 1);
    advance(state, 61 * SECOND, random);
    expect(mother.pregnancy).toBeNull();
    expect(second.inhabitants.some((s) => s.stage === "egg")).toBe(true);
  });

  it("sells a decoration for half of everything spent on it", () => {
    const state = newGame(0, seeded(7));
    state.coins = 1_000;
    buyTerrarium(state);
    const terrarium = state.terrariums[0]!;
    const offer = state.market.decorations[0]!;
    buyDecoration(state, offer.id, terrarium.id);
    upgradeDecoration(state, terrarium.id, offer.type);
    const before = state.coins;
    expect(sellDecoration(state, terrarium.id, offer.type)).toBeNull();
    expect(state.coins - before).toBe(100);
    expect(terrarium.decorations).toHaveLength(0);
  });
});
