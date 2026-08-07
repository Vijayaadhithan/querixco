import { ArrowRight, Search } from "lucide-react";
import { useState } from "react";

import { DashboardActivityOverview } from "./DashboardActivityOverview";
import { DashboardFilters } from "./DashboardFilters";
import { DashboardModule } from "./DashboardModule";
import { SnapshotBadge } from "./SnapshotBadge";
import { formatCompanyName, humanizeKey } from "@/features/analytics/lib/format";
import type {
  AnalyticsDashboard,
  AnalyticsModule,
  DashboardFilterValue,
  MetricModulePayload,
} from "@/features/analytics/model/types";

type DashboardViewProps = {
  dashboard: AnalyticsDashboard;
  company: string;
  audience: "company" | "internal";
  status?: Record<string, unknown>;
  filters: DashboardFilterValue;
  isFetching: boolean;
  onFiltersChange: (next: DashboardFilterValue) => void;
  onFiltersReset: () => void;
};

function modulePayload(
  dashboard: AnalyticsDashboard,
  module: AnalyticsModule,
): MetricModulePayload | undefined {
  if (module === "individual_queries") return undefined;
  return dashboard[module];
}

export function DashboardView({
  dashboard,
  company,
  audience,
  status,
  filters,
  isFetching,
  onFiltersChange,
  onFiltersReset,
}: DashboardViewProps) {
  const analyticsModules = dashboard.metadata.modules.filter(
    (module) => module !== "individual_queries" && Boolean(modulePayload(dashboard, module)),
  );
  const [selectedModule, setSelectedModule] = useState<AnalyticsModule | null>(
    analyticsModules[0] ?? null,
  );
  const activeModule =
    selectedModule && analyticsModules.includes(selectedModule)
      ? selectedModule
      : (analyticsModules[0] ?? null);
  const activePayload = activeModule ? modulePayload(dashboard, activeModule) : undefined;
  const queryHref =
    audience === "internal"
      ? `/internal/analytics/${company}/queries`
      : `/analytics/${company}/queries`;

  return (
    <main className="mx-auto max-w-[1480px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <DashboardHeader dashboard={dashboard} company={company} audience={audience} />

      <DashboardFilters
        audience={audience}
        value={filters}
        available={dashboard.filtering.available}
        isFetching={isFetching}
        onChange={onFiltersChange}
        onReset={onFiltersReset}
      />

      <DashboardActivityOverview dashboard={dashboard} audience={audience} />

      <div className="mt-8">
        <SnapshotBadge snapshot={dashboard.snapshot} status={status} />
      </div>

      <section className="mt-8" aria-labelledby={`${audience}-reports-heading`}>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">
              Daily snapshot
            </p>
            <h2
              id={`${audience}-reports-heading`}
              className="mt-2 text-2xl font-semibold text-white"
            >
              {audience === "internal" ? "Operational reports" : "Marketplace reports"}
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
              Select one report for a focused view. These questions use the latest completed daily
              snapshot and are not affected by the activity filters above.
            </p>
          </div>
          <a
            href={queryHref}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-blue-400/25 bg-blue-400/10 px-4 text-sm font-semibold text-blue-100 transition hover:border-blue-300/40 hover:bg-blue-400/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            Explore {dashboard.metadata.individual_query_count.toLocaleString()} queries
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>

        {activeModule && activePayload ? (
          <>
            <div className="mt-5 flex gap-2 overflow-x-auto pb-2" aria-label="Analytics reports">
              {analyticsModules.map((module) => (
                <button
                  key={module}
                  type="button"
                  onClick={() => setSelectedModule(module)}
                  aria-pressed={module === activeModule}
                  className={`min-h-10 shrink-0 rounded-xl border px-4 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300 ${
                    module === activeModule
                      ? "border-blue-400/30 bg-blue-400/12 text-blue-100"
                      : "border-white/8 bg-white/[0.025] text-slate-400 hover:bg-white/6 hover:text-white"
                  }`}
                >
                  {humanizeKey(module)}
                </button>
              ))}
            </div>
            <div className="mt-3">
              <DashboardModule
                title={humanizeKey(activeModule)}
                metrics={activePayload}
                eyebrow="Daily snapshot questions"
              />
            </div>
          </>
        ) : (
          <p className="mt-5 rounded-2xl border border-dashed border-white/10 p-6 text-sm text-slate-500">
            No daily report is available for this company yet.
          </p>
        )}
      </section>
    </main>
  );
}

function DashboardHeader({
  dashboard,
  company,
  audience,
}: Pick<DashboardViewProps, "dashboard" | "company" | "audience">) {
  return (
    <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
          {audience === "internal" ? "Selected company" : "Private company workspace"}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          {formatCompanyName(company)} analytics
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          {audience === "internal"
            ? "Search reliability, provider usage, and query diagnostics for this company."
            : "Search demand, marketplace supply, and customer activity in one focused view."}
        </p>
      </div>
      <div className="rounded-xl border border-white/8 bg-white/[0.035] px-4 py-2.5 text-sm text-slate-300">
        <span className="text-slate-500">Snapshot schema </span>
        {dashboard.metadata.schema_version}
      </div>
    </div>
  );
}
