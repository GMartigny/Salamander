import { describe, expect, it } from "vitest";
import { FUSION_RECIPES, fusionResult, PATTERN_IDS } from "./patterns";

describe("pattern fusion", () => {
  it("never lists the same pair twice", () => {
    const pairs = FUSION_RECIPES.map(({ parents }) => [...parents].sort().join("+"));
    expect(new Set(pairs).size).toBe(pairs.length);
  });

  it("never repeats a result among recipes sharing a parent", () => {
    for (const pattern of PATTERN_IDS) {
      const results = FUSION_RECIPES.filter(({ parents }) => parents.includes(pattern)).map((r) => r.result);
      expect(new Set(results).size, pattern).toBe(results.length);
    }
  });

  it("leaves crania as the only end of chain", () => {
    const parents = new Set(FUSION_RECIPES.flatMap((recipe) => recipe.parents));
    const deadEnds = PATTERN_IDS.filter((id) => id !== "iustus" && !parents.has(id));
    expect(deadEnds).toEqual(["crania"]);
  });

  it("keeps same-pattern pairs rare", () => {
    const same = FUSION_RECIPES.filter(({ parents: [a, b] }) => a === b);
    expect(same.length).toBeLessThanOrEqual(2);
  });

  it("ignores parent order", () => {
    expect(fusionResult("annula", "puncta")).toBe("stella");
    expect(fusionResult("puncta", "annula")).toBe("stella");
    expect(fusionResult("crania", "crania")).toBeUndefined();
  });
});
