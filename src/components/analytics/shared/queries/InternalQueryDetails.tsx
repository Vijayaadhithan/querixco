import { ChevronDown } from "lucide-react";

import { humanizeKey } from "@/features/analytics/lib/format";
import type { InternalQueryAttempt, InternalQueryRecord } from "@/features/analytics/model/types";

const successStatuses = new Set(["success", "successful", "ok", "cache_hit"]);

export function InternalQueryDetails({ item }: { item: InternalQueryRecord }) {
  const performance = isRecord(item.performance) ? item.performance : null;
  const tokenUsage = isRecord(item.token_usage) ? item.token_usage : null;
  const cache = isRecord(performance?.cache) ? performance.cache : null;
  const attempts = Array.isArray(item.attempts) ? item.attempts.filter(isAttempt) : [];
  const failedAttempts = attempts.filter((attempt) => isFailure(attempt.status));
  const fallbackSucceeded = attempts.some(
    (attempt, index) =>
      isSuccessful(attempt.status) &&
      attempts.slice(0, index).some((earlier) => isFailure(earlier.status)),
  );
  const api = isRecord(item.api) ? item.api : null;

  return (
    <details className="group mt-3">
      <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 text-xs font-medium text-violet-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300">
        Internal diagnostics
        <ChevronDown className="h-3.5 w-3.5 transition group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="mt-3 space-y-5 rounded-xl border border-violet-400/12 bg-violet-400/[0.045] p-4">
        <section aria-labelledby={`performance-${item.request_id}`}>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Total server duration
              </p>
              <p
                id={`performance-${item.request_id}`}
                className="mt-1 text-2xl font-semibold text-white"
              >
                {formatDuration(performance?.total_server_duration_ms)}
              </p>
              <p className="mt-1 text-xs text-slate-500">Authoritative server processing time.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <CacheBadge label="Plan cache" value={cache?.plan_hit} />
              <CacheBadge label="Result cache" value={cache?.result_hit} />
            </div>
          </div>

          <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <Metric label="Execution path" value={formatLabel(performance?.execution_path)} />
            <Metric
              label="Downstream API calls"
              value={formatCount(performance?.downstream_api_calls)}
            />
            <Metric label="API call count" value={formatCount(api?.api_call_count)} />
            <Metric
              label="Successful attempts"
              value={formatCount(performance?.successful_attempt_count)}
            />
            <Metric
              label="Failed attempts"
              value={formatCount(performance?.failed_attempt_count)}
            />
          </dl>
        </section>

        <section aria-labelledby={`tokens-${item.request_id}`}>
          <h3 id={`tokens-${item.request_id}`} className="text-sm font-semibold text-slate-100">
            Token usage
          </h3>
          <dl className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <Metric label="Input" value={formatCount(tokenUsage?.input_tokens)} />
            <Metric label="Output" value={formatCount(tokenUsage?.output_tokens)} />
            <Metric label="Thought" value={formatCount(tokenUsage?.thought_tokens)} />
            <Metric label="Total" value={formatCount(tokenUsage?.total_tokens)} />
            <Metric
              label="Tokens per result"
              value={formatDecimal(tokenUsage?.tokens_per_result)}
            />
          </dl>
        </section>

        <section aria-labelledby={`attempts-${item.request_id}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 id={`attempts-${item.request_id}`} className="text-sm font-semibold text-slate-100">
              Provider and model attempts
            </h3>
            <span className="text-xs text-slate-500">
              Recorded: {formatCount(performance?.attempt_count)}
            </span>
          </div>
          {attempts.length > 0 ? (
            <div className="mt-2 overflow-x-auto rounded-lg border border-white/8">
              <table className="w-full min-w-[900px] text-left text-xs">
                <thead className="bg-black/15 text-slate-500">
                  <tr>
                    <th scope="col" className="px-3 py-2 font-medium">
                      #
                    </th>
                    <th scope="col" className="px-3 py-2 font-medium">
                      Operation
                    </th>
                    <th scope="col" className="px-3 py-2 font-medium">
                      Provider / model
                    </th>
                    <th scope="col" className="px-3 py-2 font-medium">
                      Status
                    </th>
                    <th scope="col" className="px-3 py-2 text-right font-medium">
                      Duration
                    </th>
                    <th scope="col" className="px-3 py-2 text-right font-medium">
                      API calls
                    </th>
                    <th scope="col" className="px-3 py-2 text-right font-medium">
                      Tokens
                    </th>
                    <th scope="col" className="px-3 py-2 font-medium">
                      Failure / fallback
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/6">
                  {attempts.map((attempt, index) => {
                    const recovered =
                      isSuccessful(attempt.status) &&
                      attempts.slice(0, index).some((earlier) => isFailure(earlier.status));
                    return (
                      <tr key={`${String(attempt.attempt_number ?? index)}-${index}`}>
                        <td className="px-3 py-2 text-slate-300">
                          {formatCount(attempt.attempt_number ?? index + 1)}
                        </td>
                        <td className="px-3 py-2 text-slate-300">
                          {formatLabel(attempt.operation)}
                        </td>
                        <td className="px-3 py-2 text-slate-300">
                          <p>{formatRawText(attempt.provider)}</p>
                          <p className="mt-0.5 break-all text-slate-500">
                            {formatRawText(attempt.model)}
                          </p>
                        </td>
                        <td className="px-3 py-2">
                          <AttemptStatus status={attempt.status} />
                        </td>
                        <td className="px-3 py-2 text-right text-slate-300">
                          {formatDuration(attempt.duration_ms)}
                        </td>
                        <td className="px-3 py-2 text-right text-slate-300">
                          {formatCount(attempt.api_calls)}
                        </td>
                        <td className="px-3 py-2 text-right text-slate-300">
                          {formatCount(attempt.total_tokens)}
                        </td>
                        <td className="px-3 py-2 text-slate-300">
                          {attempt.failure_reason
                            ? attempt.failure_reason
                            : recovered
                              ? "Fallback succeeded"
                              : "None recorded"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-2 text-xs text-slate-500">Provider attempts are unavailable.</p>
          )}
        </section>

        <section
          aria-labelledby={`fallback-${item.request_id}`}
          className="rounded-lg border border-white/8 bg-black/10 p-3"
        >
          <h3 id={`fallback-${item.request_id}`} className="text-sm font-semibold text-slate-100">
            Failure and fallback
          </h3>
          <p className="mt-1 text-xs text-slate-300">
            {fallbackSucceeded
              ? "A later provider/model attempt succeeded after an earlier failure."
              : failedAttempts.length > 0
                ? "One or more attempts failed and no later successful fallback was recorded."
                : item.outcome === "failure"
                  ? "The query failed, but detailed provider failure telemetry is unavailable."
                  : "No provider failure or fallback was recorded."}
          </p>
          {failedAttempts.length > 0 && (
            <ul className="mt-2 space-y-1 text-xs text-red-200">
              {failedAttempts.map((attempt, index) => (
                <li key={`${String(attempt.attempt_number ?? index)}-failure`}>
                  Attempt {formatCount(attempt.attempt_number ?? index + 1)} ·{" "}
                  {formatRawText(attempt.provider)}: {formatRawText(attempt.failure_reason)}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </details>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/6 bg-black/10 p-2.5">
      <dt className="text-slate-500">{label}</dt>
      <dd className="mt-1 break-words text-sm font-medium text-slate-100">{value}</dd>
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
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${className}`}
    >
      {label}: {state}
    </span>
  );
}

function AttemptStatus({ status }: { status: unknown }) {
  const successful = isSuccessful(status);
  const failed = isFailure(status);
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-1 font-medium ${
        successful
          ? "border-emerald-400/20 bg-emerald-400/8 text-emerald-200"
          : failed
            ? "border-red-400/20 bg-red-400/8 text-red-200"
            : "border-slate-400/20 bg-slate-400/8 text-slate-300"
      }`}
    >
      {formatLabel(status)}
    </span>
  );
}

function isAttempt(value: unknown): value is InternalQueryAttempt {
  return isRecord(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSuccessful(value: unknown): boolean {
  return typeof value === "string" && successStatuses.has(value.toLowerCase());
}

function isFailure(value: unknown): boolean {
  return typeof value === "string" && value.length > 0 && !isSuccessful(value);
}

function formatLabel(value: unknown): string {
  return typeof value === "string" && value ? humanizeKey(value) : "Unavailable";
}

function formatRawText(value: unknown): string {
  return typeof value === "string" && value ? value : "Unavailable";
}

function formatCount(value: unknown): string {
  return typeof value === "number" && Number.isFinite(value)
    ? value.toLocaleString()
    : "Unavailable";
}

function formatDecimal(value: unknown): string {
  return typeof value === "number" && Number.isFinite(value)
    ? value.toLocaleString(undefined, { maximumFractionDigits: 2 })
    : "Unavailable";
}

function formatDuration(value: unknown): string {
  return typeof value === "number" && Number.isFinite(value)
    ? `${value.toLocaleString(undefined, { maximumFractionDigits: 3 })} ms`
    : "Unavailable";
}
