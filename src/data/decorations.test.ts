import { describe, expect, it } from "vitest";
import { DECORATION_THEMES, THEME_DETAILS } from "./decorations";
import { DETAIL_IDS } from "./details";

describe("decoration themes", () => {
  it("favor every detail except none, each exactly once", () => {
    const favored = DECORATION_THEMES.map((theme) => THEME_DETAILS[theme]).sort();
    const expected = DETAIL_IDS.filter((id) => id !== "none").sort();
    expect(favored).toEqual(expected);
  });
});
