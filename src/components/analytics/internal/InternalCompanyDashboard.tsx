import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

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
  const [filters, setFilters] = useState(createDashboardFilters);
  const dashboard = useQuery({
    queryKey: ["analytics", "internal", company, "dashboard", filters],
    queryFn: ({ signal }) => getInternalDashboard(company, filters, signal),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60_000,
    retry: false,
    refetchOnWindowFocus: false,
  });
  useUnauthorizedRedirect([dashboard.error], "internal", "/internal/analytics/login", queryClient);

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
        <DashboardView
          dashboard={dashboard.data}
          company={company}
          audience="internal"
          filters={filters}
          isFetching={dashboard.isFetching}
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
