import { keepPreviousData, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { PortalState } from "./PortalState";
import { QueryFilters } from "./QueryFilters";
import { QueryTable } from "./QueryTable";
import { getCompanyQueries, getInternalQueries, isAnalyticsApiError } from "@/lib/analytics-api";
import { useUnauthorizedRedirect } from "@/lib/analytics-auth";
import { formatCompanyName } from "@/lib/analytics-format";
import type {
  CompanyQueryRecord,
  InternalQueryRecord,
  QueryFilters as QueryFiltersValue,
  QueryPage,
} from "@/lib/analytics-types";

const emptyFilters: QueryFiltersValue = {
  query: "",
  outcome: "",
  category: "",
  language: "",
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
      language: filters.language.trim(),
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
      lastPage.has_more && lastPage.next_cursor ? lastPage.next_cursor : undefined,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const loginPath = internal ? "/internal/analytics/login" : `/analytics/${company}/login`;
  useUnauthorizedRedirect([history.error], loginPath, queryClient);

  const items = history.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <main className="mx-auto max-w-[1480px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
          {formatCompanyName(company)}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
          Individual query history
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Inspect query outcomes and classifications. Filters reset cursor pagination automatically.
        </p>
      </div>

      <QueryFilters
        value={filters}
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
          <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center">
            <h2 className="text-lg font-semibold text-white">No matching queries</h2>
            <p className="mt-2 text-sm text-slate-400">
              Adjust or reset the filters to broaden the results.
            </p>
          </div>
        ) : (
          <>
            {history.isError && (
              <div
                role="alert"
                className="mb-4 rounded-xl border border-amber-400/20 bg-amber-400/8 px-4 py-3 text-sm text-amber-100"
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
              <p className="text-sm text-slate-400">
                Showing {items.length.toLocaleString()} {items.length === 1 ? "query" : "queries"}
              </p>
              {history.isFetching && !history.isFetchingNextPage && (
                <span className="inline-flex items-center gap-2 text-xs text-slate-500">
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
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300 disabled:cursor-wait disabled:opacity-60"
                >
                  {history.isFetchingNextPage && (
                    <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                  )}
                  {history.isFetchingNextPage ? "Loading…" : "Load more"}
                </button>
              ) : (
                <p className="text-sm text-slate-500">End of results</p>
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
