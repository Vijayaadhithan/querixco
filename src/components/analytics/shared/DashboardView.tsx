import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { DashboardActivityOverview } from "./DashboardActivityOverview";
import { DashboardFilters } from "./DashboardFilters";
import { DashboardModule } from "./DashboardModule";
import { SnapshotBadge } from "./SnapshotBadge";
import { CompanyBusinessOverview } from "@/components/analytics/company/CompanyBusinessOverview";
import { formatCompanyName, formatDateTime, humanizeKey } from "@/features/analytics/lib/format";
import { queryDrilldown } from "@/features/analytics/lib/navigation";
import type {
  AnalyticsDashboard,
  AnalyticsModule,
  DashboardFilterValue,
  MetricModulePayload,
  QueryOutcome,
} from "@/features/analytics/model/types";

type Props = {
  dashboard: AnalyticsDashboard;
  company: string;
  audience: "company" | "internal";
  status?: Record<string, unknown>;
  filters: DashboardFilterValue;
  isFetching: boolean;
  stale: boolean;
  view: string;
  onViewChange: (view: string) => void;
  currentHref: string;
  onFiltersChange: (next: DashboardFilterValue) => void;
  onFiltersReset: () => void;
};
export function DashboardView({
  dashboard,
  company,
  audience,
  status,
  filters,
  isFetching,
  stale,
  view,
  onViewChange,
  currentHref,
  onFiltersChange,
  onFiltersReset,
}: Props) {
  const internal = audience === "internal";
  const catalog = view === "catalog";
  const tabs = internal
    ? [
        ["overview", "Overview"],
        ["activity", "Activity breakdowns"],
        ["performance", "Performance & usage"],
      ]
    : [
        ["overview", "Overview"],
        ["activity", "Search insights"],
        ["catalog", "Catalog & reports"],
      ];
  const drill = queryDrilldown(dashboard, company, audience, currentHref);
  const queryHref = (outcome?: QueryOutcome) =>
    stale
      ? undefined
      : queryDrilldown(dashboard, company, audience, currentHref, outcome, {
          textSearchMetric: !internal,
        }).href;
  const applied = dashboard.filtering.applied;
  return (
    <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <header className="analytics-page-heading">
        <div>
          <h1>{formatCompanyName(company)}</h1>
          <p>
            {internal
              ? "Understand request outcomes and investigate performance."
              : "See what customers search for and where discovery falls short."}
          </p>
        </div>
        {internal && (
          <a href="/internal/analytics" className="analytics-secondary-link">
            Switch company <ArrowRight size={15} />
          </a>
        )}
      </header>
      <SnapshotBadge snapshot={dashboard.snapshot} status={status} />
      <nav className="analytics-view-tabs" aria-label="Dashboard sections">
        {tabs.map(([id, label]) => (
          <button key={id} aria-pressed={view === id} onClick={() => onViewChange(id)}>
            {label}
          </button>
        ))}
      </nav>
      {!catalog && (
        <DashboardFilters
          audience={audience}
          value={filters}
          available={dashboard.filtering.available}
          isFetching={isFetching}
          onChange={onFiltersChange}
          onReset={onFiltersReset}
        />
      )}
      {!catalog && stale && (
        <div role="status" className="analytics-selection-notice">
          <strong>
            {isFetching ? "Updating your selection…" : "The new selection could not be loaded."}
          </strong>
          <p>
            Displayed results still cover{" "}
            {applied.from ? formatDateTime(applied.from) : "all recorded time"}
            {applied.to ? ` to ${formatDateTime(applied.to)}` : ""} ·{" "}
            {humanizeKey(applied.request_scope)}
            {applied.outcome ? ` · ${humanizeKey(applied.outcome)}` : ""}.
          </p>
          <p>
            {[
              applied.category,
              applied.language,
              applied.city,
              applied.city_id != null ? `City ID ${applied.city_id}` : null,
              applied.ad_type,
              applied.execution_path,
              applied.provider,
              applied.operation,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
      )}
      {catalog ? (
        <>
          <div className="analytics-selection-notice">
            <strong>Latest company snapshot</strong>
            <p>These company-wide reports are independent of activity dates and filters.</p>
          </div>
          {dashboard.business_overview && (
            <CompanyBusinessOverview overview={dashboard.business_overview} />
          )}
          <SnapshotReports dashboard={dashboard} />
        </>
      ) : (
        <>
          <DashboardActivityOverview
            dashboard={dashboard}
            audience={audience}
            mode={view}
            slowestHref={
              internal && view === "performance" && !stale
                ? queryDrilldown(dashboard, company, audience, currentHref, undefined, {
                    sortBy: "duration",
                  }).href
                : undefined
            }
            queryHref={queryHref}
          />
          {view === "overview" && (
            <div className="analytics-overview-actions">
              {queryHref("zero_result") && (
                <a href={queryHref("zero_result")}>
                  Review searches without results <ArrowRight size={15} />
                </a>
              )}
              {internal && queryHref("failure") && (
                <a href={queryHref("failure")}>
                  Investigate failed requests <ArrowRight size={15} />
                </a>
              )}
              <button onClick={() => onViewChange("activity")}>
                Explore activity breakdowns <ArrowRight size={15} />
              </button>
            </div>
          )}
          {!stale && drill.reason && <p className="analytics-small-note">{drill.reason}</p>}
          {!stale && drill.href && view !== "overview" && (
            <a className="analytics-secondary-link" href={drill.href}>
              Open matching {internal ? "requests" : "search history"}
              <ArrowRight size={15} />
            </a>
          )}
          {!internal && view === "activity" && dashboard.filtered_insights && (
            <div className="mt-8">
              <DashboardModule
                title="Customer demand"
                metrics={dashboard.filtered_insights}
                eyebrow="For the selected activity"
              />
            </div>
          )}
          {internal && view === "performance" && (
            <details className="analytics-snapshot-reports">
              <summary>Additional operational reports · latest snapshot</summary>
              <p className="analytics-small-note">
                These reports use the latest completed snapshot and may have a different reporting
                window from activity filters.
              </p>
              <SnapshotReports dashboard={dashboard} />
            </details>
          )}
        </>
      )}
      {internal && (
        <details className="analytics-technical">
          <summary>Technical report information</summary>
          <p>Snapshot schema: {dashboard.metadata.schema_version}</p>
          <p>Refresh schedule: {dashboard.metadata.refresh_schedule}</p>
        </details>
      )}
    </main>
  );
}
function SnapshotReports({ dashboard }: { dashboard: AnalyticsDashboard }) {
  const groups = new Map<string, { id: string; label: string; metrics: MetricModulePayload }>();
  for (const module of dashboard.metadata.modules) {
    if (module === "individual_queries") continue;
    const metrics = dashboard[module as Exclude<AnalyticsModule, "individual_queries">];
    if (!metrics) continue;
    for (const [id, metric] of Object.entries(metrics)) {
      const definition = dashboard.metadata.metric_definitions?.[id];
      const groupId = definition?.group || module;
      const group = groups.get(groupId) ?? {
        id: groupId,
        label: definition?.group_label || humanizeKey(module),
        metrics: {},
      };
      group.metrics[id] = metric;
      groups.set(groupId, group);
    }
  }
  const reports = [...groups.values()];
  const [selected, setSelected] = useState("");
  const active = reports.find((item) => item.id === selected) ?? reports[0];
  return (
    <section className="mt-8">
      {active ? (
        <>
          <label className="analytics-report-picker">
            Report
            <select value={active.id} onChange={(e) => setSelected(e.target.value)}>
              {reports.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <DashboardModule
            title={active.label}
            metrics={active.metrics}
            definitions={dashboard.metadata.metric_definitions}
          />
        </>
      ) : (
        <p className="analytics-selection-notice">No completed reports are available yet.</p>
      )}
    </section>
  );
}
