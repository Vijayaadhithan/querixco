import { useEffect, useRef, useState } from "react";
import { Activity, ArrowUpRight, CheckCircle2, CircleX, Clock3, SearchX } from "lucide-react";
import { DashboardModule } from "./DashboardModule";
import { formatMetricValue, humanizeKey } from "@/features/analytics/lib/format";
import type {
  AnalyticsAudience,
  AnalyticsDashboard,
  DashboardMainGraph,
  InternalDashboardOverview,
  QueryOutcome,
} from "@/features/analytics/model/types";
const graphColors = [
  "var(--color-workspace-blue)",
  "var(--analytics-series-cyan, #18c7d9)",
  "var(--analytics-series-soft, #a9c9ff)",
  "var(--analytics-series-warning, #f4cd86)",
];
export function DashboardActivityOverview({
  dashboard,
  audience,
  mode,
  queryHref,
  slowestHref,
}: {
  dashboard: AnalyticsDashboard;
  audience: AnalyticsAudience;
  mode: string;
  slowestHref?: string;
  queryHref: (outcome?: QueryOutcome) => string | undefined;
}) {
  const internal = audience === "internal";
  const summary = dashboard.filtered_overview.summary;
  const operational = dashboard.filtered_overview as InternalDashboardOverview;
  const cards: {
    label: string;
    value: number;
    icon: typeof Activity;
    href?: string;
    key?: string;
    link?: string;
    detail?: string;
  }[] =
    "searches" in summary
      ? [
          {
            link: "Review searches",
            label: "Searches",
            value: summary.searches,
            icon: Activity,
            href: queryHref(),
          },
          {
            label: "Searches returning results",
            link: "Review successful searches",
            value: summary.fulfillment_rate,
            key: "rate",
            icon: CheckCircle2,
            href: queryHref("fulfilled"),
          },
          {
            label: "Searches with no results",
            link: "Review these searches",
            detail:
              summary.searches > 0
                ? new Intl.NumberFormat(undefined, {
                    style: "percent",
                    maximumFractionDigits: 1,
                  }).format(summary.zero_results / summary.searches) + " of searches"
                : undefined,
            value: summary.zero_results,
            icon: SearchX,
            href: queryHref("zero_result"),
          },
          {
            label: "Average results returned",
            value: summary.average_returned_results,
            icon: Activity,
          },
        ]
      : [
          {
            link: "Review requests",
            label: "Requests",
            value: summary.requests,
            icon: Activity,
            href: queryHref(),
          },
          {
            label: "Failed requests",
            link: "Investigate failures",
            value: summary.failed,
            icon: CircleX,
            href: queryHref("failure"),
          },
          {
            label: "P95 response time",
            value: summary.p95_latency_ms,
            key: "latency_ms",
            icon: Clock3,
          },
          {
            label: "Requests with no results",
            link: "Review these requests",
            value: summary.zero_results,
            icon: SearchX,
            href: queryHref("zero_result"),
          },
        ];
  return (
    <section className="mt-6 space-y-6" aria-label="Activity results">
      {mode === "overview" && (
        <>
          <div className="analytics-summary-grid">
            {cards.map(({ label, value, key, icon: Icon, href, link, detail }) => (
              <article className="qx-summary-card analytics-summary-card" key={label}>
                <div>
                  <span>{label}</span>
                  <Icon size={16} aria-hidden="true" />
                </div>
                <strong>{formatMetricValue(value, key ?? "value")}</strong>
                {detail && <small className="text-workspace-muted">{detail}</small>}
                {href && (
                  <a href={href} aria-label={`${link} · ${label.toLowerCase()}`}>
                    {link} <ArrowUpRight size={14} />
                  </a>
                )}
              </article>
            ))}
          </div>
          <p className="analytics-small-note">
            {internal
              ? "P95 is the server response time within which 95% of measured requests completed."
              : "Results found means a search returned products; it does not measure purchases."}
          </p>
          {internal ? (
            <ActivityGraph graph={dashboard.filtered_overview.main_graph} />
          ) : (
            <SearchTrends graph={dashboard.filtered_overview.main_graph} />
          )}
        </>
      )}
      {mode === "activity" && (
        <>
          <h2 className="text-2xl text-workspace-ink">
            {internal ? "Request activity" : "Search activity"}
          </h2>
          <p className="analytics-small-note">
            {dashboard.filtering.matched_records.toLocaleString()} matching records out of{" "}
            {dashboard.filtering.total_records.toLocaleString()} available.
          </p>
          {internal ? (
            <ActivityGraph graph={dashboard.filtered_overview.main_graph} />
          ) : (
            <SearchTrends graph={dashboard.filtered_overview.main_graph} />
          )}
          <DashboardModule
            title="Activity breakdowns"
            eyebrow="For the selected activity"
            metrics={dashboard.filtered_overview.breakdowns}
          />
        </>
      )}
      {mode === "performance" && internal && (
        <>
          <h2 className="text-2xl text-workspace-ink">Performance & usage</h2>
          <div className="analytics-summary-grid">
            {[
              ["Success rate", operational.summary.success_rate, "rate"],
              ["P50 response time", operational.summary.p50_latency_ms, "latency_ms"],
              ["P95 response time", operational.summary.p95_latency_ms, "latency_ms"],
              ["Provider API calls", operational.summary.downstream_api_calls, "value"],
            ].map(([label, value, key]) => (
              <article className="analytics-summary-card" key={String(label)}>
                <span>{label}</span>
                <strong>{formatMetricValue(value, String(key))}</strong>
              </article>
            ))}
          </div>
          {slowestHref && (
            <a className="analytics-secondary-link" href={slowestHref}>
              View slowest requests <ArrowUpRight size={14} />
            </a>
          )}
          <DashboardModule
            title="Stage latency"
            eyebrow="For the selected activity"
            metrics={{ stage_latency: operational.stage_latency }}
          />
          <TokenUsage overview={operational} />
        </>
      )}
    </section>
  );
}

function SearchTrends({ graph }: { graph: DashboardMainGraph }) {
  const find = (name: string) => graph.series.find((series) => series.name.toLowerCase() === name);
  const searches = find("text searches");
  const zero = find("zero result");
  if (!searches || !zero) return <ActivityGraph graph={graph} />;
  const volume = [searches, find("fulfilled")].filter((item) => item !== undefined);
  const rate = searches.values.map((count, i) =>
    count > 0 && Number.isFinite(zero.values[i]) ? (zero.values[i] * 100) / count : NaN,
  );
  const total = find("all search activity");
  return (
    <>
      <ActivityGraph
        graph={{
          ...graph,
          title: "No-results rate over time",
          series: [{ name: "Share of text searches", values: rate }],
        }}
        percent
      />
      <ActivityGraph graph={{ ...graph, title: "Text search volume", series: volume }} />
      {total && (
        <details className="analytics-snapshot-reports">
          <summary>Overall search activity</summary>
          <ActivityGraph graph={{ ...graph, title: "Overall search activity", series: [total] }} />
        </details>
      )}
    </>
  );
}

function ActivityGraph({
  graph,
  percent = false,
}: {
  graph: DashboardMainGraph;
  percent?: boolean;
}) {
  const series = graph.series.filter((item) => item.values.length > 0).slice(0, 4);
  const allValues = series.flatMap((item) => item.values).filter(Number.isFinite);
  const max = Math.max(...allValues, 1);
  const container = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(900);
  useEffect(() => {
    if (!container.current || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) =>
      setWidth(Math.max(280, Math.round(entry.contentRect.width))),
    );
    observer.observe(container.current);
    return () => observer.disconnect();
  }, [series.length, allValues.length]);
  const format = (value: number | undefined) =>
    value === undefined || !Number.isFinite(value)
      ? "—"
      : percent
        ? `${Number(value.toFixed(1))}%`
        : formatMetricValue(value);
  const height = 260;
  const padding = { top: 20, right: 20, bottom: 40, left: 46 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const labelIndexes = graph.labels.length
    ? Array.from(
        new Set(
          (width < 500 ? [0, 0.5, 1] : [0, 0.25, 0.5, 0.75, 1]).map((ratio) =>
            Math.round((graph.labels.length - 1) * ratio),
          ),
        ),
      )
    : [];

  function point(value: number, index: number, count: number): string {
    const x = padding.left + (count <= 1 ? plotWidth / 2 : (index / (count - 1)) * plotWidth);
    const y = padding.top + plotHeight - (Math.max(0, value) / max) * plotHeight;
    return `${x},${y}`;
  }

  return (
    <article className="rounded-lg border border-workspace-line bg-workspace-surface p-4 sm:p-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h3 className="font-semibold text-workspace-ink">{graph.title}</h3>
          <p className="mt-1 text-xs text-workspace-muted">
            {humanizeKey(graph.granularity)} intervals · {graph.timezone}
          </p>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {series.map((item, index) => (
            <span
              key={item.name}
              className="inline-flex items-center gap-1.5 text-xs text-workspace-muted"
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

      {graph.labels.length > 0 && allValues.length > 0 ? (
        <div ref={container} className="mt-5 min-w-0">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full"
            role="img"
            aria-label={`${graph.title} line chart`}
          >
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = padding.top + plotHeight * ratio;
              const value = percent ? max * (1 - ratio) : Math.round(max * (1 - ratio));
              return (
                <g key={ratio}>
                  <line
                    x1={padding.left}
                    x2={width - padding.right}
                    y1={y}
                    y2={y}
                    stroke="var(--color-workspace-line)"
                  />
                  <text
                    x={padding.left - 8}
                    y={y + 4}
                    textAnchor="end"
                    fill="var(--color-workspace-muted)"
                    fontSize="11"
                  >
                    {format(value)}
                  </text>
                </g>
              );
            })}
            {series.map((item, seriesIndex) => {
              const paths: string[][] = [];
              let segment: string[] = [];
              item.values.forEach((value, i) => {
                if (!Number.isFinite(value)) {
                  segment = [];
                  return;
                }
                if (!segment.length) paths.push(segment);
                segment.push(point(value, i, graph.labels.length));
              });
              return (
                <g key={item.name} stroke={graphColors[seriesIndex]}>
                  {paths.map((points, i) => {
                    if (points.length === 1) {
                      const [cx, cy] = points[0].split(",");
                      return (
                        <circle key={i} cx={cx} cy={cy} r={3} fill={graphColors[seriesIndex]} />
                      );
                    }
                    return (
                      <polyline
                        key={i}
                        points={points.join(" ")}
                        fill="none"
                        className="qx-chart-line"
                        pathLength={1}
                        strokeWidth="2.5"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />
                    );
                  })}
                </g>
              );
            })}
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
                  fill="var(--color-workspace-muted)"
                  fontSize="11"
                >
                  {shortLabel(graph.labels[index], graph.timezone)}
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
                    <td key={item.name}>{format(item.values[index])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-5 rounded-md border border-dashed border-workspace-line p-6 text-sm text-workspace-muted">
          {percent
            ? "No text searches in this selection to calculate a rate."
            : "No activity matches the current filters."}
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
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-workspace-blue">
          Provider telemetry
        </p>
        <h3 id="operation-token-heading" className="mt-2 text-xl font-semibold text-workspace-ink">
          Reported token usage by operation
        </h3>
        {usage.note && <p className="mt-1 text-xs leading-5 text-workspace-muted">{usage.note}</p>}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {operations.length === 0 && (
          <p className="rounded-lg border border-dashed border-workspace-line p-5 text-sm text-workspace-muted lg:col-span-3">
            No provider token usage matches the current filters.
          </p>
        )}
        {operations.map(([operation, row]) => {
          const coverage = row.attempts ? row.attempts_with_reported_tokens / row.attempts : null;
          return (
            <article
              key={operation}
              className="rounded-lg border border-workspace-line bg-workspace-surface p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <h4 className="font-semibold text-workspace-ink">
                  {operation.toLowerCase() === "llm" ? "LLM" : humanizeKey(operation)}
                </h4>
                <span className="rounded-full bg-workspace-tint px-2.5 py-1 text-xs text-workspace-blue">
                  {row.api_calls.toLocaleString()} calls
                </span>
              </div>
              {row.attempts_with_reported_tokens === 0 && row.total_tokens === 0 ? (
                <p className="mt-4 text-sm text-workspace-body">
                  {row.api_calls || row.attempts ? "Token usage unreported" : "No calls"}
                </p>
              ) : (
                <>
                  <p className="mt-4 text-3xl font-semibold tracking-tight text-workspace-ink">
                    {row.total_tokens.toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-workspace-muted">
                    Total tokens
                  </p>
                  <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-workspace-line pt-4 text-sm">
                    <TokenMeasure label="Input" value={row.input_tokens} />
                    <TokenMeasure label="Output" value={row.output_tokens} />
                    <TokenMeasure label="Thought" value={row.thought_tokens} />
                    <TokenMeasure label="Coverage" value={coverage} valueKey="rate" />
                  </dl>
                </>
              )}
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
      <dt className="text-xs text-workspace-muted">{label}</dt>
      <dd className="mt-1 font-medium text-workspace-ink">{formatMetricValue(value, valueKey)}</dd>
    </div>
  );
}

function shortLabel(value: string, timezone: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value.slice(0, 12);
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    timeZone: value.includes("T") ? timezone : "UTC",
    ...(value.includes("T") ? { hour: "numeric" } : {}),
  }).format(parsed);
}
