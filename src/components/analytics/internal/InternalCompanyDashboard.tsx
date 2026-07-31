import { useQuery, useQueryClient } from "@tanstack/react-query";

import { InternalAnalyticsShell } from "./InternalAnalyticsShell";
import { DashboardView } from "../shared/DashboardView";
import { PortalState } from "../shared/PortalState";
import { getInternalDashboard, isAnalyticsApiError } from "@/features/analytics/api";
import { InternalRouteGuard } from "@/components/analytics/shared/RouteGuards";
import { useUnauthorizedRedirect } from "@/features/analytics/auth/session";
import type { AnalyticsSession } from "@/features/analytics/model/types";

export function InternalCompanyDashboard({ company }: { company: string }) {
  return (
    <InternalRouteGuard>
      {(session) => <InternalCompanyDashboardContent company={company} session={session} />}
    </InternalRouteGuard>
  );
}

function InternalCompanyDashboardContent({
  company,
  session,
}: {
  company: string;
  session: AnalyticsSession;
}) {
  const queryClient = useQueryClient();
  const dashboard = useQuery({
    queryKey: ["analytics", "internal", company, "dashboard"],
    queryFn: ({ signal }) => getInternalDashboard(company, signal),
    staleTime: 5 * 60_000,
    retry: false,
    refetchOnWindowFocus: false,
  });
  useUnauthorizedRedirect([dashboard.error], "/internal/analytics/login", queryClient);

  let content;
  if (dashboard.isPending) {
    content = (
      <PortalState
        kind="loading"
        internal
        title="Loading internal analytics"
        message="Retrieving the selected company snapshot."
      />
    );
  } else if (dashboard.isError && !dashboard.data) {
    content = (
      <PortalState
        kind={isAnalyticsApiError(dashboard.error, 403) ? "forbidden" : "error"}
        internal
        title={
          isAnalyticsApiError(dashboard.error, 404)
            ? "Company not found"
            : isAnalyticsApiError(dashboard.error, 403)
              ? "Access denied"
              : "Analytics unavailable"
        }
        message={dashboard.error.message}
        action={{ label: "Try again", onClick: () => void dashboard.refetch() }}
      />
    );
  } else if (
    dashboard.data &&
    (dashboard.data.metadata.audience !== "internal" ||
      dashboard.data.metadata.company_id !== company)
  ) {
    content = (
      <PortalState
        kind="forbidden"
        internal
        title="Workspace mismatch"
        message="The analytics response did not match the selected internal company."
      />
    );
  } else if (dashboard.data) {
    content = (
      <>
        {dashboard.isError && (
          <div
            role="alert"
            className="mx-auto mt-5 max-w-[1440px] rounded-xl border border-amber-400/20 bg-amber-400/8 px-4 py-3 text-sm text-amber-100"
          >
            The saved snapshot remains visible, but a fresh request was unavailable.
          </div>
        )}
        <DashboardView dashboard={dashboard.data} company={company} audience="internal" />
      </>
    );
  }

  return (
    <InternalAnalyticsShell company={company} username={session.user.username} current="dashboard">
      {content}
    </InternalAnalyticsShell>
  );
}
