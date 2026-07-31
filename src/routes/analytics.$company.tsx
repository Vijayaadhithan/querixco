import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";

import { CompanyDashboard } from "@/components/analytics/company/CompanyDashboard";
import { privatePortalMeta } from "@/features/analytics/lib/head";

export const Route = createFileRoute("/analytics/$company")({
  head: () => ({ meta: privatePortalMeta("Company analytics · Querix") }),
  component: CompanyAnalyticsRoute,
});

function CompanyAnalyticsRoute() {
  const { company } = Route.useParams();
  const { pathname } = useLocation();
  const basePath = `/analytics/${company}`;

  return pathname === basePath || pathname === `${basePath}/` ? (
    <CompanyDashboard company={company} />
  ) : (
    <Outlet />
  );
}
