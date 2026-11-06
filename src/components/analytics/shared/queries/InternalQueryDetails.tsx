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
  const diagnostics = isRecord(item.diagnostics) ? item.diagnostics : null;
  const appliedFilters = isRecord(item.filters) ? item.filters : {};
  const explicitFilters = isRecord(diagnostics?.explicit_filters)
    ? diagnostics.explicit_filters
    : {};
  const inferredFilters = isRecord(diagnostics?.inferred_filters)
    ? diagnostics.inferred_filters
    : {};
  const candidateFunnel = isRecord(diagnostics?.candidate_funnel)
    ? diagnostics.candidate_funnel
    : {};
  const filterAttribution = isRecord(diagnostics?.filter_attribution)
    ? diagnostics.filter_attribution
    : null;
  const counterfactualCounts = isRecord(filterAttribution?.counterfactual_counts)
    ? filterAttribution.counterfactual_counts
    : {};

  return (
    <details className="group mt-3">
      <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 text-xs font-medium text-workspace-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300">
        Internal diagnostics
        <ChevronDown className="h-3.5 w-3.5 transition group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="mt-3 space-y-5 rounded-md border border-workspace-blue-line bg-workspace-tint p-4">
        <section
          aria-labelledby={`diagnosis-${item.request_id}`}
          className="rounded-md border border-workspace-line bg-black/10 p-4"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-workspace-muted">
            Observed result diagnosis
          </p>
          <h3
            id={`diagnosis-${item.request_id}`}
            className="mt-1 text-base font-semibold text-workspace-ink"
          >
            {formatLabel(diagnostics?.code)}
          </h3>
          <p className="mt-1 text-sm leading-6 text-workspace-body">
            {formatRawText(diagnostics?.explanation)}
          </p>
          {diagnostics?.evidence_complete !== true && (
            <p className="mt-2 text-xs text-workspace-warning">
              Exact per-filter evidence was not recorded for this historical request; the diagnosis
              is limited to the observed outcome, applied filters, and any candidate-stage counts.
            </p>
          )}
        </section>

        <section aria-labelledby={`filters-${item.request_id}`}>
          <h3
            id={`filters-${item.request_id}`}
            className="text-sm font-semibold text-workspace-ink"
          >
            Search and filter context
          </h3>
          <div className="mt-3 grid gap-3 lg:grid-cols-3">
            <FilterContext title="Applied filters" values={appliedFilters} />
            <FilterContext title="Explicit client filters" values={explicitFilters} />
            <FilterContext title="Planner-inferred filters" values={inferredFilters} />
          </div>
          {Array.isArray(diagnostics?.ignored_filter_names) &&
            diagnostics.ignored_filter_names.length > 0 && (
              <p className="mt-3 text-xs text-workspace-muted">
                Overridden or ignored planner filters: {diagnostics.ignored_filter_names.join(", ")}
              </p>
            )}
        </section>

        <section aria-labelledby={`filter-attribution-${item.request_id}`}>
          <h3
            id={`filter-attribution-${item.request_id}`}
            className="text-sm font-semibold text-workspace-ink"
          >
            Why filters returned no results
          </h3>
          {filterAttribution?.evidence_complete === true ? (
            <>
              {Array.isArray(filterAttribution.blocking_filters) &&
              filterAttribution.blocking_filters.length > 0 ? (
                <p className="mt-2 text-xs text-workspace-body">
                  Removing these filter groups recovered candidates:{" "}
                  {filterAttribution.blocking_filters.map(humanizeKey).join(", ")}.
                </p>
              ) : (
                <p className="mt-2 text-xs text-workspace-muted">
                  Removing any one captured filter group did not recover candidates.
                </p>
              )}
              {Object.keys(counterfactualCounts).length > 0 && (
                <dl className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {Object.entries(counterfactualCounts).map(([name, value]) => (
                    <Metric key={name} label={humanizeKey(name)} value={formatCount(value)} />
                  ))}
                </dl>
              )}
            </>
          ) : (
            <p className="mt-2 text-xs text-workspace-muted">
              Per-filter counterfactual counts are unavailable for this request.
            </p>
          )}
        </section>

        <section aria-labelledby={`funnel-${item.request_id}`}>
          <h3 id={`funnel-${item.request_id}`} className="text-sm font-semibold text-workspace-ink">
            Candidate funnel
          </h3>
          {Object.keys(candidateFunnel).length > 0 ? (
            <dl className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {Object.entries(candidateFunnel).map(([name, value]) => (
                <Metric key={name} label={humanizeKey(name)} value={formatCount(value)} />
              ))}
            </dl>
          ) : (
            <p className="mt-2 text-xs text-workspace-muted">
              Candidate-stage counts are unavailable.
            </p>
          )}
        </section>

        <section aria-labelledby={`performance-${item.request_id}`}>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-workspace-muted">
                Total server duration
              </p>
              <p
                id={`performance-${item.request_id}`}
                className="mt-1 text-2xl font-semibold text-workspace-ink"
              >
                {formatDuration(performance?.total_server_duration_ms)}
              </p>
              <p className="mt-1 text-xs text-workspace-muted">
                Authoritative server processing time.
              </p>
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
          <h3 id={`tokens-${item.request_id}`} className="text-sm font-semibold text-workspace-ink">
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
            <h3
              id={`attempts-${item.request_id}`}
              className="text-sm font-semibold text-workspace-ink"
            >
              Provider and model attempts
            </h3>
            <span className="text-xs text-workspace-muted">
              Recorded: {formatCount(performance?.attempt_count)}
            </span>
          </div>
          {attempts.length > 0 ? (
            <div className="mt-2 overflow-x-auto rounded-lg border border-workspace-line">
              <table className="w-full min-w-[900px] text-left text-xs">
                <thead className="bg-black/15 text-workspace-muted">
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
                <tbody className="divide-y divide-workspace-line">
                  {attempts.map((attempt, index) => {
                    const recovered =
                      isSuccessful(attempt.status) &&
                      attempts.slice(0, index).some((earlier) => isFailure(earlier.status));
                    return (
                      <tr key={`${String(attempt.attempt_number ?? index)}-${index}`}>
                        <td className="px-3 py-2 text-workspace-body">
                          {formatCount(attempt.attempt_number ?? index + 1)}
                        </td>
                        <td className="px-3 py-2 text-workspace-body">
                          {formatLabel(attempt.operation)}
                        </td>
                        <td className="px-3 py-2 text-workspace-body">
                          <p>{formatRawText(attempt.provider)}</p>
                          <p className="mt-0.5 break-all text-workspace-muted">
                            {formatRawText(attempt.model)}
                          </p>
                        </td>
                        <td className="px-3 py-2">
                          <AttemptStatus status={attempt.status} />
                        </td>
                        <td className="px-3 py-2 text-right text-workspace-body">
                          {formatDuration(attempt.duration_ms)}
                        </td>
                        <td className="px-3 py-2 text-right text-workspace-body">
                          {formatCount(attempt.api_calls)}
                        </td>
                        <td className="px-3 py-2 text-right text-workspace-body">
                          {formatCount(attempt.total_tokens)}
                        </td>
                        <td className="px-3 py-2 text-workspace-body">
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
            <p className="mt-2 text-xs text-workspace-muted">Provider attempts are unavailable.</p>
          )}
        </section>

        <section
          aria-labelledby={`fallback-${item.request_id}`}
          className="rounded-lg border border-workspace-line bg-black/10 p-3"
        >
          <h3
            id={`fallback-${item.request_id}`}
            className="text-sm font-semibold text-workspace-ink"
          >
            Failure and fallback
          </h3>
          <p className="mt-1 text-xs text-workspace-body">
            {fallbackSucceeded
              ? "A later provider/model attempt succeeded after an earlier failure."
              : failedAttempts.length > 0
                ? "One or more attempts failed and no later successful fallback was recorded."
                : item.outcome === "failure"
                  ? "The query failed, but detailed provider failure telemetry is unavailable."
                  : "No provider failure or fallback was recorded."}
          </p>
          {failedAttempts.length > 0 && (
            <ul className="mt-2 space-y-1 text-xs text-workspace-danger">
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

function FilterContext({ title, values }: { title: string; values: Record<string, unknown> }) {
  const entries = Object.entries(values).filter(([, value]) => value !== null && value !== "");
  return (
    <article className="rounded-lg border border-workspace-line bg-black/10 p-3">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-workspace-muted">
        {title}
      </h4>
      {entries.length > 0 ? (
        <dl className="mt-2 space-y-2">
          {entries.map(([name, value]) => (
            <div key={name} className="flex items-start justify-between gap-3 text-xs">
              <dt className="text-workspace-muted">{humanizeKey(name)}</dt>
              <dd className="max-w-[65%] break-words text-right font-medium text-workspace-ink">
                {formatFilterValue(value)}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="mt-2 text-xs text-workspace-muted">None recorded</p>
      )}
    </article>
  );
}

function formatFilterValue(value: unknown): string {
  if (Array.isArray(value)) return value.map(String).join(", ");
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return "Unavailable";
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-workspace-line bg-black/10 p-2.5">
      <dt className="text-workspace-muted">{label}</dt>
      <dd className="mt-1 break-words text-sm font-medium text-workspace-ink">{value}</dd>
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
          ? "border-workspace-success-line bg-workspace-success-tint text-workspace-success"
          : failed
            ? "border-workspace-danger-line bg-workspace-danger-tint text-workspace-danger"
            : "border-workspace-line bg-workspace-wash text-workspace-body"
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
