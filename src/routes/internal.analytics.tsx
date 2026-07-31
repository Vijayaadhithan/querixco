import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";

import { InternalCompanySelector } from "@/components/analytics/internal/InternalCompanySelector";
import { privatePortalMeta } from "@/lib/analytics-head";

export const Route = createFileRoute("/internal/analytics")({
  head: () => ({ meta: privatePortalMeta("Querix internal analytics") }),
  component: InternalAnalyticsRoute,
});

function InternalAnalyticsRoute() {
  const { pathname } = useLocation();
  return pathname === "/internal/analytics" || pathname === "/internal/analytics/" ? (
    <InternalCompanySelector />
  ) : (
    <Outlet />
  );
}
