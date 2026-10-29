import { describe, expect, it } from "vitest";
import { COLOR_IDS, COLORS } from "../data/colors";
import { DETAIL_IDS } from "../data/details";
import { PATTERN_IDS, PATTERNS } from "../data/patterns";
import { speciesName } from "./salamander";

describe("species name", () => {
  it("chains primary color, secondary color + pattern and detail", () => {
    expect(speciesName({ primary: "white", secondary: "red", pattern: "puncta", detail: "cornum" })).toBe(
      "Albus rubropunctata cornum",
    );
  });

  it("leaves out the detail when there is none", () => {
    expect(speciesName({ primary: "black", secondary: "yellow", pattern: "riga", detail: "none" })).toBe(
      "Ebenus flavostrigata",
    );
  });

  it("leaves out the hidden secondary color without a pattern", () => {
    expect(speciesName({ primary: "gold", secondary: "white", pattern: "iustus", detail: "lucidum" })).toBe(
      "Aureus nudata lucidum",
    );
  });

  it("gives each group its own ending", () => {
    for (const id of COLOR_IDS) {
      expect(COLORS[id].latin).toMatch(/us$/);
      expect(COLORS[id].prefix).toMatch(/o$/);
    }
    for (const id of PATTERN_IDS) expect(PATTERNS[id].latin).toMatch(/ata$/);
    for (const id of DETAIL_IDS.filter((d) => d !== "none")) expect(id).toMatch(/um$/);
  });
});
