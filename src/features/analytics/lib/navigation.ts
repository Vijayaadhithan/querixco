import type {
  AnalyticsAudience,
  AnalyticsDashboard,
  DashboardFilterValue,
  QueryFilters,
  QueryOutcome,
} from "../model/types";
import { createDashboardFilters } from "./dashboard";

export const emptyQueryFilters: QueryFilters = {
  sortBy: "created_at",
  sortDirection: "desc",
  query: "",
  outcome: "",
  category: "",
  executionPath: "",
  language: "",
  includeFilteredResults: false,
  requestKind: "",
  cityId: "",
  subcategoryId: "",
  adType: "",
  diagnosticCode: "",
  hasFilters: false,
  from: "",
  to: "",
  exactFrom: "",
  exactTo: "",
};
const outcomes = ["", "fulfilled", "zero_result", "failure", "telemetry_missing"];
export function validDate(value: string) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value
  );
}
function exactDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value) &&
    validDate(value.slice(0, 10)) &&
    Number.isFinite(Date.parse(value))
    ? new Date(value).toISOString()
    : "";
}
function read<T extends object>(defaults: T, search: string): T {
  const params = new URLSearchParams(search);
  const value = { ...defaults };
  for (const key of Object.keys(defaults) as Array<keyof T>) {
    const item = params.get(`f.${String(key)}`);
    if (item !== null)
      value[key] = (
        typeof defaults[key] === "boolean"
          ? item === "true"
          : item.slice(0, key === "query" ? 1000 : 191)
      ) as T[keyof T];
  }
  return value;
}
function common<T extends DashboardFilterValue | QueryFilters>(
  value: T,
  audience: AnalyticsAudience,
): T {
  if (!outcomes.includes(value.outcome)) value.outcome = "";
  if (!validDate(value.from)) value.from = "";
  if (!validDate(value.to)) value.to = "";
  if (value.from && value.to && value.from > value.to) {
    value.from = "";
    value.to = "";
  }
  if (!/^\d+$/.test(value.cityId)) value.cityId = "";
  if (audience === "company") value.executionPath = "";
  return value;
}
export function dashboardFiltersFromSearch(search: string, audience: AnalyticsAudience) {
  const value = common(read(createDashboardFilters(), search), audience);
  if (!["24h", "7d", "30d", "90d", "all", "custom"].includes(value.period)) value.period = "30d";
  if (!["all", "text_search", "browse"].includes(value.requestScope)) value.requestScope = "all";
  if (value.from || value.to) value.period = "custom";
  else if (value.period === "custom") value.period = "30d";
  if (audience === "company") {
    value.provider = "";
    value.operation = "";
  }
  return value;
}
export function queryFiltersFromSearch(search: string, audience: AnalyticsAudience) {
  const value = common(read(emptyQueryFilters, search), audience);
  const sorts =
    audience === "company"
      ? ["created_at", "results", "outcome"]
      : ["created_at", "results", "outcome", "duration", "tokens", "execution_path"];
  if (!sorts.includes(value.sortBy)) value.sortBy = "created_at";
  if (!["asc", "desc"].includes(value.sortDirection)) value.sortDirection = "desc";
  if (!["", "text_search", "filtered_browse", "catalogue_browse"].includes(value.requestKind))
    value.requestKind = "";
  if (!/^\d+$/.test(value.subcategoryId)) value.subcategoryId = "";
  if (audience === "company") value.diagnosticCode = "";
  value.exactFrom = exactDate(value.exactFrom ?? "");
  value.exactTo = exactDate(value.exactTo ?? "");
  if (value.exactFrom && value.exactTo && value.exactFrom > value.exactTo) {
    value.exactFrom = "";
    value.exactTo = "";
  }
  if (value.from || value.to) {
    value.exactFrom = "";
    value.exactTo = "";
  }
  return value;
}
export function filterSearch(filters: object, search = "") {
  const params = new URLSearchParams(search);
  for (const key of [...params.keys()]) if (key.startsWith("f.")) params.delete(key);
  for (const [key, value] of Object.entries(filters))
    if (value !== "" && value !== false && value != null) params.set(`f.${key}`, String(value));
  return params.toString();
}
function dashboardPath(company: string, audience: AnalyticsAudience) {
  return `${audience === "internal" ? "/internal" : ""}/analytics/${encodeURIComponent(company)}`;
}
export function safeDashboardReturn(search: string, company: string, audience: AnalyticsAudience) {
  const base = dashboardPath(company, audience);
  const candidate = new URLSearchParams(search).get("back");
  if (!candidate) return base;
  try {
    const url = new URL(candidate, "https://querix.co");
    if (url.origin !== "https://querix.co" || url.pathname !== base) return base;
    const params = new URLSearchParams(
      filterSearch(dashboardFiltersFromSearch(url.search, audience)),
    );
    const view = url.searchParams.get("view");
    if (
      view &&
      ["overview", "activity", audience === "company" ? "catalog" : "performance"].includes(view)
    )
      params.set("view", view);
    return `${base}?${params}`;
  } catch {
    return base;
  }
}
export function queryDrilldown(
  dashboard: AnalyticsDashboard,
  company: string,
  audience: AnalyticsAudience,
  back: string,
  outcome?: QueryOutcome,
  options: { sortBy?: QueryFilters["sortBy"]; textSearchMetric?: boolean } = {},
): { href?: string; reason?: string } {
  const applied = dashboard.filtering.applied;
  if (outcome && applied.outcome && outcome !== applied.outcome)
    return { reason: "This outcome is outside the current selection." };
  if (applied.request_scope === "browse")
    return {
      reason:
        "Browse combines request types. Select All activity or Text searches to open matching history.",
    };
  if (applied.provider || applied.operation)
    return {
      reason:
        "Query history cannot preserve provider or operation filters. Clear them to open matching history.",
    };
  if (
    (applied.from && !exactDate(applied.from)) ||
    (applied.to && !exactDate(applied.to)) ||
    (applied.period !== "all" && !(applied.period === "custom" && applied.to) && !applied.from)
  )
    return { reason: "An exact reporting range is unavailable for this selection." };
  const filters: QueryFilters = {
    ...emptyQueryFilters,
    sortBy: options.sortBy ?? "created_at",
    includeFilteredResults: !options.textSearchMetric && applied.request_scope === "all",
    requestKind:
      options.textSearchMetric || applied.request_scope === "text_search" ? "text_search" : "",
    outcome: outcome ?? applied.outcome ?? "",
    category: applied.category ?? "",
    language: applied.language ?? "",
    cityId: applied.city_id == null ? "" : String(applied.city_id),
    adType: applied.ad_type ?? "",
    executionPath: audience === "internal" ? (applied.execution_path ?? "") : "",
    exactFrom: applied.from ? exactDate(applied.from) : "",
    exactTo: applied.to ? exactDate(applied.to) : "",
  };
  const params = new URLSearchParams(filterSearch(filters));
  params.set("back", back);
  return { href: `${dashboardPath(company, audience)}/queries?${params}` };
}

export function queryDateRange(value: QueryFilters, days: number | null): QueryFilters {
  const end = new Date();
  const start = new Date(end);
  if (days) start.setDate(start.getDate() - (days - 1));
  return {
    ...value,
    from: days ? dateInputValue(start) : "",
    to: days ? dateInputValue(end) : "",
    exactFrom: "",
    exactTo: "",
  };
}
function dateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
