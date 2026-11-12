import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { LockKeyhole } from "lucide-react";

import { Brand } from "@/components/marketing/Brand";
import "@/components/workspace/workspace.css";
import { PrivatePortalError } from "@/components/analytics/shared/PrivatePortalError";
import { privatePortalMeta } from "@/features/analytics/lib/head";

export const Route = createFileRoute("/analytics")({
  head: () => ({ meta: privatePortalMeta("Private analytics portal · Querix") }),
  component: AnalyticsRoot,
  errorComponent: CompanyPortalError,
});

function CompanyPortalError({ error, reset }: { error: Error; reset: () => void }) {
  return <PrivatePortalError error={error} reset={reset} />;
}

function AnalyticsRoot() {
  const { pathname } = useLocation();
  if (pathname !== "/analytics" && pathname !== "/analytics/") return <Outlet />;

  return (
    <main className="qx-workspace qx-analytics-theme qx-state">
      <section className="qx-surface w-full max-w-md rounded-xl p-8 text-center">
        <div className="qx-state-brand">
          <Brand light />
        </div>
        <LockKeyhole className="mx-auto mt-8 h-7 w-7 text-workspace-blue" aria-hidden="true" />
        <h1 className="mt-4 text-xl font-semibold text-workspace-ink">Private analytics portal</h1>
        <p className="mt-2 text-sm leading-6 text-workspace-body">
          Use the company-specific portal link supplied directly by Querix.
        </p>
      </section>
    </main>
  );
}
