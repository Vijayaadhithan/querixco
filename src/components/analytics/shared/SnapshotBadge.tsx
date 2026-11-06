import { Clock3, Database } from "lucide-react";

import { formatDateTime } from "@/features/analytics/lib/format";
import type { SnapshotSummary } from "@/features/analytics/model/types";

export function SnapshotBadge({
  snapshot,
  status,
}: {
  snapshot: SnapshotSummary;
  status?: Record<string, unknown>;
}) {
  const statusLabel = typeof status?.status === "string" ? status.status : "Snapshot available";

  return (
    <aside className="grid gap-3 rounded-lg border border-workspace-line bg-workspace-surface p-4 sm:grid-cols-3">
      <div className="flex gap-3">
        <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-workspace-blue" aria-hidden="true" />
        <div>
          <p className="text-xs uppercase tracking-wide text-workspace-muted">Generated</p>
          <p className="mt-1 text-sm text-workspace-ink">{formatDateTime(snapshot.generated_at)}</p>
        </div>
      </div>
      <div className="flex gap-3">
        <Database className="mt-0.5 h-4 w-4 shrink-0 text-workspace-blue" aria-hidden="true" />
        <div>
          <p className="text-xs uppercase tracking-wide text-workspace-muted">Source watermark</p>
          <p className="mt-1 text-sm text-workspace-ink">
            {formatDateTime(snapshot.source_watermark)}
          </p>
        </div>
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-workspace-muted">{statusLabel}</p>
        <p className="mt-1 text-sm text-workspace-ink">{snapshot.refresh_schedule}</p>
      </div>
    </aside>
  );
}
