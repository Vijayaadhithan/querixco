import { ArrowRight, BarChart3, Boxes, Globe2, Search } from "lucide-react";
import { useState, type ComponentType } from "react";

import { DashboardModule } from "./DashboardModule";
import { SnapshotBadge } from "./SnapshotBadge";
import { formatCompanyName, formatMetricValue, humanizeKey } from "@/features/analytics/lib/format";
import type {
  AnalyticsDashboard,
  AnalyticsModule,
  MetricModulePayload,
  MetricPayload,
} from "@/features/analytics/model/types";

type DashboardViewProps = {
  dashboard: AnalyticsDashboard;
  company: string;
  audience: "company" | "internal";
  status?: Record<string, unknown>;
};

const moduleIcons: Partial<Record<AnalyticsModule, ComponentType<{ className?: string }>>> = {
  search_intelligence: Search,
  deep_analytics: Boxes,
  market_intelligence: Globe2,
  api_performance: BarChart3,
};

function modulePayload(
  dashboard: AnalyticsDashboard,
  module: AnalyticsModule,
): MetricModulePayload | undefined {
  if (module === "individual_queries") return undefined;
  return dashboard[module];
}

export function DashboardView(props: DashboardViewProps) {
  return props.audience === "company" ? (
    <CompanyDashboardView {...props} audience="company" />
  ) : (
    <InternalDashboardView {...props} audience="internal" />
  );
}

function CompanyDashboardView({ dashboard, company, status }: DashboardViewProps) {
  const queryHref = `/analytics/${company}/queries`;
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

  return (
    <main className="mx-auto max-w-[1480px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <DashboardHeader dashboard={dashboard} company={company} audience="company" compact />

      <section aria-labelledby="company-overview-heading">
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">
              At a glance
            </p>
            <h2 id="company-overview-heading" className="sr-only">
              Company analytics overview
            </h2>
          </div>
          <p className="hidden text-xs text-slate-500 sm:block">
            Select a module to explore its metrics
          </p>
        </div>

        <div className="grid auto-cols-[minmax(280px,86vw)] grid-flow-col gap-3 overflow-x-auto pb-2 sm:grid-flow-row sm:grid-cols-2 sm:overflow-visible sm:pb-0 xl:grid-cols-4">
          <QueryOverviewCard count={dashboard.metadata.individual_query_count} href={queryHref} />
          {analyticsModules.map((module) => {
            const payload = modulePayload(dashboard, module);
            if (!payload) return null;
            return (
              <ModuleOverviewCard
                key={module}
                module={module}
                metrics={payload}
                active={module === activeModule}
                onSelect={() => setSelectedModule(module)}
              />
            );
          })}
        </div>
      </section>

      <div className="mt-4">
        <SnapshotBadge snapshot={dashboard.snapshot} status={status} />
      </div>

      {activeModule && activePayload && (
        <section id="dashboard-details" className="mt-8" aria-label="Detailed analytics">
          <div className="mb-5 flex gap-2 overflow-x-auto pb-1" aria-label="Analytics modules">
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
          <DashboardModule title={humanizeKey(activeModule)} metrics={activePayload} />
        </section>
      )}
    </main>
  );
}

function InternalDashboardView({ dashboard, company, status }: DashboardViewProps) {
  const queryHref = `/internal/analytics/${company}/queries`;

  return (
    <main className="mx-auto max-w-[1480px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <DashboardHeader dashboard={dashboard} company={company} audience="internal" />
      <SnapshotBadge snapshot={dashboard.snapshot} status={status} />

      <div className="mt-10 space-y-12">
        {dashboard.metadata.modules.map((module) => {
          if (module === "individual_queries") {
            return (
              <QueryModuleCard
                key={module}
                count={dashboard.metadata.individual_query_count}
                href={queryHref}
                internal
              />
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

function DashboardHeader({
  dashboard,
  company,
  audience,
  compact = false,
}: Pick<DashboardViewProps, "dashboard" | "company" | "audience"> & { compact?: boolean }) {
  return (
    <div
      className={`flex flex-col justify-between gap-4 lg:flex-row lg:items-end ${compact ? "mb-5" : "mb-7"}`}
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
          {audience === "internal" ? "Selected company" : "Private company workspace"}
        </p>
        <h1
          className={`${compact ? "mt-2 text-3xl" : "mt-3 text-3xl sm:text-4xl"} font-semibold tracking-tight text-white`}
        >
          {formatCompanyName(company)} analytics
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          {audience === "internal"
            ? "Operational API performance and individual query diagnostics for this company."
            : "Search demand, marketplace supply, and customer activity in one view."}
        </p>
      </div>
      <div className="rounded-xl border border-white/8 bg-white/[0.035] px-4 py-2.5 text-sm text-slate-300">
        <span className="text-slate-500">Snapshot schema </span>
        {dashboard.metadata.schema_version}
      </div>
    </div>
  );
}

function QueryOverviewCard({ count, href }: { count: number; href: string }) {
  return (
    <a
      href={href}
      className="group flex min-h-44 snap-start flex-col justify-between rounded-2xl border border-blue-400/25 bg-gradient-to-br from-blue-400/16 to-violet-400/8 p-4 transition hover:border-blue-300/40 hover:from-blue-400/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-400/15 text-blue-200">
          <Search className="h-5 w-5" aria-hidden="true" />
        </div>
        <ArrowRight
          className="h-4 w-4 text-blue-300 transition group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </div>
      <div>
        <p className="text-3xl font-semibold tracking-tight text-white">{count.toLocaleString()}</p>
        <h3 className="mt-1 font-semibold text-slate-100">Individual queries</h3>
        <p className="mt-1 text-xs leading-5 text-slate-400">
          Search, filter, and inspect query outcomes.
        </p>
      </div>
    </a>
  );
}

function ModuleOverviewCard({
  module,
  metrics,
  active,
  onSelect,
}: {
  module: AnalyticsModule;
  metrics: MetricModulePayload;
  active: boolean;
  onSelect: () => void;
}) {
  const Icon = moduleIcons[module] ?? BarChart3;
  const highlights = Object.entries(metrics).slice(0, 2);

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={`min-h-44 snap-start rounded-2xl border p-4 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300 ${
        active
          ? "border-blue-400/30 bg-blue-400/10"
          : "border-white/8 bg-white/[0.035] hover:border-white/15 hover:bg-white/[0.055]"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/6 text-violet-200">
          <Icon className="h-4.5 w-4.5" aria-hidden="true" />
        </div>
        <span className="text-[11px] uppercase tracking-wide text-slate-500">
          {Object.keys(metrics).length} metrics
        </span>
      </div>
      <h3 className="mt-3 font-semibold text-slate-100">{humanizeKey(module)}</h3>
      <div className="mt-2 space-y-1.5">
        {highlights.map(([metricId, metric]) => (
          <div key={metricId} className="flex items-center justify-between gap-3 text-xs">
            <span className="min-w-0 truncate text-slate-500">
              {metric.title || humanizeKey(metricId)}
            </span>
            <span className="shrink-0 font-medium text-slate-300">{metricPreview(metric)}</span>
          </div>
        ))}
      </div>
    </button>
  );
}

function metricPreview(metric: MetricPayload): string {
  const primitive = Object.entries(metric).find(
    ([key, value]) =>
      !["title", "chart_type"].includes(key) &&
      (typeof value === "number" || typeof value === "string" || typeof value === "boolean"),
  );
  if (primitive) return formatMetricValue(primitive[1], primitive[0]);

  if (Array.isArray(metric.labels) && Array.isArray(metric.values) && metric.values.length > 0) {
    return formatMetricValue(metric.values[0]);
  }

  const list = Object.values(metric).find(Array.isArray);
  return list ? `${list.length.toLocaleString()} items` : "View";
}

function QueryModuleCard({
  count,
  href,
  internal = false,
}: {
  count: number;
  href: string;
  internal?: boolean;
}) {
  return (
    <section
      className="overflow-hidden rounded-2xl border border-blue-400/15 bg-gradient-to-br from-blue-400/10 to-violet-400/8 p-6"
      aria-labelledby="individual-queries-heading"
    >
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div className="flex gap-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-400/12 text-blue-300">
            <Search className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 id="individual-queries-heading" className="text-xl font-semibold text-white">
              Individual queries
            </h2>
            <p className="mt-1 text-sm text-slate-300">
              {count.toLocaleString()} queries in this snapshot. Filter by outcome,{" "}
              {internal ? "execution path" : "classification"}, language, or date.
            </p>
          </div>
        </div>
        <a
          href={href}
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 text-sm font-semibold text-white transition hover:bg-blue-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
        >
          Explore queries
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
