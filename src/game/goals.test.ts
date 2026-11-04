import { describe, expect, it } from "vitest";
import { COLLECTIONS } from "../data/collections";
import { newGame } from "./game";
import { claimCollection, collectionReward, deliverOrder, matches, refreshOrders } from "./goals";
import { parseSpeciesName, type Salamander, speciesName } from "./salamander";

const adult = (name: string): Salamander => ({
  id: name,
  genome: parseSpeciesName(name)!,
  sex: "male",
  stage: "adult",
  stageSince: 0,
});

describe("collections", () => {
  it("only list valid species, each in a single collection", () => {
    const all = COLLECTIONS.flatMap((c) => c.members);
    for (const name of all) {
      const genome = parseSpeciesName(name);
      expect(genome, name).not.toBeNull();
      expect(speciesName(genome!)).toBe(name);
    }
    expect(new Set(all).size).toBe(all.length);
  });

  it("pay their reward once, when every member is discovered", () => {
    const state = newGame(0);
    const yinYang = COLLECTIONS.find((c) => c.id === "yin-yang")!;
    const coins = state.coins;
    expect(claimCollection(state, "yin-yang")).not.toBeNull();
    state.discovered.push(...yinYang.members);
    expect(claimCollection(state, "yin-yang")).toBeNull();
    expect(state.coins - coins).toBe(collectionReward(yinYang));
    expect(claimCollection(state, "yin-yang")).not.toBeNull();
  });
});

describe("orders", () => {
  it("keeps two orders open and replaces expired ones", () => {
    const state = newGame(0);
    expect(state.orders).toHaveLength(2);
    const first = state.orders[0]!.id;
    refreshOrders(state, 31 * 60 * 1000, Math.random);
    expect(state.orders).toHaveLength(2);
    expect(state.orders.map((o) => o.id)).not.toContain(first);
  });

  it("delivers matching adults for the reward", () => {
    const state = newGame(0);
    state.terrariums.push({ id: "t", size: "small", rank: 1, decorations: [], inhabitants: [adult("Rubeus Albopunctata")] });
    state.orders = [{ id: "o", requirements: [{ primary: "red", pattern: "puncta" }], reward: 120, expiresAt: 1000 }];
    expect(matches(adult("Rubeus Albopunctata"), { secondary: "white" })).toBe(true);
    const coins = state.coins;
    expect(deliverOrder(state, "o", 0)).toBeNull();
    expect(state.coins - coins).toBe(120);
    expect(state.terrariums[0]!.inhabitants).toHaveLength(0);
    expect(state.orders).toHaveLength(2);
  });
});
