import { Component, type ErrorInfo, type ReactNode } from "react";

import { formatMetricValue, humanizeKey } from "@/features/analytics/lib/format";
import type { MetricPayload } from "@/features/analytics/model/types";

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

function ComparisonTableMetric({ metric, title }: { metric: MetricPayload; title: string }) {
  if (!isObject(metric.data)) return <GenericMetric metric={metric} title={title} />;
  const rows = Object.entries(metric.data).filter(
    (entry): entry is [string, Record<string, unknown>] => isObject(entry[1]),
  );
  if (!rows.length) return <MetricEmpty />;

  const columns = Array.from(
    new Set(rows.flatMap(([, row]) => Object.keys(row).filter((key) => isPrimitive(row[key])))),
  );

  return (
    <>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <caption className="sr-only">{title}</caption>
          <thead>
            <tr className="border-b border-white/8 text-xs uppercase tracking-wide text-slate-500">
              <th scope="col" className="pb-3 pr-5 font-medium">
                Item
              </th>
              {columns.map((column) => (
                <th key={column} scope="col" className="px-3 pb-3 text-right font-medium">
                  {humanizeKey(column)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, row]) => (
              <tr key={label} className="border-b border-white/5 last:border-0">
                <th scope="row" className="py-3 pr-5 font-medium text-slate-200">
                  {humanizeKey(label)}
                </th>
                {columns.map((column) => (
                  <td key={column} className="px-3 py-3 text-right text-slate-300">
                    {formatMetricValue(row[column], column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {typeof metric.note === "string" && metric.note && (
        <p className="mt-3 text-xs leading-5 text-slate-500">{metric.note}</p>
      )}
    </>
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

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPrimitive(value: unknown): boolean {
  return value === null || ["string", "number", "boolean"].includes(typeof value);
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
  comparison_table: ComparisonTableMetric,
};

class MetricBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // Isolate the failing metric without logging protected response data.
  }

  render() {
    if (this.state.failed) {
      return <p className="mt-5 text-sm text-amber-200">This metric could not be displayed.</p>;
    }
    return this.props.children;
  }
}

export function MetricCardContent({ metric, title }: { metric: MetricPayload; title: string }) {
  const Renderer = metricRenderers[metric.chart_type ?? ""] ?? GenericMetric;
  return (
    <MetricBoundary>
      <Renderer metric={metric} title={title} />
    </MetricBoundary>
  );
}
