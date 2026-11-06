import { ArrowRight, Search } from "lucide-react";
import { useState } from "react";

import { DashboardActivityOverview } from "./DashboardActivityOverview";
import { DashboardFilters } from "./DashboardFilters";
import { DashboardModule } from "./DashboardModule";
import { SnapshotBadge } from "./SnapshotBadge";
import { CompanyBusinessOverview } from "@/components/analytics/company/CompanyBusinessOverview";
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
  const reportGroups = groupedReports(dashboard, analyticsModules);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(reportGroups[0]?.id ?? null);
  const activeGroup = reportGroups.find((group) => group.id === selectedGroup) ?? reportGroups[0];
  const queryHref =
    audience === "internal"
      ? `/internal/analytics/${company}/queries`
      : `/analytics/${company}/queries`;

  return (
    <main className="mx-auto max-w-[1480px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <DashboardHeader dashboard={dashboard} company={company} audience={audience} />

      {audience === "company" && dashboard.business_overview && (
        <CompanyBusinessOverview overview={dashboard.business_overview} />
      )}

      <DashboardFilters
        audience={audience}
        value={filters}
        available={dashboard.filtering.available}
        isFetching={isFetching}
        onChange={onFiltersChange}
        onReset={onFiltersReset}
      />

      <DashboardActivityOverview dashboard={dashboard} audience={audience} />

      {audience === "company" && dashboard.filtered_insights && (
        <div className="mt-8">
          <DashboardModule
            title="Demand for current selection"
            metrics={dashboard.filtered_insights}
            eyebrow="Matches activity filters"
          />
        </div>
      )}

      <div className="mt-8">
        <SnapshotBadge snapshot={dashboard.snapshot} status={status} />
      </div>

      <section className="mt-8" aria-labelledby={`${audience}-reports-heading`}>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-workspace-blue">
              Latest snapshot
            </p>
            <h2
              id={`${audience}-reports-heading`}
              className="mt-2 text-2xl font-semibold text-workspace-ink"
            >
              {audience === "internal" ? "Operational reports" : "Marketplace reports"}
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-workspace-muted">
              Choose a business area for a focused, question-led view. These company-wide inventory
              reports use the latest completed snapshot; the filtered demand section above follows
              your activity filters.
            </p>
          </div>
          <a
            href={queryHref}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-md border border-workspace-blue-line bg-workspace-tint px-4 text-sm font-semibold text-workspace-blue transition hover:border-workspace-blue-line hover:bg-workspace-tint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            Explore {dashboard.metadata.individual_query_count.toLocaleString()} queries
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>

        {activeGroup ? (
          <>
            <div className="mt-5 flex gap-2 overflow-x-auto pb-2" aria-label="Analytics reports">
              {reportGroups.map((group) => (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => setSelectedGroup(group.id)}
                  aria-pressed={group.id === activeGroup.id}
                  className={`min-h-10 shrink-0 rounded-md border px-4 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300 ${
                    group.id === activeGroup.id
                      ? "border-workspace-blue-line bg-workspace-tint text-workspace-blue"
                      : "border-workspace-line bg-workspace-surface text-workspace-muted hover:bg-workspace-wash hover:text-workspace-blue"
                  }`}
                >
                  {group.label}
                </button>
              ))}
            </div>
            <div className="mt-3">
              <DashboardModule
                title={activeGroup.label}
                metrics={activeGroup.metrics}
                eyebrow={audience === "company" ? "Business questions" : "Operational questions"}
                definitions={dashboard.metadata.metric_definitions}
              />
            </div>
          </>
        ) : (
          <p className="mt-5 rounded-lg border border-dashed border-workspace-line p-6 text-sm text-workspace-muted">
            No completed report is available for this company yet.
          </p>
        )}
      </section>
    </main>
  );
}

function groupedReports(
  dashboard: AnalyticsDashboard,
  modules: AnalyticsModule[],
): Array<{ id: string; label: string; metrics: MetricModulePayload }> {
  const definitions = dashboard.metadata.metric_definitions ?? {};
  const groups = new Map<string, { id: string; label: string; metrics: MetricModulePayload }>();
  for (const module of modules) {
    const payload = modulePayload(dashboard, module);
    if (!payload) continue;
    for (const [metricId, metric] of Object.entries(payload)) {
      const definition = definitions[metricId];
      const id = definition?.group || module;
      const label = definition?.group_label || humanizeKey(module);
      const group = groups.get(id) ?? { id, label, metrics: {} };
      group.metrics[metricId] = metric;
      groups.set(id, group);
    }
  }
  return Array.from(groups.values());
}

function DashboardHeader({
  dashboard,
  company,
  audience,
}: Pick<DashboardViewProps, "dashboard" | "company" | "audience">) {
  return (
    <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-workspace-blue">
          {audience === "internal" ? "Selected company" : "Private company workspace"}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-workspace-ink sm:text-4xl">
          {formatCompanyName(company)} analytics
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-workspace-muted">
          {audience === "internal"
            ? "Search reliability, provider usage, and query diagnostics for this company."
            : "Search demand, marketplace supply, and customer activity in one focused view."}
        </p>
      </div>
      <div className="rounded-md border border-workspace-line bg-workspace-surface px-4 py-2.5 text-sm text-workspace-body">
        <span className="text-workspace-muted">Snapshot schema </span>
        {dashboard.metadata.schema_version}
      </div>
    </div>
  );
}
