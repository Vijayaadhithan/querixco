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
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">
            {eyebrow}
          </p>
          <h2 id={headingId} className="mt-2 text-2xl font-semibold text-white">
            {title}
          </h2>
        </div>
        <span className="text-xs text-slate-500">
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
                className={`min-w-0 rounded-2xl border border-white/8 bg-white/[0.035] p-5 shadow-[0_18px_50px_-32px_rgba(0,0,0,.9)] ${
                  metric.chart_type === "comparison_table" ? "md:col-span-2 xl:col-span-3" : ""
                }`}
              >
                <h3 className="text-base font-semibold text-slate-100">
                  {definition?.question || metricTitle}
                </h3>
                {definition?.description && (
                  <p className="mt-1 text-xs leading-5 text-slate-500">{definition.description}</p>
                )}
                {definition?.available === false ? (
                  <p className="mt-4 rounded-xl border border-dashed border-amber-400/20 p-4 text-sm text-amber-100">
                    {definition.unavailable_reason || "Required source data is unavailable."}
                  </p>
                ) : (
                  <MetricCardContent metric={metric} title={metricTitle} />
                )}
                {definition && (
                  <p className="mt-4 border-t border-white/6 pt-3 text-[11px] text-slate-600">
                    Sources: {definition.sources.join(", ").replaceAll("_", " ")} · Latest completed
                    snapshot
                  </p>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/10 p-7 text-sm text-slate-400">
          This module has no metrics in the current snapshot.
        </div>
      )}
    </section>
  );
}
