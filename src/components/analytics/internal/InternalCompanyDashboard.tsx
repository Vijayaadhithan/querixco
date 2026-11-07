import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAnalyticsLocation } from "@/features/analytics/lib/use-analytics-location";
import { useRetainedResult } from "@/features/analytics/lib/use-retained-result";

import { InternalAnalyticsShell } from "./InternalAnalyticsShell";
import { DashboardView } from "../shared/DashboardView";
import { PortalState } from "../shared/PortalState";
import { getInternalDashboard, isAnalyticsApiError } from "@/features/analytics/api";
import { InternalRouteGuard } from "@/components/analytics/shared/RouteGuards";
import { useUnauthorizedRedirect } from "@/features/analytics/auth/session";
import { createDashboardFilters } from "@/features/analytics/lib/dashboard";
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
  const location = useAnalyticsLocation("internal");
  const filters = location.dashboardFilters;
  const setFilters = location.update;
  const dashboard = useQuery({
    queryKey: ["analytics", "internal", company, "dashboard", filters],
    queryFn: ({ signal }) => getInternalDashboard(company, filters, signal),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60_000,
    retry: false,
    refetchOnWindowFocus: false,
  });
  useUnauthorizedRedirect([dashboard.error], "internal", "/internal/analytics/login", queryClient);

  const displayed = useRetainedResult(
    dashboard.data,
    dashboard.isPlaceholderData,
    "internal:" + company,
  );

  let content;
  if (dashboard.isPending && !displayed) {
    content = (
      <PortalState
        kind="loading"
        internal
        title="Loading internal analytics"
        message="Retrieving the selected company snapshot."
      />
    );
  } else if (dashboard.isError && !displayed) {
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
    displayed &&
    (displayed.metadata.audience !== "internal" || displayed.metadata.company_id !== company)
  ) {
    content = (
      <PortalState
        kind="forbidden"
        internal
        title="Workspace mismatch"
        message="The analytics response did not match the selected internal company."
      />
    );
  } else if (displayed) {
    content = (
      <>
        {dashboard.isError && (
          <div
            role="alert"
            className="mx-auto mt-5 max-w-[1440px] rounded-md border border-workspace-warning-line bg-workspace-warning-tint px-4 py-3 text-sm text-workspace-warning"
          >
            The saved report remains visible, but the latest request failed.{" "}
            <button className="font-semibold underline" onClick={() => void dashboard.refetch()}>
              Retry
            </button>
          </div>
        )}
        <DashboardView
          dashboard={displayed}
          company={company}
          audience="internal"
          filters={filters}
          isFetching={dashboard.isFetching}
          stale={
            dashboard.isPlaceholderData ||
            dashboard.isError ||
            (dashboard.isPending && Boolean(displayed))
          }
          view={location.view}
          onViewChange={location.setView}
          currentHref={location.href}
          onFiltersChange={setFilters}
          onFiltersReset={() => setFilters(createDashboardFilters())}
        />
      </>
    );
  }

  return (
    <InternalAnalyticsShell company={company} username={session.user.username} current="dashboard">
      {content}
    </InternalAnalyticsShell>
  );
}
