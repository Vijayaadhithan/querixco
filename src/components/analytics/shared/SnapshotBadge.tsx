import { Clock3 } from "lucide-react";
import { formatDateTime } from "@/features/analytics/lib/format";
import type { SnapshotSummary } from "@/features/analytics/model/types";
export function SnapshotBadge({
  snapshot,
  status,
}: {
  snapshot: SnapshotSummary;
  status?: Record<string, unknown>;
}) {
  return (
    <aside className="analytics-freshness" aria-label="Report freshness">
      <Clock3 size={15} aria-hidden="true" />
      <span>
        Report generated <strong>{formatDateTime(snapshot.generated_at)}</strong>
      </span>
      <span>
        Data through{" "}
        <strong>
          {snapshot.source_watermark ? formatDateTime(snapshot.source_watermark) : "Not reported"}
        </strong>
      </span>
      <details>
        <summary>Refresh details</summary>
        <p>{snapshot.refresh_schedule}</p>
        {typeof status?.status === "string" && <p>{status.status}</p>}
        <p>Report freshness does not indicate live service health.</p>
      </details>
    </aside>
  );
}
