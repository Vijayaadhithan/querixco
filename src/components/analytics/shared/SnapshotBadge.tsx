import { Clock3, Database } from "lucide-react";

import { formatDateTime } from "@/lib/analytics-format";
import type { SnapshotSummary } from "@/lib/analytics-types";

export function SnapshotBadge({
  snapshot,
  status,
}: {
  snapshot: SnapshotSummary;
  status?: Record<string, unknown>;
}) {
  const statusLabel = typeof status?.status === "string" ? status.status : "Snapshot available";

  return (
    <aside className="grid gap-3 rounded-2xl border border-white/8 bg-white/[0.035] p-4 sm:grid-cols-3">
      <div className="flex gap-3">
        <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-blue-300" aria-hidden="true" />
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Generated</p>
          <p className="mt-1 text-sm text-slate-200">{formatDateTime(snapshot.generated_at)}</p>
        </div>
      </div>
      <div className="flex gap-3">
        <Database className="mt-0.5 h-4 w-4 shrink-0 text-violet-300" aria-hidden="true" />
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Source watermark</p>
          <p className="mt-1 text-sm text-slate-200">{formatDateTime(snapshot.source_watermark)}</p>
        </div>
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">{statusLabel}</p>
        <p className="mt-1 text-sm text-slate-200">{snapshot.refresh_schedule}</p>
      </div>
    </aside>
  );
}
