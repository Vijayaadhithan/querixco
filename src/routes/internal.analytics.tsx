import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";

import { InternalCompanySelector } from "@/components/analytics/internal/InternalCompanySelector";
import { PrivatePortalError } from "@/components/analytics/shared/PrivatePortalError";
import { privatePortalMeta } from "@/features/analytics/lib/head";

export const Route = createFileRoute("/internal/analytics")({
  head: () => ({ meta: privatePortalMeta("Querix internal analytics") }),
  component: InternalAnalyticsRoute,
  errorComponent: InternalPortalError,
});

function InternalPortalError({ error, reset }: { error: Error; reset: () => void }) {
  return <PrivatePortalError error={error} reset={reset} internal />;
}

function InternalAnalyticsRoute() {
  const { pathname } = useLocation();
  return pathname === "/internal/analytics" || pathname === "/internal/analytics/" ? (
    <InternalCompanySelector />
  ) : (
    <Outlet />
  );
}
