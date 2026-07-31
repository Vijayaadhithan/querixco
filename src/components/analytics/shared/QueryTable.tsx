import { InternalQueryDetails } from "./queries/InternalQueryDetails";
import { formatDateTime, humanizeKey } from "@/features/analytics/lib/format";
import type { CompanyQueryRecord, InternalQueryRecord } from "@/features/analytics/model/types";

type QueryRecord = CompanyQueryRecord | InternalQueryRecord;

export function QueryTable({ items, internal }: { items: QueryRecord[]; internal: boolean }) {
  const safeItems = items.filter(isQueryRecord);

  return (
    <>
      <div className="hidden overflow-x-auto rounded-2xl border border-white/8 md:block">
        <table className="w-full min-w-[900px] text-left text-sm">
          <caption className="sr-only">Individual query history</caption>
          <thead className="bg-white/[0.045] text-xs uppercase tracking-wide text-slate-500">
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
                {count === null ? "Result count unavailable" : `${count.toLocaleString()} results`}
              </p>
              {internal && isInternalRecord(item) && <InternalQueryDetails item={item} />}
            </article>
          );
        })}
      </div>
    </>
  );
}

function QueryTableRow({ item, internal }: { item: QueryRecord; internal: boolean }) {
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
          {internal && isInternalRecord(item) && <InternalQueryDetails item={item} />}
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

function isInternalRecord(item: QueryRecord): item is InternalQueryRecord {
  return isRecord(item) && ("api" in item || "attempts" in item);
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

function queryKey(item: QueryRecord, index: number): string {
  const requestId = textValue(item.request_id);
  return requestId || `${textValue(item.search_id, "query")}-${index}`;
}
