type AnalyticsRole = "company_user" | "internal_admin";

export type AnalyticsAudience = "company" | "internal";

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

type QueryRecordBase = {
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
  ai_enrichment?: Record<string, unknown>;
};

export type CompanyQueryRecord = QueryRecordBase & {
  search: {
    status: string | null;
    result_count: number | null;
    total_results: number | null;
  };
};

type InternalQueryCache = {
  plan_hit: boolean | null;
  result_hit: boolean | null;
};

type InternalStageTimings = Record<string, number | null>;

type InternalQueryPerformance = {
  server_duration_ms: number | null;
  total_server_duration_ms: number | null;
  measurement_scope: string | null;
  timing_semantics: string | null;
  execution_path: string | null;
  cache: InternalQueryCache | null;
  stages_ms: InternalStageTimings | null;
  downstream_api_calls: number | null;
  attempt_count: number | null;
  successful_attempt_count: number | null;
  failed_attempt_count: number | null;
};

type InternalTokenUsage = {
  input_tokens: number | null;
  output_tokens: number | null;
  thought_tokens: number | null;
  total_tokens: number | null;
  tokens_per_result: number | null;
};

type InternalApiTelemetry = {
  status?: string | null;
  execution_path?: string | null;
  result_count?: number | null;
  total_results?: number | null;
  duration_ms?: number | null;
  api_call_count?: number | null;
  input_tokens?: number | null;
  output_tokens?: number | null;
  thought_tokens?: number | null;
  total_tokens?: number | null;
  tokens_per_result?: number | null;
  [key: string]: unknown;
};

export type InternalQueryAttempt = {
  attempt_number?: number | null;
  provider?: string | null;
  model?: string | null;
  operation?: string | null;
  status?: string | null;
  api_calls?: number | null;
  input_tokens?: number | null;
  output_tokens?: number | null;
  thought_tokens?: number | null;
  total_tokens?: number | null;
  duration_ms?: number | null;
  failure_reason?: string | null;
};

export type InternalQueryRecord = QueryRecordBase & {
  performance: InternalQueryPerformance | null;
  token_usage: InternalTokenUsage | null;
  api: InternalApiTelemetry | null;
  attempts: InternalQueryAttempt[];
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
