import { MetricCardContent } from "./metrics/MetricRenderers";
import { humanizeKey } from "@/features/analytics/lib/format";
import type { MetricModulePayload } from "@/features/analytics/model/types";

type DashboardModuleProps = {
  title: string;
  metrics: MetricModulePayload;
};

export function DashboardModule({ title, metrics }: DashboardModuleProps) {
  const entries = Object.entries(metrics);
  const headingId = `module-${title.replaceAll(" ", "-").toLowerCase()}`;

  return (
    <section aria-labelledby={headingId}>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">
            Analytics module
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
            return (
              <article
                key={metricId}
                className="min-w-0 rounded-2xl border border-white/8 bg-white/[0.035] p-5 shadow-[0_18px_50px_-32px_rgba(0,0,0,.9)]"
              >
                <h3 className="text-base font-semibold text-slate-100">{metricTitle}</h3>
                <MetricCardContent metric={metric} title={metricTitle} />
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
