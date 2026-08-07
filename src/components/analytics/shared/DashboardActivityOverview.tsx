import { Activity, CheckCircle2, ChevronDown, Clock3, SearchX, Zap } from "lucide-react";

import { DashboardModule } from "./DashboardModule";
import { formatMetricValue, humanizeKey } from "@/features/analytics/lib/format";
import type {
  AnalyticsAudience,
  AnalyticsDashboard,
  CompanyDashboardOverview,
  DashboardMainGraph,
  InternalDashboardOverview,
} from "@/features/analytics/model/types";

const graphColors = ["#60a5fa", "#a78bfa", "#34d399", "#fb7185"];

export function DashboardActivityOverview({
  dashboard,
  audience,
}: {
  dashboard: AnalyticsDashboard;
  audience: AnalyticsAudience;
}) {
  const { filtering } = dashboard;
  const internal = audience === "internal";

  return (
    <section className="mt-6 space-y-5" aria-labelledby="filtered-activity-heading">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">
            Filtered activity
          </p>
          <h2 id="filtered-activity-heading" className="mt-2 text-2xl font-semibold text-white">
            Search activity overview
          </h2>
        </div>
        <p className="text-sm text-slate-400">
          <span className="font-semibold text-slate-200">
            {filtering.matched_records.toLocaleString()}
          </span>{" "}
          of {filtering.total_records.toLocaleString()} records
        </p>
      </div>

      {internal ? (
        <InternalSummary overview={dashboard.filtered_overview as InternalDashboardOverview} />
      ) : (
        <CompanySummary overview={dashboard.filtered_overview as CompanyDashboardOverview} />
      )}

      <ActivityGraph graph={dashboard.filtered_overview.main_graph} />

      {internal && (
        <TokenUsage overview={dashboard.filtered_overview as InternalDashboardOverview} />
      )}

      <details className="group rounded-2xl border border-white/8 bg-white/[0.025]">
        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/[0.035] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300 sm:px-5 [&::-webkit-details-marker]:hidden">
          <span>
            Detailed breakdowns
            <span className="ml-2 text-xs font-normal text-slate-500">
              Categories, languages, outcomes{internal ? ", and stage latency" : ""}
            </span>
          </span>
          <ChevronDown
            className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180"
            aria-hidden="true"
          />
        </summary>
        <div className="border-t border-white/8 p-4 sm:p-5">
          <DashboardModule
            title="Activity breakdowns"
            eyebrow="Current filters"
            metrics={{
              ...dashboard.filtered_overview.breakdowns,
              ...(internal
                ? {
                    stage_latency: (dashboard.filtered_overview as InternalDashboardOverview)
                      .stage_latency,
                  }
                : {}),
            }}
          />
        </div>
      </details>
    </section>
  );
}

function CompanySummary({ overview }: { overview: CompanyDashboardOverview }) {
  const summary = overview.summary;
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      <SummaryCard label="Searches" value={summary.searches} icon={Activity} />
      <SummaryCard label="Fulfilled" value={summary.fulfilled} icon={CheckCircle2} />
      <SummaryCard
        label="Fulfillment rate"
        value={summary.fulfillment_rate}
        valueKey="rate"
        icon={Zap}
      />
      <SummaryCard label="Zero results" value={summary.zero_results} icon={SearchX} />
      <SummaryCard
        label="Average returned"
        value={summary.average_returned_results}
        icon={Activity}
      />
    </div>
  );
}

function InternalSummary({ overview }: { overview: InternalDashboardOverview }) {
  const summary = overview.summary;
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      <SummaryCard label="Requests" value={summary.requests} icon={Activity} />
      <SummaryCard
        label="Success rate"
        value={summary.success_rate}
        valueKey="rate"
        icon={CheckCircle2}
      />
      <SummaryCard
        label="P50 latency"
        value={summary.p50_latency_ms}
        valueKey="latency_ms"
        icon={Clock3}
      />
      <SummaryCard
        label="P95 latency"
        value={summary.p95_latency_ms}
        valueKey="latency_ms"
        icon={Clock3}
      />
      <SummaryCard label="API calls" value={summary.downstream_api_calls} icon={Zap} />
    </div>
  );
}

function SummaryCard({
  label,
  value,
  valueKey = "value",
  icon: Icon,
}: {
  label: string;
  value: number | null;
  valueKey?: string;
  icon: typeof Activity;
}) {
  return (
    <article className="rounded-2xl border border-white/8 bg-white/[0.035] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
        <Icon className="h-4 w-4 text-blue-300" aria-hidden="true" />
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-white">
        {formatMetricValue(value, valueKey)}
      </p>
    </article>
  );
}

function ActivityGraph({ graph }: { graph: DashboardMainGraph }) {
  const series = graph.series.filter((item) => item.values.length > 0).slice(0, 4);
  const allValues = series.flatMap((item) => item.values).filter(Number.isFinite);
  const max = Math.max(...allValues, 1);
  const width = 900;
  const height = 260;
  const padding = { top: 20, right: 20, bottom: 40, left: 46 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const labelIndexes = graph.labels.length
    ? Array.from(
        new Set(
          [0, 0.25, 0.5, 0.75, 1].map((ratio) => Math.round((graph.labels.length - 1) * ratio)),
        ),
      )
    : [];

  function point(value: number, index: number, count: number): string {
    const x = padding.left + (count <= 1 ? plotWidth / 2 : (index / (count - 1)) * plotWidth);
    const y = padding.top + plotHeight - (Math.max(0, value) / max) * plotHeight;
    return `${x},${y}`;
  }

  return (
    <article className="rounded-2xl border border-white/8 bg-white/[0.035] p-4 sm:p-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h3 className="font-semibold text-white">{graph.title}</h3>
          <p className="mt-1 text-xs text-slate-500">
            {humanizeKey(graph.granularity)} intervals · {graph.timezone}
          </p>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {series.map((item, index) => (
            <span
              key={item.name}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400"
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: graphColors[index] }}
                aria-hidden="true"
              />
              {humanizeKey(item.name)}
            </span>
          ))}
        </div>
      </div>

      {graph.labels.length && series.length ? (
        <div className="mt-5 overflow-x-auto">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="min-w-[680px]"
            role="img"
            aria-label={`${graph.title} line chart`}
          >
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = padding.top + plotHeight * ratio;
              const value = Math.round(max * (1 - ratio));
              return (
                <g key={ratio}>
                  <line
                    x1={padding.left}
                    x2={width - padding.right}
                    y1={y}
                    y2={y}
                    stroke="rgba(255,255,255,.07)"
                  />
                  <text
                    x={padding.left - 8}
                    y={y + 4}
                    textAnchor="end"
                    fill="#64748b"
                    fontSize="11"
                  >
                    {formatMetricValue(value)}
                  </text>
                </g>
              );
            })}
            {series.map((item, seriesIndex) => (
              <polyline
                key={item.name}
                points={item.values
                  .map((value, index) => point(value, index, item.values.length))
                  .join(" ")}
                fill="none"
                stroke={graphColors[seriesIndex]}
                strokeWidth="2.5"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ))}
            {labelIndexes.map((index) => {
              const x =
                padding.left +
                (graph.labels.length <= 1
                  ? plotWidth / 2
                  : (index / (graph.labels.length - 1)) * plotWidth);
              return (
                <text
                  key={`${graph.labels[index]}-${index}`}
                  x={x}
                  y={height - 10}
                  textAnchor={
                    index === 0 ? "start" : index === graph.labels.length - 1 ? "end" : "middle"
                  }
                  fill="#64748b"
                  fontSize="11"
                >
                  {shortLabel(graph.labels[index])}
                </text>
              );
            })}
          </svg>
          <table className="sr-only">
            <caption>{graph.title} values</caption>
            <thead>
              <tr>
                <th scope="col">Interval</th>
                {series.map((item) => (
                  <th key={item.name} scope="col">
                    {humanizeKey(item.name)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {graph.labels.map((label, index) => (
                <tr key={`${label}-${index}`}>
                  <th scope="row">{label}</th>
                  {series.map((item) => (
                    <td key={item.name}>{formatMetricValue(item.values[index] ?? null)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-5 rounded-xl border border-dashed border-white/10 p-6 text-sm text-slate-500">
          No activity matches the current filters.
        </p>
      )}
    </article>
  );
}

function TokenUsage({ overview }: { overview: InternalDashboardOverview }) {
  const usage = overview.token_usage_by_operation;
  const operations = Object.entries(usage.data);

  return (
    <section aria-labelledby="operation-token-heading">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">
          Provider telemetry
        </p>
        <h3 id="operation-token-heading" className="mt-2 text-xl font-semibold text-white">
          {usage.title}
        </h3>
        {usage.note && <p className="mt-1 text-xs leading-5 text-slate-500">{usage.note}</p>}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {operations.length === 0 && (
          <p className="rounded-2xl border border-dashed border-white/10 p-5 text-sm text-slate-500 lg:col-span-3">
            No provider token usage matches the current filters.
          </p>
        )}
        {operations.map(([operation, row]) => {
          const coverage = row.attempts ? row.attempts_with_reported_tokens / row.attempts : null;
          return (
            <article
              key={operation}
              className="rounded-2xl border border-white/8 bg-white/[0.035] p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <h4 className="font-semibold text-slate-100">{humanizeKey(operation)}</h4>
                <span className="rounded-full bg-blue-400/10 px-2.5 py-1 text-xs text-blue-200">
                  {row.api_calls.toLocaleString()} calls
                </span>
              </div>
              <p className="mt-4 text-3xl font-semibold tracking-tight text-white">
                {row.total_tokens.toLocaleString()}
              </p>
              <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">Total tokens</p>
              <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-white/8 pt-4 text-sm">
                <TokenMeasure label="Input" value={row.input_tokens} />
                <TokenMeasure label="Output" value={row.output_tokens} />
                <TokenMeasure label="Thought" value={row.thought_tokens} />
                <TokenMeasure label="Coverage" value={coverage} valueKey="rate" />
              </dl>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function TokenMeasure({
  label,
  value,
  valueKey = "value",
}: {
  label: string;
  value: number | null;
  valueKey?: string;
}) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-1 font-medium text-slate-200">{formatMetricValue(value, valueKey)}</dd>
    </div>
  );
}

function shortLabel(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value.slice(0, 12);
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    ...(value.includes("T") ? { hour: "numeric" } : {}),
  }).format(parsed);
}
