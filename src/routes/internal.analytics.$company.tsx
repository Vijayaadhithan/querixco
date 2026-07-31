import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";

import { InternalCompanyDashboard } from "@/components/analytics/internal/InternalCompanyDashboard";
import { privatePortalMeta } from "@/features/analytics/lib/head";

export const Route = createFileRoute("/internal/analytics/$company")({
  head: () => ({ meta: privatePortalMeta("Internal company analytics · Querix") }),
  component: InternalCompanyRoute,
});

function InternalCompanyRoute() {
  const { company } = Route.useParams();
  const { pathname } = useLocation();
  const basePath = `/internal/analytics/${company}`;

  return pathname === basePath || pathname === `${basePath}/` ? (
    <InternalCompanyDashboard company={company} />
  ) : (
    <Outlet />
  );
}
