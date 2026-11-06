import { MetricCardContent } from "./metrics/MetricRenderers";
import { humanizeKey } from "@/features/analytics/lib/format";
import type { MetricDefinition, MetricModulePayload } from "@/features/analytics/model/types";

type DashboardModuleProps = {
  title: string;
  metrics: MetricModulePayload;
  eyebrow?: string;
  definitions?: Record<string, MetricDefinition>;
};

export function DashboardModule({
  title,
  metrics,
  eyebrow = "Analytics module",
  definitions = {},
}: DashboardModuleProps) {
  const entries = Object.entries(metrics);
  const headingId = `module-${title.replaceAll(" ", "-").toLowerCase()}`;

  return (
    <section aria-labelledby={headingId}>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-workspace-blue">
            {eyebrow}
          </p>
          <h2 id={headingId} className="mt-2 text-2xl font-semibold text-workspace-ink">
            {title}
          </h2>
        </div>
        <span className="text-xs text-workspace-muted">
          {entries.length} {entries.length === 1 ? "metric" : "metrics"}
        </span>
      </div>

      {entries.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {entries.map(([metricId, metric]) => {
            const metricTitle = metric.title || humanizeKey(metricId);
            const definition = definitions[metricId];
            return (
              <article
                key={metricId}
                className={`min-w-0 rounded-lg border border-workspace-line bg-workspace-surface p-5 shadow-sm ${
                  metric.chart_type === "comparison_table" ? "md:col-span-2 xl:col-span-3" : ""
                }`}
              >
                <h3 className="text-base font-semibold text-workspace-ink">
                  {definition?.question || metricTitle}
                </h3>
                {definition?.description && (
                  <p className="mt-1 text-xs leading-5 text-workspace-muted">
                    {definition.description}
                  </p>
                )}
                {definition?.available === false ? (
                  <p className="mt-4 rounded-md border border-dashed border-workspace-warning-line p-4 text-sm text-workspace-warning">
                    {definition.unavailable_reason || "Required source data is unavailable."}
                  </p>
                ) : (
                  <MetricCardContent metric={metric} title={metricTitle} />
                )}
                {definition && (
                  <p className="mt-4 border-t border-workspace-line pt-3 text-[11px] text-workspace-muted">
                    Sources: {definition.sources.join(", ").replaceAll("_", " ")} · Latest completed
                    snapshot
                  </p>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-workspace-line p-7 text-sm text-workspace-muted">
          This module has no metrics in the current snapshot.
        </div>
      )}
    </section>
  );
}
