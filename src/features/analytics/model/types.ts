type AnalyticsRole = "company_user" | "internal_admin";

type AnalyticsPrincipal = {
  username: string;
  role: AnalyticsRole;
  company_id: string | null;
};

export type AnalyticsSession = {
  user: AnalyticsPrincipal;
  expires_at: string;
};

export type AnalyticsModule =
  | "search_intelligence"
  | "individual_queries"
  | "deep_analytics"
  | "market_intelligence"
  | "api_performance";

type MetricChartType =
  | "bar"
  | "comparison_table"
  | "doughnut"
  | "grouped_bar"
  | "line"
  | "list"
  | "stacked_bar"
  | "stat"
  | "stats_card"
  | "table"
  | "tables";

export type MetricPayload = {
  title?: string;
  chart_type?: MetricChartType | string;
  [key: string]: unknown;
};

export type MetricModulePayload = Record<string, MetricPayload>;

export type SnapshotSummary = {
  generated_at: string;
  source_watermark: string | null;
  source_rows: Record<string, number>;
  refresh_schedule: string;
};

export type AnalyticsDashboard = {
  metadata: {
    schema_version: string;
    company_id: string;
    generated_at: string;
    refresh_schedule: string;
    source_rows: Record<string, number>;
    audience: "company" | "internal";
    modules: AnalyticsModule[];
    metric_counts: Record<string, number>;
    individual_query_count: number;
  };
  search_intelligence?: MetricModulePayload;
  deep_analytics?: MetricModulePayload;
  market_intelligence?: MetricModulePayload;
  api_performance?: MetricModulePayload;
  snapshot: SnapshotSummary;
};

type CompanyInventoryItem = {
  company_id: string;
  endpoint_slug: string;
  has_snapshot: boolean;
  snapshot: SnapshotSummary | null;
  latest_run: Record<string, unknown> | null;
  refresh_schedule: string;
};

export type CompanyInventory = {
  companies: CompanyInventoryItem[];
  refresh_schedule: string;
};

export type CompanyQueryRecord = {
  search_id: number | string | null;
  request_id: string;
  query: string;
  normalized_query: string;
  created_at: string;
  word_count: number;
  categories: string[];
  brands: string[];
  locations: string[];
  language: string | null;
  rental_duration: string | null;
  flags: Record<string, boolean | string | number | null>;
  outcome: "fulfilled" | "zero_result" | "failure" | "telemetry_missing";
  search: {
    status: string | null;
    result_count: number | null;
    total_results: number | null;
  };
  ai_enrichment?: Record<string, unknown>;
};

export type InternalQueryRecord = CompanyQueryRecord & {
  api: Record<string, unknown>;
  attempts: Array<Record<string, unknown>>;
};

export type QueryPage<T> = {
  company_id: string;
  items: T[];
  returned: number;
  has_more: boolean;
  next_cursor: string | null;
};

export type QueryOutcome = CompanyQueryRecord["outcome"];

export type QueryFilters = {
  query: string;
  outcome: QueryOutcome | "";
  category: string;
  language: string;
  from: string;
  to: string;
};
