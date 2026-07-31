import { CompanyAnalyticsShell } from "./CompanyAnalyticsShell";
import { QueryHistory } from "../shared/QueryHistory";
import { CompanyRouteGuard } from "@/components/analytics/shared/RouteGuards";

export function CompanyQueries({ company }: { company: string }) {
  return (
    <CompanyRouteGuard company={company}>
      {(session) => (
        <CompanyAnalyticsShell company={company} username={session.user.username} current="queries">
          <QueryHistory company={company} audience="company" />
        </CompanyAnalyticsShell>
      )}
    </CompanyRouteGuard>
  );
}
