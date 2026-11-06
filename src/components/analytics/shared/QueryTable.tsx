import { InternalQueryDetails } from "./queries/InternalQueryDetails";
import { formatDateTime, humanizeKey } from "@/features/analytics/lib/format";
import type { CompanyQueryRecord, InternalQueryRecord } from "@/features/analytics/model/types";

type QueryRecord = CompanyQueryRecord | InternalQueryRecord;

export function QueryTable({ items, internal }: { items: QueryRecord[]; internal: boolean }) {
  const safeItems = items.filter(isQueryRecord);

  return (
    <>
      <div className="hidden overflow-x-auto rounded-lg border border-workspace-line md:block">
        <table
          className={`w-full text-left text-sm ${internal ? "min-w-[1280px]" : "min-w-[900px]"}`}
        >
          <caption className="sr-only">Individual query history</caption>
          <thead className="bg-workspace-wash text-xs uppercase tracking-wide text-workspace-muted">
            {internal ? <InternalTableHeaders /> : <CompanyTableHeaders />}
          </thead>
          <tbody className="divide-y divide-workspace-line">
            {safeItems.map((item, index) => (
              <QueryTableRow key={queryKey(item, index)} item={item} internal={internal} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {safeItems.map((item, index) => {
          const count = resultCount(item);
          const internalItem = internal ? (item as InternalQueryRecord) : null;
          return (
            <article
              key={queryKey(item, index)}
              className="rounded-lg border border-workspace-line bg-workspace-surface p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="min-w-0 break-words text-sm font-medium text-workspace-ink">
                  {textValue(item.query, "Query unavailable")}
                </p>
                <OutcomeBadge outcome={item.outcome} />
              </div>
              <p className="mt-2 text-xs text-workspace-muted">{formatDateTime(item.created_at)}</p>
              <FilterChips filters={item.filters} requestKind={item.request_kind} />
              {internalItem ? (
                <>
                  <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                    <MobileMetric label="Status" value={internalStatusText(internalItem)} />
                    <MobileMetric
                      label="Execution path"
                      value={textValue(internalItem.performance?.execution_path, "Unavailable")}
                    />
                    <MobileMetric
                      label="Server duration"
                      value={formatDuration(internalItem.performance?.total_server_duration_ms)}
                    />
                    <MobileMetric
                      label="Results (returned / total)"
                      value={formatInternalResults(internalItem)}
                    />
                    <MobileMetric
                      label="Total tokens"
                      value={formatCount(internalItem.token_usage?.total_tokens)}
                    />
                  </dl>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <CacheBadge label="Plan" value={internalItem.performance?.cache?.plan_hit} />
                    <CacheBadge
                      label="Result"
                      value={internalItem.performance?.cache?.result_hit}
                    />
                  </div>
                  <InternalQueryDetails item={internalItem} />
                </>
              ) : (
                <>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {classification(item).map((value, valueIndex) => (
                      <span
                        key={`${value}-${valueIndex}`}
                        className="rounded-full border border-workspace-line bg-workspace-wash px-2 py-1 text-xs text-workspace-body"
                      >
                        {value}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-workspace-muted">
                    {count === null
                      ? "Result count unavailable"
                      : `${count.toLocaleString()} results`}
                  </p>
                </>
              )}
            </article>
          );
        })}
      </div>
    </>
  );
}

function QueryTableRow({ item, internal }: { item: QueryRecord; internal: boolean }) {
  if (internal) return <InternalQueryTableRow item={item as InternalQueryRecord} />;

  const count = resultCount(item);
  const query = textValue(item.query, "Query unavailable");
  const normalizedQuery = textValue(item.normalized_query);

  return (
    <>
      <tr className="align-top transition hover:bg-workspace-wash">
        <td className="max-w-md px-4 py-4">
          <p className="break-words font-medium text-workspace-ink">{query}</p>
          {normalizedQuery && normalizedQuery !== query && (
            <p className="mt-1 break-words text-xs text-workspace-muted">{normalizedQuery}</p>
          )}
          <FilterChips filters={item.filters} requestKind={item.request_kind} />
        </td>
        <td className="whitespace-nowrap px-4 py-4 text-workspace-muted">
          {formatDateTime(item.created_at)}
        </td>
        <td className="max-w-xs px-4 py-4">
          <div className="flex flex-wrap gap-1.5">
            {classification(item).map((value, valueIndex) => (
              <span
                key={`${value}-${valueIndex}`}
                className="rounded-full border border-workspace-line bg-workspace-wash px-2 py-1 text-xs text-workspace-body"
              >
                {value}
              </span>
            ))}
          </div>
        </td>
        <td className="px-4 py-4">
          <OutcomeBadge outcome={item.outcome} />
        </td>
        <td className="px-4 py-4 text-right font-medium text-workspace-ink">
          {count === null ? "—" : count.toLocaleString()}
        </td>
      </tr>
    </>
  );
}

function CompanyTableHeaders() {
  return (
    <tr>
      <th scope="col" className="px-4 py-3 font-medium">
        Query
      </th>
      <th scope="col" className="px-4 py-3 font-medium">
        Time
      </th>
      <th scope="col" className="px-4 py-3 font-medium">
        Classification
      </th>
      <th scope="col" className="px-4 py-3 font-medium">
        Outcome
      </th>
      <th scope="col" className="px-4 py-3 text-right font-medium">
        Results
      </th>
    </tr>
  );
}

function InternalTableHeaders() {
  return (
    <tr>
      <th scope="col" className="px-4 py-3 font-medium">
        Query
      </th>
      <th scope="col" className="px-4 py-3 font-medium">
        Time
      </th>
      <th scope="col" className="px-4 py-3 font-medium">
        Status / outcome
      </th>
      <th scope="col" className="px-4 py-3 font-medium">
        Execution path
      </th>
      <th scope="col" className="px-4 py-3 text-right font-medium">
        Server duration
      </th>
      <th scope="col" className="px-4 py-3 font-medium">
        Cache
      </th>
      <th scope="col" className="px-4 py-3 text-right font-medium">
        Results (returned / total)
      </th>
      <th scope="col" className="px-4 py-3 text-right font-medium">
        Total tokens
      </th>
    </tr>
  );
}

function InternalQueryTableRow({ item }: { item: InternalQueryRecord }) {
  const query = textValue(item.query, "Query unavailable");
  const normalizedQuery = textValue(item.normalized_query);

  return (
    <>
      <tr className="align-top transition hover:bg-workspace-wash">
        <td className="max-w-md px-4 py-4">
          <p className="break-words font-medium text-workspace-ink">{query}</p>
          {normalizedQuery && normalizedQuery !== query && (
            <p className="mt-1 break-words text-xs text-workspace-muted">{normalizedQuery}</p>
          )}
          <FilterChips filters={item.filters} requestKind={item.request_kind} />
        </td>
        <td className="whitespace-nowrap px-4 py-4 text-workspace-muted">
          {formatDateTime(item.created_at)}
        </td>
        <td className="px-4 py-4">
          <OutcomeBadge outcome={item.outcome} />
          <p className="mt-1 text-xs text-workspace-muted">{internalStatusText(item)}</p>
        </td>
        <td className="px-4 py-4 text-workspace-body">
          {textValue(item.performance?.execution_path, "Unavailable")}
        </td>
        <td className="whitespace-nowrap px-4 py-4 text-right font-medium text-workspace-ink">
          {formatDuration(item.performance?.total_server_duration_ms)}
        </td>
        <td className="px-4 py-4">
          <div className="flex flex-col items-start gap-1.5">
            <CacheBadge label="Plan" value={item.performance?.cache?.plan_hit} />
            <CacheBadge label="Result" value={item.performance?.cache?.result_hit} />
          </div>
        </td>
        <td className="whitespace-nowrap px-4 py-4 text-right font-medium text-workspace-ink">
          {formatInternalResults(item)}
        </td>
        <td className="px-4 py-4 text-right font-medium text-workspace-ink">
          {formatCount(item.token_usage?.total_tokens)}
        </td>
      </tr>
      <tr>
        <td colSpan={8} className="px-4 pb-4">
          <InternalQueryDetails item={item} />
        </td>
      </tr>
    </>
  );
}

function MobileMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-workspace-muted">{label}</dt>
      <dd className="mt-0.5 text-workspace-ink">{value}</dd>
    </div>
  );
}

function FilterChips({
  filters,
  requestKind,
}: {
  filters: QueryRecord["filters"];
  requestKind: QueryRecord["request_kind"];
}) {
  const values = isRecord(filters) ? filters : {};
  const chips = [
    requestKind !== "text_search" ? `Request type: ${humanizeKey(requestKind)}` : null,
    values.city,
    values.locality,
    values.subcategory ?? values.main_category,
    values.target_ad_type ? humanizeKey(String(values.target_ad_type)) : null,
  ].filter(
    (value): value is string | number => typeof value === "string" || typeof value === "number",
  );
  if (chips.length === 0) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {chips.map((value, index) => (
        <span
          key={`${String(value)}-${index}`}
          className="rounded-full border border-workspace-blue-line bg-workspace-tint px-2 py-0.5 text-[11px] text-workspace-blue"
        >
          {String(value)}
        </span>
      ))}
    </div>
  );
}

function CacheBadge({ label, value }: { label: string; value: unknown }) {
  const state = typeof value === "boolean" ? (value ? "Hit" : "Miss") : "Unavailable";
  const className =
    value === true
      ? "border-workspace-success-line bg-workspace-success-tint text-workspace-success"
      : value === false
        ? "border-workspace-line bg-workspace-wash text-workspace-body"
        : "border-workspace-warning-line bg-workspace-warning-tint text-workspace-warning";

  return (
    <span
      className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-medium ${className}`}
    >
      {label}: {state}
    </span>
  );
}

function classification(item: QueryRecord): string[] {
  return [
    ...stringArray(item.categories).slice(0, 2),
    ...stringArray(item.brands).slice(0, 1),
    ...stringArray(item.locations).slice(0, 1),
    ...stringArray(item.language ? [item.language] : []),
  ].filter(Boolean);
}

function OutcomeBadge({ outcome }: { outcome: unknown }) {
  const normalizedOutcome = typeof outcome === "string" ? outcome : "unknown";
  const label =
    {
      fulfilled: "Results found",
      zero_result: "No results",
      failure: "System error",
      telemetry_missing: "Telemetry unavailable",
    }[normalizedOutcome] ?? humanizeKey(normalizedOutcome);
  const className =
    {
      fulfilled: "border-workspace-success-line bg-workspace-success-tint text-workspace-success",
      zero_result: "border-workspace-warning-line bg-workspace-warning-tint text-workspace-warning",
      failure: "border-workspace-danger-line bg-workspace-danger-tint text-workspace-danger",
      telemetry_missing: "border-workspace-line bg-workspace-wash text-workspace-body",
    }[normalizedOutcome] ?? "border-workspace-line bg-workspace-wash text-workspace-body";

  return (
    <span
      className={`inline-flex shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isQueryRecord(value: QueryRecord): value is QueryRecord {
  return isRecord(value);
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => typeof item === "string" || typeof item === "number").map(String);
}

function textValue(value: unknown, fallback = ""): string {
  return typeof value === "string" || typeof value === "number" ? String(value) : fallback;
}

function resultCount(item: QueryRecord): number | null {
  if (!("search" in item) || !isRecord(item.search)) return null;
  const count = item.search.result_count;
  return typeof count === "number" && Number.isFinite(count) ? count : null;
}

function formatInternalResults(item: InternalQueryRecord): string {
  return `${formatCount(item.api?.result_count)} / ${formatCount(item.api?.total_results)}`;
}

function formatCount(value: unknown): string {
  return typeof value === "number" && Number.isFinite(value)
    ? value.toLocaleString()
    : "Unavailable";
}

function formatDuration(value: unknown): string {
  return typeof value === "number" && Number.isFinite(value)
    ? `${value.toLocaleString(undefined, { maximumFractionDigits: 3 })} ms`
    : "Unavailable";
}

function internalStatusText(item: InternalQueryRecord): string {
  const status = item.api?.status;
  return typeof status === "string" && status ? humanizeKey(status) : "Unavailable";
}

function queryKey(item: QueryRecord, index: number): string {
  const requestId = textValue(item.request_id);
  return requestId || `${textValue(item.search_id, "query")}-${index}`;
}
