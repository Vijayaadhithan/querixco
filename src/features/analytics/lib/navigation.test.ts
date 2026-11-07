import { describe, expect, it } from "vitest";
import type { AnalyticsDashboard } from "../model/types";
import { createDashboardFilters } from "./dashboard";
import {
  dashboardFiltersFromSearch,
  emptyQueryFilters,
  filterSearch,
  queryDrilldown,
  queryFiltersFromSearch,
  safeDashboardReturn,
} from "./navigation";

function report(applied: Partial<AnalyticsDashboard["filtering"]["applied"]> = {}) {
  // Navigation uses only the applied selection from the report.
  return {
    filtering: {
      applied: {
        period: "7d",
        request_scope: "text_search",
        from: "2026-11-01T12:34:56+05:30",
        to: "2026-11-07T12:34:56+05:30",
        timezone: "Asia/Kolkata",
        outcome: null,
        category: "Clothing",
        language: "Tamil",
        city: "Chennai",
        city_id: 81,
        ad_type: "offer",
        ...applied,
      },
    },
  } as AnalyticsDashboard;
}
describe("analytics selection navigation", () => {
  it("restores dashboard selections without losing their section", () => {
    const selected = {
      ...createDashboardFilters(),
      period: "7d" as const,
      cityId: "81",
      category: "Bikes & cars",
    };
    const search = filterSearch(selected, "?view=activity&f.unknown=removed");
    expect(new URLSearchParams(search).get("view")).toBe("activity");
    expect(new URLSearchParams(search).has("f.unknown")).toBe(false);
    expect(dashboardFiltersFromSearch(search, "company")).toEqual(selected);
  });
  it("rejects invalid URL values and strips internal controls from client selections", () => {
    const search =
      "f.period=never&f.requestScope=bad&f.outcome=bad&f.cityId=81x&f.from=2026-02-31&f.provider=p&f.operation=o&f.executionPath=semantic";
    expect(dashboardFiltersFromSearch(search, "company")).toEqual(createDashboardFilters());
    expect(
      queryFiltersFromSearch(
        "f.sortBy=tokens&f.sortDirection=bad&f.hasFilters=false&f.diagnosticCode=secret&f.executionPath=semantic",
        "company",
      ),
    ).toEqual(emptyQueryFilters);
    expect(queryFiltersFromSearch("f.sortBy=tokens&f.hasFilters=true", "internal")).toMatchObject({
      sortBy: "tokens",
      hasFilters: true,
    });
    expect(queryFiltersFromSearch("f.from=2026-11-07&f.to=2026-11-01", "internal")).toMatchObject({
      from: "",
      to: "",
    });
  });
  it("preserves precise report timestamps and supported dimensions in metric links", () => {
    const back = "/analytics/sample?view=activity&f.period=7d";
    const result = queryDrilldown(report(), "sample", "company", back, "zero_result");
    const url = new URL(result.href!, "https://querix.co");
    expect(url.pathname).toBe("/analytics/sample/queries");
    expect(queryFiltersFromSearch(url.search, "company")).toMatchObject({
      outcome: "zero_result",
      requestKind: "text_search",
      includeFilteredResults: false,
      category: "Clothing",
      language: "Tamil",
      cityId: "81",
      adType: "offer",
      exactFrom: "2026-11-01T07:04:56.000Z",
      exactTo: "2026-11-07T07:04:56.000Z",
      from: "",
      to: "",
    });
    const restored = new URL(
      safeDashboardReturn(url.search, "sample", "company"),
      "https://querix.co",
    );
    expect(restored.searchParams.get("view")).toBe("activity");
    expect(dashboardFiltersFromSearch(restored.search, "company").period).toBe("7d");
  });
  it("keeps all activity and internal execution path when opening request history", () => {
    const link = queryDrilldown(
      report({ request_scope: "all", execution_path: "semantic" }),
      "sample",
      "internal",
      "/internal/analytics/sample",
    );
    expect(
      queryFiltersFromSearch(new URL(link.href!, "https://querix.co").search, "internal"),
    ).toMatchObject({ includeFilteredResults: true, requestKind: "", executionPath: "semantic" });
  });
  it.each([
    { request_scope: "browse" as const },
    { provider: "provider" },
    { operation: "search" },
    { from: null },
    { from: "2026-02-31T00:00:00Z" },
  ])("explains why history cannot represent a selection: %j", (applied) => {
    const result = queryDrilldown(
      report(applied),
      "sample",
      "internal",
      "/internal/analytics/sample",
    );
    expect(result.href).toBeUndefined();
    expect(result.reason).toBeTruthy();
  });
  it("does not widen a selected outcome when drilling into a different metric", () => {
    expect(
      queryDrilldown(
        report({ outcome: "failure" }),
        "sample",
        "internal",
        "/internal/analytics/sample",
        "zero_result",
      ).href,
    ).toBeUndefined();
  });
  it("keeps calendar date selection independent of a prior exact range", () => {
    const search = filterSearch({
      ...emptyQueryFilters,
      from: "2026-11-05",
      exactFrom: "2026-11-01T00:00:00Z",
      exactTo: "2026-11-07T00:00:00Z",
    });
    expect(queryFiltersFromSearch(search, "company")).toMatchObject({
      from: "2026-11-05",
      exactFrom: "",
      exactTo: "",
    });
  });
  it.each([
    "https://evil.example/analytics/sample",
    "//evil.example/analytics/sample",
    "/analytics/another",
    "/internal/analytics/sample",
    "javascript:alert(1)",
  ])("rejects unsafe or cross-workspace return path %s", (back) => {
    expect(safeDashboardReturn(new URLSearchParams({ back }).toString(), "sample", "company")).toBe(
      "/analytics/sample",
    );
  });
});
