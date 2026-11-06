import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { PortalState } from "./PortalState";
import { QueryFilters } from "./QueryFilters";
import { QueryTable } from "./QueryTable";
import {
  getCompanyQueries,
  getInternalQueries,
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

const emptyFilters: QueryFiltersValue = {
  sortBy: "created_at",
  sortDirection: "desc",
  query: "",
  outcome: "",
  category: "",
  executionPath: "",
  language: "",
  includeFilteredResults: false,
  requestKind: "",
  cityId: "",
  subcategoryId: "",
  adType: "",
  diagnosticCode: "",
  hasFilters: false,
  from: "",
  to: "",
};

type QueryRecord = CompanyQueryRecord | InternalQueryRecord;

export function QueryHistory({
  company,
  audience,
}: {
  company: string;
  audience: "company" | "internal";
}) {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<QueryFiltersValue>(emptyFilters);
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

  const history = useInfiniteQuery<QueryPage<QueryRecord>, Error>({
    queryKey: [
      "analytics",
      internal ? "internal" : "company",
      company,
      "queries",
      normalizedFilters,
    ],
    initialPageParam: null as string | null,
    queryFn: ({ pageParam, signal }) => {
      const cursor = typeof pageParam === "string" ? pageParam : null;
      return internal
        ? getInternalQueries(company, normalizedFilters, cursor, signal)
        : getCompanyQueries(company, normalizedFilters, cursor, signal);
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
  useUnauthorizedRedirect([history.error], audience, loginPath, queryClient);
  const companyMismatch =
    history.error instanceof AnalyticsCompanyMismatchError ||
    !queryPagesMatchCompany(history.data, company);

  const items = useMemo(
    () =>
      companyMismatch
        ? []
        : (history.data?.pages.flatMap((page) => (Array.isArray(page?.items) ? page.items : [])) ??
          []),
    [companyMismatch, history.data],
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
  const facets = history.data?.pages[0]?.facets;

  return (
    <main className="mx-auto max-w-[1480px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-workspace-blue">
          {formatCompanyName(company)}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-workspace-ink">
          Individual query history
        </h1>
        <p className="mt-2 text-sm leading-6 text-workspace-muted">
          {internal
            ? "Inspect API outcomes, execution paths, and operational diagnostics."
            : "Inspect query outcomes and classifications."}{" "}
          Filters reset cursor pagination automatically.
        </p>
      </div>

      <QueryFilters
        audience={audience}
        value={filters}
        classificationOptions={classificationOptions}
        executionPathOptions={executionPathOptions}
        languageOptions={languageOptions}
        facets={facets}
        onChange={setFilters}
        onReset={() => setFilters(emptyFilters)}
      />

      <div className="mt-6" aria-live="polite">
        {history.isPending ? (
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
        ) : history.isError && !history.data ? (
          <PortalState
            kind="error"
            title={
              isAnalyticsApiError(history.error, 403)
                ? "Access denied"
                : isAnalyticsApiError(history.error, 404)
                  ? "Company not found"
                  : "Query history unavailable"
            }
            message={history.error.message}
            internal={internal}
            action={{ label: "Try again", onClick: () => void history.refetch() }}
          />
        ) : items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-workspace-line p-10 text-center">
            <h2 className="text-lg font-semibold text-workspace-ink">No matching queries</h2>
            <p className="mt-2 text-sm text-workspace-muted">
              Adjust or reset the filters to broaden the results.
            </p>
          </div>
        ) : (
          <>
            {history.isError && (
              <div
                role="alert"
                className="mb-4 rounded-md border border-workspace-warning-line bg-workspace-warning-tint px-4 py-3 text-sm text-workspace-warning"
              >
                Existing results are still available, but the latest request failed.{" "}
                <button
                  type="button"
                  onClick={() => void history.refetch()}
                  className="font-semibold underline underline-offset-2"
                >
                  Retry
                </button>
              </div>
            )}
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
                  disabled={history.isFetchingNextPage}
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
