import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

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
  const [filters, setFilters] = useState(createDashboardFilters);
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

  let content;
  if (dashboard.isPending) {
    content = (
      <PortalState
        kind="loading"
        title="Loading company analytics"
        message="Retrieving the latest private snapshot."
      />
    );
  } else if (dashboard.isError && !dashboard.data) {
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
    dashboard.data &&
    (dashboard.data.metadata.audience !== "company" ||
      dashboard.data.metadata.company_id !== company)
  ) {
    content = (
      <PortalState
        kind="forbidden"
        title="Access denied"
        message="The analytics response did not match this company workspace."
      />
    );
  } else if (dashboard.data) {
    content = (
      <>
        {(dashboard.isError || status.isError) && (
          <div
            role="alert"
            className="mx-auto mt-5 max-w-[1440px] rounded-xl border border-amber-400/20 bg-amber-400/8 px-4 py-3 text-sm text-amber-100"
          >
            The saved snapshot remains visible, but the latest status check was unavailable.
          </div>
        )}
        <DashboardView
          dashboard={dashboard.data}
          company={company}
          audience="company"
          status={status.data}
          filters={filters}
          isFetching={dashboard.isFetching}
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
