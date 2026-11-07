import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAnalyticsLocation } from "@/features/analytics/lib/use-analytics-location";
import { useRetainedResult } from "@/features/analytics/lib/use-retained-result";

import { CompanyAnalyticsShell } from "./CompanyAnalyticsShell";
import { DashboardView } from "../shared/DashboardView";
import { PortalState } from "../shared/PortalState";
import {
  getCompanyDashboard,
  getCompanyStatus,
  isAnalyticsApiError,
} from "@/features/analytics/api";
import { CompanyRouteGuard } from "@/components/analytics/shared/RouteGuards";
import { useUnauthorizedRedirect } from "@/features/analytics/auth/session";
import { createDashboardFilters } from "@/features/analytics/lib/dashboard";
import type { AnalyticsSession } from "@/features/analytics/model/types";

export function CompanyDashboard({ company }: { company: string }) {
  return (
    <CompanyRouteGuard company={company}>
      {(session) => <CompanyDashboardContent company={company} session={session} />}
    </CompanyRouteGuard>
  );
}

function CompanyDashboardContent({
  company,
  session,
}: {
  company: string;
  session: AnalyticsSession;
}) {
  const queryClient = useQueryClient();
  const location = useAnalyticsLocation("company");
  const filters = location.dashboardFilters;
  const setFilters = location.update;
  const dashboard = useQuery({
    queryKey: ["analytics", "company", company, "dashboard", filters],
    queryFn: ({ signal }) => getCompanyDashboard(company, filters, signal),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60_000,
    retry: false,
    refetchOnWindowFocus: false,
  });
  const status = useQuery({
    queryKey: ["analytics", "company", company, "status"],
    queryFn: ({ signal }) => getCompanyStatus(company, signal),
    staleTime: 5 * 60_000,
    retry: false,
    refetchOnWindowFocus: false,
  });

  useUnauthorizedRedirect(
    [dashboard.error, status.error],
    "company",
    `/analytics/${company}/login`,
    queryClient,
  );

  const displayed = useRetainedResult(
    dashboard.data,
    dashboard.isPlaceholderData,
    "company:" + company,
  );

  let content;
  if (dashboard.isPending && !displayed) {
    content = (
      <PortalState
        kind="loading"
        title="Loading company analytics"
        message="Retrieving the latest private snapshot."
      />
    );
  } else if (dashboard.isError && !displayed) {
    content = (
      <PortalState
        kind={isAnalyticsApiError(dashboard.error, 403) ? "forbidden" : "error"}
        title={
          isAnalyticsApiError(dashboard.error, 403)
            ? "Access denied"
            : isAnalyticsApiError(dashboard.error, 404)
              ? "Company not found"
              : "Analytics unavailable"
        }
        message={dashboard.error.message}
        action={{ label: "Try again", onClick: () => void dashboard.refetch() }}
      />
    );
  } else if (
    displayed &&
    (displayed.metadata.audience !== "company" || displayed.metadata.company_id !== company)
  ) {
    content = (
      <PortalState
        kind="forbidden"
        title="Access denied"
        message="The analytics response did not match this company workspace."
      />
    );
  } else if (displayed) {
    content = (
      <>
        {(dashboard.isError || status.isError) && (
          <div
            role="alert"
            className="mx-auto mt-5 max-w-[1440px] rounded-md border border-workspace-warning-line bg-workspace-warning-tint px-4 py-3 text-sm text-workspace-warning"
          >
            {dashboard.isError
              ? "The saved report remains visible, but the latest request failed."
              : "The report loaded, but its status check failed."}{" "}
            <button
              className="font-semibold underline"
              onClick={() => {
                if (dashboard.isError) void dashboard.refetch();
                if (status.isError) void status.refetch();
              }}
            >
              Retry
            </button>
          </div>
        )}
        <DashboardView
          dashboard={displayed}
          company={company}
          audience="company"
          status={status.data}
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
    <CompanyAnalyticsShell company={company} username={session.user.username} current="dashboard">
      {content}
    </CompanyAnalyticsShell>
  );
}
