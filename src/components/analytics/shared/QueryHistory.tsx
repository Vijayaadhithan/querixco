import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAnalyticsLocation } from "@/features/analytics/lib/use-analytics-location";
import { useRetainedResult } from "@/features/analytics/lib/use-retained-result";
import {
  emptyQueryFilters,
  queryDateRange,
  safeDashboardReturn,
} from "@/features/analytics/lib/navigation";

import { PortalState } from "./PortalState";
import { QueryFilters } from "./QueryFilters";
import { QueryTable } from "./QueryTable";
import {
  getCompanyQueries,
  getInternalQueries,
  getInternalQueryFacets,
  isAnalyticsApiError,
} from "@/features/analytics/api";
import { useUnauthorizedRedirect } from "@/features/analytics/auth/session";
import { formatCompanyName } from "@/features/analytics/lib/format";
import {
  AnalyticsCompanyMismatchError,
  queryPagesMatchCompany,
  retainMatchingCompanyData,
} from "@/features/analytics/lib/query-isolation";
import type {
  CompanyQueryRecord,
  InternalQueryRecord,
  QueryFilters as QueryFiltersValue,
  QueryPage,
} from "@/features/analytics/model/types";

type QueryRecord = CompanyQueryRecord | InternalQueryRecord;

export function QueryHistory({
  company,
  audience,
}: {
  company: string;
  audience: "company" | "internal";
}) {
  const queryClient = useQueryClient();
  const location = useAnalyticsLocation(audience);
  const filters = location.queryFilters;
  const setFilters = (next: QueryFiltersValue) =>
    location.update(next, next.query !== filters.query);
  const debouncedQuery = useDebouncedValue(filters.query, 300);
  const normalizedFilters = useMemo(
    () => ({
      ...filters,
      query: debouncedQuery.trim(),
      category: filters.category.trim(),
      executionPath: filters.executionPath.trim(),
      language: filters.language.trim(),
      requestKind: filters.requestKind.trim(),
      cityId: filters.cityId.trim(),
      subcategoryId: filters.subcategoryId.trim(),
      adType: filters.adType.trim(),
      diagnosticCode: filters.diagnosticCode.trim(),
    }),
    [debouncedQuery, filters],
  );
  const internal = audience === "internal";

  const [loadChoices, setLoadChoices] = useState(false);
  const choices = useQuery({
    queryKey: ["analytics", audience, company, "query-facets"],
    enabled: internal && loadChoices,
    queryFn: ({ signal }) => getInternalQueryFacets(company, signal),
    staleTime: 300_000,
    retry: false,
  });
  const history = useInfiniteQuery<
    QueryPage<QueryRecord> & { selection: QueryFiltersValue },
    Error
  >({
    queryKey: [
      "analytics",
      internal ? "internal" : "company",
      company,
      "queries",
      normalizedFilters,
    ],
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam, signal }) => {
      const cursor = typeof pageParam === "string" ? pageParam : null;
      const page = await (internal
        ? getInternalQueries(company, normalizedFilters, cursor, signal)
        : getCompanyQueries(company, normalizedFilters, cursor, signal));
      return { ...page, selection: normalizedFilters };
    },
    getNextPageParam: (lastPage) =>
      lastPage?.has_more && typeof lastPage.next_cursor === "string"
        ? lastPage.next_cursor
        : undefined,
    staleTime: 60_000,
    placeholderData: retainMatchingCompanyData(company),
    retry: false,
    refetchOnWindowFocus: false,
  });

  const loginPath = internal ? "/internal/analytics/login" : `/analytics/${company}/login`;
  useUnauthorizedRedirect([history.error, choices.error], audience, loginPath, queryClient);
  const displayed = useRetainedResult(
    history.data,
    history.isPlaceholderData,
    `${audience}:${company}`,
  );
  const previousSelection = displayed?.pages[0]?.selection;
  const stale =
    Boolean(displayed) &&
    (history.isPlaceholderData ||
      history.isError ||
      JSON.stringify(previousSelection) !== JSON.stringify(normalizedFilters) ||
      filters.query !== debouncedQuery);
  const companyMismatch =
    history.error instanceof AnalyticsCompanyMismatchError ||
    !queryPagesMatchCompany(displayed, company);

  const items = useMemo(
    () =>
      companyMismatch
        ? []
        : (displayed?.pages.flatMap((page) => (Array.isArray(page?.items) ? page.items : [])) ??
          []),
    [companyMismatch, displayed],
  );
  const classificationOptions = useMemo(
    () =>
      Array.from(
        new Set(
          items.flatMap((item) =>
            Array.isArray(item.categories)
              ? item.categories.filter(
                  (category): category is string => typeof category === "string",
                )
              : [],
          ),
        ),
      ).sort((left, right) => left.localeCompare(right)),
    [items],
  );
  const executionPathOptions = useMemo(
    () =>
      Array.from(
        new Set(
          items.flatMap((item) => {
            if (!("performance" in item)) return [];
            const path = item.performance?.execution_path;
            return typeof path === "string" && path && path !== "missing" ? [path] : [];
          }),
        ),
      ).sort((left, right) => left.localeCompare(right)),
    [items],
  );
  const languageOptions = useMemo(
    () =>
      Array.from(
        new Set(
          items.flatMap((item) =>
            typeof item.language === "string" && item.language ? [item.language] : [],
          ),
        ),
      ).sort((left, right) => left.localeCompare(right)),
    [items],
  );
  const facets = internal ? choices.data : displayed?.pages[0]?.facets;
  const back = safeDashboardReturn(location.search, company, audience);
  const view = new URL(back, "https://querix.co").searchParams.get("view");
  const backLabel =
    view === "performance"
      ? "Performance & usage"
      : view === "activity"
        ? internal
          ? "Activity breakdowns"
          : "Search insights"
        : view === "catalog"
          ? "Catalog & reports"
          : "Overview";
  const timedOut =
    history.error?.name === "TimeoutError" ||
    /timed? ?out|timeout/i.test(history.error?.message ?? "") ||
    isAnalyticsApiError(history.error, 504);
  const shorter = queryDateRange(filters, 7);
  const sevenDays =
    timedOut && (shorter.from !== filters.from || shorter.to !== filters.to)
      ? { label: "Try last 7 days", onClick: () => setFilters(shorter) }
      : undefined;

  return (
    <main className="mx-auto max-w-[1480px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <a className="analytics-secondary-link mb-5" href={back}>
        ← Back to {backLabel}
      </a>
      <div className="mb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-workspace-blue">
          {formatCompanyName(company)}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-workspace-ink">
          {internal ? "Requests" : "Search history"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-workspace-muted">
          {internal
            ? "Inspect API outcomes, execution paths, and operational diagnostics."
            : "Inspect query outcomes and classifications."}{" "}
          Open a record for context and details.
        </p>
      </div>

      <QueryFilters
        audience={audience}
        value={filters}
        classificationOptions={classificationOptions}
        executionPathOptions={executionPathOptions}
        languageOptions={languageOptions}
        facets={facets}
        onOpenAdvanced={() => setLoadChoices(true)}
        facetStatus={
          internal &&
          (choices.isFetching ? (
            <p role="status">Loading filter choices…</p>
          ) : choices.isError ? (
            <p role="alert">
              Filter choices could not be loaded.{" "}
              <button onClick={() => void choices.refetch()}>Retry filter choices</button>
            </p>
          ) : null)
        }
        onChange={setFilters}
        onReset={() => setFilters(emptyQueryFilters)}
      />

      {stale && previousSelection && (
        <div role="status" className="analytics-selection-notice">
          <strong>
            {history.isFetching
              ? "Updating results…"
              : "Showing the previous successful selection."}
          </strong>
          <p>The rows below still use: {selectionLabel(previousSelection)}.</p>
        </div>
      )}
      {history.isError && displayed && !companyMismatch && (
        <div
          role="alert"
          className="mb-4 rounded-md border border-workspace-warning-line bg-workspace-warning-tint px-4 py-3 text-sm text-workspace-warning"
        >
          {timedOut
            ? "Loading the selected requests took too long. Your previous results are still visible."
            : "Existing results are still available, but the latest request failed."}{" "}
          <button
            type="button"
            onClick={() => void history.refetch()}
            className="font-semibold underline underline-offset-2"
          >
            Retry
          </button>{" "}
          {sevenDays && (
            <button className="ml-3 underline" onClick={sevenDays.onClick}>
              {sevenDays.label}
            </button>
          )}
        </div>
      )}
      <div className="mt-6" aria-live="polite">
        {history.isPending && !displayed ? (
          <PortalState
            kind="loading"
            title="Loading query history"
            message="Retrieving the first page of private query data."
            internal={internal}
          />
        ) : companyMismatch ? (
          <PortalState
            kind="forbidden"
            title="Workspace mismatch"
            message="The query response did not match the selected company workspace."
            internal={internal}
          />
        ) : history.isError && !displayed ? (
          <PortalState
            kind="error"
            title={
              isAnalyticsApiError(history.error, 403)
                ? "Access denied"
                : isAnalyticsApiError(history.error, 404)
                  ? "Company not found"
                  : "Query history unavailable"
            }
            message={
              timedOut
                ? "Loading requests for this selection took too long. Your filters are still applied."
                : history.error.message
            }
            secondaryAction={sevenDays}
            internal={internal}
            action={{ label: "Retry", onClick: () => void history.refetch() }}
          />
        ) : items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-workspace-line p-10 text-center">
            <h2 className="text-lg font-semibold text-workspace-ink">No matching queries</h2>
            <p className="mt-2 text-sm text-workspace-muted">
              Adjust or reset the filters to broaden the results.
            </p>
            <button
              className="analytics-secondary-link mt-4"
              onClick={() => setFilters(emptyQueryFilters)}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm text-workspace-muted">
                Showing {items.length.toLocaleString()} {items.length === 1 ? "query" : "queries"}
              </p>
              {history.isFetching && !history.isFetchingNextPage && (
                <span className="inline-flex items-center gap-2 text-xs text-workspace-muted">
                  <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                  Updating
                </span>
              )}
            </div>
            <QueryTable items={items} internal={internal} />
            <div className="mt-6 text-center">
              {history.hasNextPage ? (
                <button
                  type="button"
                  disabled={history.isFetching || stale}
                  onClick={() => void history.fetchNextPage()}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-workspace-line bg-workspace-wash px-5 text-sm font-semibold text-workspace-ink transition hover:bg-workspace-wash focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300 disabled:cursor-wait disabled:opacity-60"
                >
                  {history.isFetchingNextPage && (
                    <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                  )}
                  {history.isFetchingNextPage ? "Loading…" : "Load more"}
                </button>
              ) : (
                <p className="text-sm text-workspace-muted">End of results</p>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function useDebouncedValue(value: string, delay: number): string {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [delay, value]);

  return debounced;
}

function selectionLabel(value: QueryFiltersValue) {
  const labels: Record<string, string> = {
    sortBy: "Sort",
    sortDirection: "Order",
    query: "Text",
    outcome: "Outcome",
    category: "Category",
    executionPath: "Path",
    language: "Language",
    includeFilteredResults: "Include browsing",
    requestKind: "Request type",
    cityId: "City ID",
    subcategoryId: "Subcategory ID",
    adType: "Listing type",
    diagnosticCode: "Diagnosis",
    hasFilters: "Applied filters",
    from: "From",
    to: "To",
    exactFrom: "From",
    exactTo: "To",
  };
  return Object.entries(value)
    .filter(([, v]) => v !== "" && v !== false && v != null)
    .map(([k, v]) => `${labels[k] ?? k}: ${v === true ? "yes" : v}`)
    .join(" · ");
}
