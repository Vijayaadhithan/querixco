import { InternalAnalyticsShell } from "./InternalAnalyticsShell";
import { QueryHistory } from "../shared/QueryHistory";
import { InternalRouteGuard } from "@/components/analytics/shared/RouteGuards";

export function InternalQueries({ company }: { company: string }) {
  return (
    <InternalRouteGuard>
      {(session) => (
        <InternalAnalyticsShell
          company={company}
          username={session.user.username}
          current="queries"
        >
          <QueryHistory company={company} audience="internal" />
        </InternalAnalyticsShell>
      )}
    </InternalRouteGuard>
  );
}
