import { describe, expect, it } from "vitest";
import { FUSION_RECIPES, fusionResult, PATTERN_IDS } from "./patterns";

describe("pattern fusion", () => {
  it("never gives the same result for two recipes", () => {
    const results = FUSION_RECIPES.map((recipe) => recipe.result);
    expect(new Set(results).size).toBe(results.length);
  });

  it("never lists the same pair twice", () => {
    const pairs = FUSION_RECIPES.map(({ parents }) => [...parents].sort().join("+"));
    expect(new Set(pairs).size).toBe(pairs.length);
  });

  it("makes every pattern except recta and iustus reachable from recta", () => {
    const known = new Set(["recta"]);
    let grew = true;
    while (grew) {
      grew = false;
      for (const { parents, result } of FUSION_RECIPES) {
        if (parents.every((p) => known.has(p)) && !known.has(result)) {
          known.add(result);
          grew = true;
        }
      }
    }
    const expected = PATTERN_IDS.filter((id) => id !== "iustus");
    expect([...known].sort()).toEqual([...expected].sort());
  });

  it("ignores parent order", () => {
    expect(fusionResult("annula", "puncta")).toBe("stella");
    expect(fusionResult("puncta", "annula")).toBe("stella");
    expect(fusionResult("crania", "crania")).toBeUndefined();
  });
});
