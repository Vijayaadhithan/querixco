import { InternalQueryDetails } from "./queries/InternalQueryDetails";
import { formatDateTime, humanizeKey } from "@/features/analytics/lib/format";
import type { CompanyQueryRecord, InternalQueryRecord } from "@/features/analytics/model/types";

type QueryRecord = CompanyQueryRecord | InternalQueryRecord;

export function QueryTable({ items, internal }: { items: QueryRecord[]; internal: boolean }) {
  const safeItems = items.filter(isQueryRecord);

  return (
    <>
      <div className="hidden overflow-x-auto rounded-2xl border border-white/8 md:block">
        <table
          className={`w-full text-left text-sm ${internal ? "min-w-[1280px]" : "min-w-[900px]"}`}
        >
          <caption className="sr-only">Individual query history</caption>
          <thead className="bg-white/[0.045] text-xs uppercase tracking-wide text-slate-500">
            {internal ? <InternalTableHeaders /> : <CompanyTableHeaders />}
          </thead>
          <tbody className="divide-y divide-white/6">
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
              className="rounded-2xl border border-white/8 bg-white/[0.035] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="min-w-0 break-words text-sm font-medium text-white">
                  {textValue(item.query, "Query unavailable")}
                </p>
                <OutcomeBadge outcome={item.outcome} />
              </div>
              <p className="mt-2 text-xs text-slate-500">{formatDateTime(item.created_at)}</p>
              {internalItem ? (
                <>
                  <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                    <MobileMetric label="Status" value={statusText(item)} />
                    <MobileMetric
                      label="Execution path"
                      value={textValue(internalItem.performance?.execution_path, "Unavailable")}
                    />
                    <MobileMetric
                      label="Server duration"
                      value={formatDuration(internalItem.performance?.total_server_duration_ms)}
                    />
                    <MobileMetric label="Results (returned / total)" value={formatResults(item)} />
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
                        className="rounded-full border border-white/8 bg-white/5 px-2 py-1 text-xs text-slate-300"
                      >
                        {value}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-slate-400">
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
      <tr className="align-top transition hover:bg-white/[0.025]">
        <td className="max-w-md px-4 py-4">
          <p className="break-words font-medium text-slate-100">{query}</p>
          {normalizedQuery && normalizedQuery !== query && (
            <p className="mt-1 break-words text-xs text-slate-500">{normalizedQuery}</p>
          )}
        </td>
        <td className="whitespace-nowrap px-4 py-4 text-slate-400">
          {formatDateTime(item.created_at)}
        </td>
        <td className="max-w-xs px-4 py-4">
          <div className="flex flex-wrap gap-1.5">
            {classification(item).map((value, valueIndex) => (
              <span
                key={`${value}-${valueIndex}`}
                className="rounded-full border border-white/8 bg-white/5 px-2 py-1 text-xs text-slate-300"
              >
                {value}
              </span>
            ))}
          </div>
        </td>
        <td className="px-4 py-4">
          <OutcomeBadge outcome={item.outcome} />
        </td>
        <td className="px-4 py-4 text-right font-medium text-slate-200">
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
      <tr className="align-top transition hover:bg-white/[0.025]">
        <td className="max-w-md px-4 py-4">
          <p className="break-words font-medium text-slate-100">{query}</p>
          {normalizedQuery && normalizedQuery !== query && (
            <p className="mt-1 break-words text-xs text-slate-500">{normalizedQuery}</p>
          )}
        </td>
        <td className="whitespace-nowrap px-4 py-4 text-slate-400">
          {formatDateTime(item.created_at)}
        </td>
        <td className="px-4 py-4">
          <OutcomeBadge outcome={item.outcome} />
          <p className="mt-1 text-xs text-slate-500">{statusText(item)}</p>
        </td>
        <td className="px-4 py-4 text-slate-300">
          {textValue(item.performance?.execution_path, "Unavailable")}
        </td>
        <td className="whitespace-nowrap px-4 py-4 text-right font-medium text-slate-100">
          {formatDuration(item.performance?.total_server_duration_ms)}
        </td>
        <td className="px-4 py-4">
          <div className="flex flex-col items-start gap-1.5">
            <CacheBadge label="Plan" value={item.performance?.cache?.plan_hit} />
            <CacheBadge label="Result" value={item.performance?.cache?.result_hit} />
          </div>
        </td>
        <td className="whitespace-nowrap px-4 py-4 text-right font-medium text-slate-200">
          {formatResults(item)}
        </td>
        <td className="px-4 py-4 text-right font-medium text-slate-200">
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
      <dt className="text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-slate-200">{value}</dd>
    </div>
  );
}

function CacheBadge({ label, value }: { label: string; value: unknown }) {
  const state = typeof value === "boolean" ? (value ? "Hit" : "Miss") : "Unavailable";
  const className =
    value === true
      ? "border-emerald-400/20 bg-emerald-400/8 text-emerald-200"
      : value === false
        ? "border-slate-400/20 bg-slate-400/8 text-slate-300"
        : "border-amber-400/20 bg-amber-400/8 text-amber-200";

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
  const className =
    {
      fulfilled: "border-emerald-400/20 bg-emerald-400/8 text-emerald-200",
      zero_result: "border-amber-400/20 bg-amber-400/8 text-amber-200",
      failure: "border-red-400/20 bg-red-400/8 text-red-200",
      telemetry_missing: "border-slate-400/20 bg-slate-400/8 text-slate-300",
    }[normalizedOutcome] ?? "border-slate-400/20 bg-slate-400/8 text-slate-300";

  return (
    <span
      className={`inline-flex shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${className}`}
    >
      {humanizeKey(normalizedOutcome)}
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
  if (!isRecord(item.search)) return null;
  const count = item.search.result_count;
  return typeof count === "number" && Number.isFinite(count) ? count : null;
}

function totalResultCount(item: QueryRecord): number | null {
  if (!isRecord(item.search)) return null;
  const count = item.search.total_results;
  return typeof count === "number" && Number.isFinite(count) ? count : null;
}

function formatResults(item: QueryRecord): string {
  return `${formatCount(resultCount(item))} / ${formatCount(totalResultCount(item))}`;
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

function statusText(item: QueryRecord): string {
  const status = isRecord(item.search) ? item.search.status : null;
  return typeof status === "string" && status ? humanizeKey(status) : "Unavailable";
}

function queryKey(item: QueryRecord, index: number): string {
  const requestId = textValue(item.request_id);
  return requestId || `${textValue(item.search_id, "query")}-${index}`;
}
