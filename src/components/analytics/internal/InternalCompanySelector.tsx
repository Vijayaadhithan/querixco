import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Database, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { InternalAnalyticsShell } from "./InternalAnalyticsShell";
import { PortalState } from "../shared/PortalState";
import { getInternalCompanies, isAnalyticsApiError } from "@/lib/analytics-api";
import { InternalRouteGuard, useClientReady, useUnauthorizedRedirect } from "@/lib/analytics-auth";
import { formatCompanyName, formatDateTime, humanizeKey } from "@/lib/analytics-format";
import type { AnalyticsSession } from "@/lib/analytics-types";

export function InternalCompanySelector() {
  return (
    <InternalRouteGuard>
      {(session) => <InternalCompanySelectorContent session={session} />}
    </InternalRouteGuard>
  );
}

function InternalCompanySelectorContent({ session }: { session: AnalyticsSession }) {
  const ready = useClientReady();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const inventory = useQuery({
    queryKey: ["analytics", "internal", "companies"],
    queryFn: ({ signal }) => getInternalCompanies(signal),
    enabled: ready,
    staleTime: 60_000,
    retry: false,
    refetchOnWindowFocus: false,
  });
  useUnauthorizedRedirect([inventory.error], "/internal/analytics/login", queryClient);

  const companies = useMemo(() => {
    const needle = search.trim().toLowerCase();
    const items = inventory.data?.companies ?? [];
    return needle
      ? items.filter((item) =>
          `${item.company_id} ${item.endpoint_slug}`.toLowerCase().includes(needle),
        )
      : items;
  }, [inventory.data, search]);

  return (
    <InternalAnalyticsShell username={session.user.username} current="companies">
      <main className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">
              Querix Internal
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
              Select a company
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Open one company analytics workspace at a time. No cross-company metrics are
              aggregated here.
            </p>
          </div>
          {inventory.data && (
            <p className="text-sm text-slate-500">{inventory.data.refresh_schedule}</p>
          )}
        </div>

        <div className="relative mt-7 max-w-md">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-500"
            aria-hidden="true"
          />
          <label htmlFor="company-search" className="sr-only">
            Search companies
          </label>
          <input
            id="company-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search companies"
            className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.035] pr-3 pl-9 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-400/70 focus:ring-3 focus:ring-violet-400/10"
          />
        </div>

        <div className="mt-6">
          {inventory.isPending ? (
            <PortalState
              kind="loading"
              internal
              title="Loading company inventory"
              message="Checking analytics readiness and snapshots."
            />
          ) : inventory.isError && !inventory.data ? (
            <PortalState
              kind={isAnalyticsApiError(inventory.error, 403) ? "forbidden" : "error"}
              internal
              title="Company inventory unavailable"
              message={inventory.error.message}
              action={{ label: "Try again", onClick: () => void inventory.refetch() }}
            />
          ) : companies.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center">
              <h2 className="text-lg font-semibold text-white">No companies found</h2>
              <p className="mt-2 text-sm text-slate-400">
                {search
                  ? "Try a different company search."
                  : "No analytics companies are configured."}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {companies.map((company) => (
                <article
                  key={company.company_id}
                  className="rounded-2xl border border-white/8 bg-white/[0.035] p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold text-white">
                        {formatCompanyName(company.company_id)}
                      </h2>
                      <p className="mt-1 font-mono text-xs text-slate-500">
                        {company.endpoint_slug}
                      </p>
                    </div>
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                        company.has_snapshot
                          ? "border-emerald-400/20 bg-emerald-400/8 text-emerald-200"
                          : "border-amber-400/20 bg-amber-400/8 text-amber-200"
                      }`}
                    >
                      {company.has_snapshot ? "Snapshot ready" : "Snapshot unavailable"}
                    </span>
                  </div>

                  <dl className="mt-5 space-y-3 border-t border-white/8 pt-4 text-sm">
                    <div className="flex items-start justify-between gap-5">
                      <dt className="text-slate-500">Last snapshot</dt>
                      <dd className="text-right text-slate-200">
                        {formatDateTime(company.snapshot?.generated_at)}
                      </dd>
                    </div>
                    <div className="flex items-start justify-between gap-5">
                      <dt className="text-slate-500">Source watermark</dt>
                      <dd className="text-right text-slate-200">
                        {formatDateTime(company.snapshot?.source_watermark)}
                      </dd>
                    </div>
                    <div className="flex items-start justify-between gap-5">
                      <dt className="text-slate-500">Latest run</dt>
                      <dd className="max-w-[60%] text-right text-slate-200">
                        {latestRunLabel(company.latest_run)}
                      </dd>
                    </div>
                  </dl>

                  {company.has_snapshot ? (
                    <a
                      href={`/internal/analytics/${company.endpoint_slug}`}
                      className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl bg-violet-500 px-4 text-sm font-semibold text-white transition hover:bg-violet-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300"
                    >
                      Open workspace
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </a>
                  ) : (
                    <div className="mt-5 flex items-center gap-2 text-sm text-amber-200">
                      <Database className="h-4 w-4" aria-hidden="true" />
                      Waiting for the first snapshot
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </InternalAnalyticsShell>
  );
}

function latestRunLabel(run: Record<string, unknown> | null): string {
  if (!run) return "Not available";
  const status = run.status ?? run.state ?? run.result;
  return typeof status === "string" ? humanizeKey(status) : "Run recorded";
}
