import { ArrowRight, Search } from "lucide-react";

import { DashboardModule } from "./DashboardModule";
import { SnapshotBadge } from "./SnapshotBadge";
import { formatCompanyName, humanizeKey } from "@/features/analytics/lib/format";
import type {
  AnalyticsDashboard,
  AnalyticsModule,
  MetricModulePayload,
} from "@/features/analytics/model/types";

type DashboardViewProps = {
  dashboard: AnalyticsDashboard;
  company: string;
  audience: "company" | "internal";
  status?: Record<string, unknown>;
};

function modulePayload(
  dashboard: AnalyticsDashboard,
  module: AnalyticsModule,
): MetricModulePayload | undefined {
  if (module === "individual_queries") return undefined;
  return dashboard[module];
}

export function DashboardView({ dashboard, company, audience, status }: DashboardViewProps) {
  const modules = dashboard.metadata.modules.filter(
    (module) => audience === "internal" || module !== "api_performance",
  );
  const queryHref =
    audience === "internal"
      ? `/internal/analytics/${company}/queries`
      : `/analytics/${company}/queries`;

  return (
    <main className="mx-auto max-w-[1480px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
            {audience === "internal" ? "Selected company" : "Private company workspace"}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {formatCompanyName(company)} analytics
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Snapshot-based search and market intelligence for this company workspace.
          </p>
        </div>
        <div className="rounded-xl border border-white/8 bg-white/[0.035] px-4 py-3 text-sm text-slate-300">
          <span className="text-slate-500">Snapshot schema </span>
          {dashboard.metadata.schema_version}
        </div>
      </div>

      <SnapshotBadge snapshot={dashboard.snapshot} status={status} />

      <div className="mt-10 space-y-12">
        {modules.map((module) => {
          if (module === "individual_queries") {
            return (
              <section
                key={module}
                className="overflow-hidden rounded-2xl border border-blue-400/15 bg-gradient-to-br from-blue-400/10 to-violet-400/8 p-6"
                aria-labelledby="individual-queries-heading"
              >
                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                  <div className="flex gap-4">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-400/12 text-blue-300">
                      <Search className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <h2
                        id="individual-queries-heading"
                        className="text-xl font-semibold text-white"
                      >
                        Individual queries
                      </h2>
                      <p className="mt-1 text-sm text-slate-300">
                        {dashboard.metadata.individual_query_count.toLocaleString()} queries in this
                        snapshot. Filter by outcome, classification, language, or date.
                      </p>
                    </div>
                  </div>
                  <a
                    href={queryHref}
                    className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 text-sm font-semibold text-white transition hover:bg-blue-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
                  >
                    Explore queries
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                </div>
              </section>
            );
          }

          const payload = modulePayload(dashboard, module);
          if (!payload) return null;
          return <DashboardModule key={module} title={humanizeKey(module)} metrics={payload} />;
        })}
      </div>
    </main>
  );
}
