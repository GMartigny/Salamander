import { describe, expect, it } from "vitest";
import { terrariumPrice } from "./balance";

describe("terrarium prices", () => {
  it("match the price scale spreadsheet", () => {
    expect(terrariumPrice("small", 1)).toBe(100);
    expect(terrariumPrice("small", 4)).toBeCloseTo(337.5);
    expect(terrariumPrice("medium", 2)).toBe(1_500);
    expect(terrariumPrice("large", 10)).toBeCloseTo(384_433.59, 2);
  });
});
