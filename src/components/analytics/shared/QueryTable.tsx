import { ChevronDown } from "lucide-react";

import { formatDateTime, formatMetricValue, humanizeKey } from "@/lib/analytics-format";
import type { CompanyQueryRecord, InternalQueryRecord } from "@/lib/analytics-types";

type QueryRecord = CompanyQueryRecord | InternalQueryRecord;

export function QueryTable({ items, internal }: { items: QueryRecord[]; internal: boolean }) {
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
            {items.map((item) => (
              <QueryTableRow key={item.request_id} item={item} internal={internal} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {items.map((item) => (
          <article
            key={item.request_id}
            className="rounded-2xl border border-white/8 bg-white/[0.035] p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="min-w-0 break-words text-sm font-medium text-white">{item.query}</p>
              <OutcomeBadge outcome={item.outcome} />
            </div>
            <p className="mt-2 text-xs text-slate-500">{formatDateTime(item.created_at)}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {classification(item).map((value) => (
                <span
                  key={value}
                  className="rounded-full border border-white/8 bg-white/5 px-2 py-1 text-xs text-slate-300"
                >
                  {value}
                </span>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-400">
              {item.search.result_count === null
                ? "Result count unavailable"
                : `${item.search.result_count.toLocaleString()} results`}
            </p>
            {internal && isInternalRecord(item) && <InternalDetails item={item} />}
          </article>
        ))}
      </div>
    </>
  );
}

function QueryTableRow({ item, internal }: { item: QueryRecord; internal: boolean }) {
  return (
    <>
      <tr className="align-top transition hover:bg-white/[0.025]">
        <td className="max-w-md px-4 py-4">
          <p className="break-words font-medium text-slate-100">{item.query}</p>
          {item.normalized_query && item.normalized_query !== item.query && (
            <p className="mt-1 break-words text-xs text-slate-500">{item.normalized_query}</p>
          )}
          {internal && isInternalRecord(item) && <InternalDetails item={item} />}
        </td>
        <td className="whitespace-nowrap px-4 py-4 text-slate-400">
          {formatDateTime(item.created_at)}
        </td>
        <td className="max-w-xs px-4 py-4">
          <div className="flex flex-wrap gap-1.5">
            {classification(item).map((value) => (
              <span
                key={value}
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
          {item.search.result_count === null ? "—" : item.search.result_count.toLocaleString()}
        </td>
      </tr>
    </>
  );
}

function classification(item: QueryRecord): string[] {
  return [
    ...item.categories.slice(0, 2),
    ...item.brands.slice(0, 1),
    ...item.locations.slice(0, 1),
    ...(item.language ? [item.language] : []),
  ].filter(Boolean);
}

function OutcomeBadge({ outcome }: { outcome: QueryRecord["outcome"] }) {
  const className = {
    fulfilled: "border-emerald-400/20 bg-emerald-400/8 text-emerald-200",
    zero_result: "border-amber-400/20 bg-amber-400/8 text-amber-200",
    failure: "border-red-400/20 bg-red-400/8 text-red-200",
    telemetry_missing: "border-slate-400/20 bg-slate-400/8 text-slate-300",
  }[outcome];

  return (
    <span
      className={`inline-flex shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${className}`}
    >
      {humanizeKey(outcome)}
    </span>
  );
}

function isInternalRecord(item: QueryRecord): item is InternalQueryRecord {
  return "api" in item && "attempts" in item;
}

function InternalDetails({ item }: { item: InternalQueryRecord }) {
  const apiEntries = Object.entries(item.api);

  return (
    <details className="group mt-3">
      <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 text-xs font-medium text-violet-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300">
        Internal diagnostics
        <ChevronDown className="h-3.5 w-3.5 transition group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="mt-3 rounded-xl border border-violet-400/12 bg-violet-400/[0.045] p-3">
        <dl className="grid gap-2 text-xs sm:grid-cols-2">
          {apiEntries.map(([key, value]) => (
            <div key={key}>
              <dt className="text-slate-500">{humanizeKey(key)}</dt>
              <dd className="mt-0.5 break-words text-slate-200">{formatMetricValue(value, key)}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-xs font-medium text-slate-300">Attempts: {item.attempts.length}</p>
        {item.attempts.length > 0 && (
          <ol className="mt-2 space-y-2">
            {item.attempts.map((attempt, index) => (
              <li key={index} className="rounded-lg bg-black/15 p-2 text-xs text-slate-300">
                {Object.entries(attempt)
                  .map(([key, value]) => `${humanizeKey(key)}: ${formatMetricValue(value, key)}`)
                  .join(" · ")}
              </li>
            ))}
          </ol>
        )}
      </div>
    </details>
  );
}
