import { ChevronDown } from "lucide-react";

import { formatMetricValue, humanizeKey } from "@/features/analytics/lib/format";
import type { InternalQueryRecord } from "@/features/analytics/model/types";

export function InternalQueryDetails({ item }: { item: InternalQueryRecord }) {
  const apiEntries = Object.entries(isRecord(item.api) ? item.api : {});
  const attempts = Array.isArray(item.attempts) ? item.attempts.filter(isRecord) : [];

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
        {apiEntries.length === 0 && (
          <p className="text-xs text-slate-500">API diagnostics are unavailable for this query.</p>
        )}
        <p className="mt-3 text-xs font-medium text-slate-300">Attempts: {attempts.length}</p>
        {attempts.length > 0 && (
          <ol className="mt-2 space-y-2">
            {attempts.map((attempt, index) => (
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
