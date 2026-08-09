import { describe, expect, it } from "vitest";

import { safeCompanyReturnPath, safeInternalReturnPath } from "./session";

describe("analytics return paths", () => {
  it("keeps navigation inside the authenticated company portal", () => {
    expect(safeCompanyReturnPath("/analytics/gainr/queries?period=7d", "gainr")).toBe(
      "/analytics/gainr/queries?period=7d",
    );
    expect(safeCompanyReturnPath("https://attacker.example", "gainr")).toBe("/analytics/gainr");
    expect(safeCompanyReturnPath("/analytics/other", "gainr")).toBe("/analytics/gainr");
  });

  it("keeps internal navigation inside the internal portal", () => {
    expect(safeInternalReturnPath("/internal/analytics/gainr?period=24h")).toBe(
      "/internal/analytics/gainr?period=24h",
    );
    expect(safeInternalReturnPath("//attacker.example/internal/analytics")).toBe(
      "/internal/analytics",
    );
  });
});
