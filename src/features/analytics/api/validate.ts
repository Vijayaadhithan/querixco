import type {
  AnalyticsDashboard,
  AnalyticsSession,
  CompanyInventory,
  CompanyQueryRecord,
  InternalQueryRecord,
  QueryPage,
} from "../model/types";

export type ResponseDecoder<T> = (value: unknown) => T;

export function decodeAnalyticsSession(value: unknown): AnalyticsSession {
  const root = record(value, "session");
  const user = record(root.user, "session user");
  string(user.username, "session username");
  oneOf(user.role, ["company_user", "internal_admin"], "session role");
  nullableString(user.company_id, "session company");
  string(root.expires_at, "session expiration");
  return value as AnalyticsSession;
}

export function decodeDashboard(value: unknown): AnalyticsDashboard {
  const root = record(value, "dashboard");
  const metadata = record(root.metadata, "dashboard metadata");
  string(metadata.schema_version, "dashboard schema version");
  string(metadata.company_id, "dashboard company");
  oneOf(metadata.audience, ["company", "internal"], "dashboard audience");
  const modules = array(metadata.modules, "dashboard modules");
  modules.forEach((module) =>
    oneOf(
      module,
      [
        "search_intelligence",
        "individual_queries",
        "deep_analytics",
        "market_intelligence",
        "api_performance",
      ],
      "dashboard module",
    ),
  );
  finiteNumber(metadata.individual_query_count, "dashboard query count");

  const snapshot = record(root.snapshot, "dashboard snapshot");
  string(snapshot.generated_at, "snapshot generated time");
  nullableString(snapshot.source_watermark, "snapshot watermark");
  string(snapshot.refresh_schedule, "snapshot refresh schedule");

  const filtering = record(root.filtering, "dashboard filtering");
  record(filtering.applied, "applied dashboard filters");
  const available = record(filtering.available, "available dashboard filters");
  for (const key of ["periods", "outcomes", "categories", "languages", "cities", "ad_types"]) {
    stringArray(available[key], `available ${key}`);
  }
  const cityOptions = array(available.city_options, "available cities");
  cityOptions.forEach((option, index) => {
    const city = record(option, `city option ${index + 1}`);
    finiteNumber(city.id, "city id");
    string(city.label, "city label");
  });
  finiteNumber(filtering.matched_records, "matched records");
  finiteNumber(filtering.total_records, "total records");

  const overview = record(root.filtered_overview, "filtered overview");
  record(overview.summary, "overview summary");
  record(overview.breakdowns, "overview breakdowns");
  decodeGraph(overview.main_graph);
  if (metadata.audience === "internal") {
    record(overview.token_usage_by_operation, "operation token usage");
    record(overview.stage_latency, "stage latency");
  }
  return value as AnalyticsDashboard;
}

export function decodeCompanyInventory(value: unknown): CompanyInventory {
  const root = record(value, "company inventory");
  const companies = array(root.companies, "companies");
  companies.forEach((item, index) => {
    const company = record(item, `company ${index + 1}`);
    string(company.company_id, "company id");
    string(company.endpoint_slug, "company endpoint");
    boolean(company.has_snapshot, "company snapshot state");
  });
  string(root.refresh_schedule, "inventory refresh schedule");
  return value as CompanyInventory;
}

export function decodeCompanyQueryPage(value: unknown): QueryPage<CompanyQueryRecord> {
  return decodeQueryPage(value) as QueryPage<CompanyQueryRecord>;
}

export function decodeInternalQueryPage(value: unknown): QueryPage<InternalQueryRecord> {
  return decodeQueryPage(value) as QueryPage<InternalQueryRecord>;
}

export function decodeRecord(value: unknown): Record<string, unknown> {
  return record(value, "API response");
}

export function decodeLogout(value: unknown): { logged_out: boolean } {
  const root = record(value, "logout response");
  boolean(root.logged_out, "logout state");
  return value as { logged_out: boolean };
}

function decodeQueryPage(value: unknown): QueryPage<Record<string, unknown>> {
  const root = record(value, "query page");
  string(root.company_id, "query page company");
  finiteNumber(root.returned, "returned query count");
  boolean(root.has_more, "query pagination state");
  nullableString(root.next_cursor, "next query cursor");
  const items = array(root.items, "query items");
  items.forEach((item, index) => {
    const query = record(item, `query item ${index + 1}`);
    string(query.request_id, "query request id");
    string(query.query, "query text");
    string(query.created_at, "query creation time");
    oneOf(
      query.outcome,
      ["fulfilled", "zero_result", "failure", "telemetry_missing"],
      "query outcome",
    );
  });
  return value as QueryPage<Record<string, unknown>>;
}

function decodeGraph(value: unknown): void {
  const graph = record(value, "dashboard graph");
  string(graph.title, "graph title");
  oneOf(graph.chart_type, ["line"], "graph chart type");
  oneOf(graph.granularity, ["hour", "day", "week"], "graph granularity");
  string(graph.timezone, "graph timezone");
  stringArray(graph.labels, "graph labels");
  numberArray(graph.values, "graph values");
  const series = array(graph.series, "graph series");
  series.forEach((item, index) => {
    const row = record(item, `graph series ${index + 1}`);
    string(row.name, "graph series name");
    numberArray(row.values, "graph series values");
  });
}

function record(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw invalidResponse(label);
  }
  return value as Record<string, unknown>;
}

function array(value: unknown, label: string): unknown[] {
  if (!Array.isArray(value)) throw invalidResponse(label);
  return value;
}

function string(value: unknown, label: string): asserts value is string {
  if (typeof value !== "string") throw invalidResponse(label);
}

function nullableString(value: unknown, label: string): void {
  if (value !== null && typeof value !== "string") throw invalidResponse(label);
}

function boolean(value: unknown, label: string): void {
  if (typeof value !== "boolean") throw invalidResponse(label);
}

function finiteNumber(value: unknown, label: string): void {
  if (typeof value !== "number" || !Number.isFinite(value)) throw invalidResponse(label);
}

function stringArray(value: unknown, label: string): void {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw invalidResponse(label);
  }
}

function numberArray(value: unknown, label: string): void {
  if (
    !Array.isArray(value) ||
    value.some((item) => typeof item !== "number" || !Number.isFinite(item))
  ) {
    throw invalidResponse(label);
  }
}

function oneOf<const Value extends string>(
  value: unknown,
  options: readonly Value[],
  label: string,
): asserts value is Value {
  if (typeof value !== "string" || !options.includes(value as Value)) {
    throw invalidResponse(label);
  }
}

function invalidResponse(label: string): Error {
  return new Error(`The analytics service returned an invalid ${label}.`);
}
