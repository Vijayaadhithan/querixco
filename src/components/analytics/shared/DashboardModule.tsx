import { Component, type ErrorInfo, type ReactNode } from "react";

import { formatMetricValue, humanizeKey } from "@/lib/analytics-format";
import type { MetricModulePayload, MetricPayload } from "@/lib/analytics-types";

type MetricRenderer = (props: { metric: MetricPayload; title: string }) => ReactNode;

function primitiveEntries(
  metric: MetricPayload,
): Array<[string, string | number | boolean | null]> {
  return Object.entries(metric).filter(
    (entry): entry is [string, string | number | boolean | null] =>
      !["title", "chart_type"].includes(entry[0]) &&
      (entry[1] === null ||
        typeof entry[1] === "string" ||
        typeof entry[1] === "number" ||
        typeof entry[1] === "boolean"),
  );
}

function StatMetric({ metric }: { metric: MetricPayload; title: string }) {
  const entries = primitiveEntries(metric);
  if (!entries.length) return <MetricEmpty />;
  const [primary, ...rest] = entries;

  return (
    <>
      <p className="mt-5 text-3xl font-semibold tracking-tight text-white">
        {formatMetricValue(primary[1], primary[0])}
      </p>
      <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">
        {humanizeKey(primary[0])}
      </p>
      {rest.length > 0 && (
        <dl className="mt-5 grid gap-3 border-t border-white/8 pt-4">
          {rest.slice(0, 4).map(([key, value]) => (
            <div key={key} className="flex items-start justify-between gap-4 text-sm">
              <dt className="text-slate-400">{humanizeKey(key)}</dt>
              <dd className="text-right font-medium text-slate-100">
                {formatMetricValue(value, key)}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </>
  );
}

function labelsAndValues(metric: MetricPayload): { labels: string[]; values: number[] } | null {
  if (!Array.isArray(metric.labels) || !Array.isArray(metric.values)) return null;
  const labels = metric.labels.map(String);
  const values = metric.values.map(Number);
  if (!labels.length || !values.length || values.some((value) => !Number.isFinite(value))) {
    return null;
  }
  return { labels, values };
}

function BarMetric({ metric, title }: { metric: MetricPayload; title: string }) {
  const data = labelsAndValues(metric);
  if (!data) return <GenericMetric metric={metric} title={title} />;
  const max = Math.max(...data.values.map(Math.abs), 1);

  return (
    <div className="mt-5 space-y-3">
      {data.labels.slice(0, 12).map((label, index) => {
        const value = data.values[index] ?? 0;
        return (
          <div key={`${label}-${index}`}>
            <div className="mb-1.5 flex items-start justify-between gap-3 text-xs">
              <span className="min-w-0 truncate text-slate-300">{label}</span>
              <span className="shrink-0 font-medium text-white">{formatMetricValue(value)}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/6">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-400 to-violet-400"
                style={{ width: `${Math.max(2, (Math.abs(value) / max) * 100)}%` }}
                aria-hidden="true"
              />
            </div>
          </div>
        );
      })}
      <table className="sr-only">
        <caption>{title}</caption>
        <thead>
          <tr>
            <th>Label</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {data.labels.map((label, index) => (
            <tr key={`${label}-accessible-${index}`}>
              <td>{label}</td>
              <td>{formatMetricValue(data.values[index])}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ListMetric({ metric, title }: { metric: MetricPayload; title: string }) {
  const list = Object.values(metric).find(Array.isArray);
  if (!list?.length) return <GenericMetric metric={metric} title={title} />;

  return (
    <ol className="mt-5 space-y-2">
      {list.slice(0, 12).map((item, index) => (
        <li
          key={index}
          className="flex gap-3 rounded-xl border border-white/6 bg-white/[0.025] px-3 py-2.5 text-sm"
        >
          <span className="text-slate-500">{index + 1}</span>
          <span className="min-w-0 break-words text-slate-200">
            {typeof item === "object" ? compactObject(item) : formatMetricValue(item)}
          </span>
        </li>
      ))}
    </ol>
  );
}

function GenericMetric({ metric, title }: { metric: MetricPayload; title: string }) {
  const entries = Object.entries(metric).filter(([key]) => !["title", "chart_type"].includes(key));
  if (!entries.length) return <MetricEmpty />;

  return (
    <div className="mt-5 overflow-x-auto">
      <table className="w-full min-w-[280px] text-left text-sm">
        <caption className="sr-only">{title}</caption>
        <thead>
          <tr className="border-b border-white/8 text-xs uppercase tracking-wide text-slate-500">
            <th scope="col" className="pb-2 pr-4 font-medium">
              Measure
            </th>
            <th scope="col" className="pb-2 font-medium">
              Value
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.slice(0, 16).map(([key, value]) => (
            <tr key={key} className="border-b border-white/5 last:border-0">
              <th scope="row" className="py-2.5 pr-4 font-normal text-slate-400">
                {humanizeKey(key)}
              </th>
              <td className="py-2.5 text-slate-100">{displayValue(value, key)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function displayValue(value: unknown, key: string): string {
  if (Array.isArray(value)) {
    if (!value.length) return "No data";
    return value
      .slice(0, 6)
      .map((item) => compactObject(item))
      .join(" · ");
  }
  if (typeof value === "object" && value !== null) return compactObject(value);
  return formatMetricValue(value, key);
}

function compactObject(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value !== "object") return formatMetricValue(value);
  return Object.entries(value)
    .slice(0, 5)
    .map(([key, item]) => `${humanizeKey(key)}: ${formatMetricValue(item, key)}`)
    .join(", ");
}

function MetricEmpty() {
  return <p className="mt-5 text-sm text-slate-500">No data is available for this metric yet.</p>;
}

const metricRenderers: Record<string, MetricRenderer> = {
  stat: StatMetric,
  stats_card: StatMetric,
  bar: BarMetric,
  grouped_bar: BarMetric,
  stacked_bar: BarMetric,
  doughnut: BarMetric,
  line: BarMetric,
  list: ListMetric,
  table: GenericMetric,
  tables: GenericMetric,
  comparison_table: GenericMetric,
};

class MetricBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // The failing metric is isolated without logging protected response data.
  }

  render() {
    if (this.state.failed) {
      return <p className="mt-5 text-sm text-amber-200">This metric could not be displayed.</p>;
    }
    return this.props.children;
  }
}

export function DashboardModule({
  title,
  metrics,
}: {
  title: string;
  metrics: MetricModulePayload;
}) {
  const entries = Object.entries(metrics);

  return (
    <section aria-labelledby={`module-${title.replaceAll(" ", "-").toLowerCase()}`}>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">
            Analytics module
          </p>
          <h2
            id={`module-${title.replaceAll(" ", "-").toLowerCase()}`}
            className="mt-2 text-2xl font-semibold text-white"
          >
            {title}
          </h2>
        </div>
        <span className="text-xs text-slate-500">
          {entries.length} {entries.length === 1 ? "metric" : "metrics"}
        </span>
      </div>

      {entries.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {entries.map(([metricId, metric]) => {
            const metricTitle = metric.title || humanizeKey(metricId);
            const Renderer = metricRenderers[metric.chart_type ?? ""] ?? GenericMetric;
            return (
              <article
                key={metricId}
                className="min-w-0 rounded-2xl border border-white/8 bg-white/[0.035] p-5 shadow-[0_18px_50px_-32px_rgba(0,0,0,.9)]"
              >
                <h3 className="text-base font-semibold text-slate-100">{metricTitle}</h3>
                <MetricBoundary>
                  <Renderer metric={metric} title={metricTitle} />
                </MetricBoundary>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/10 p-7 text-sm text-slate-400">
          This module has no metrics in the current snapshot.
        </div>
      )}
    </section>
  );
}
