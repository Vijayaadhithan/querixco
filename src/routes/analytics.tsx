import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { LockKeyhole } from "lucide-react";

import { QuerixLogo } from "@/components/QuerixLogo";
import { privatePortalMeta } from "@/lib/analytics-head";

export const Route = createFileRoute("/analytics")({
  head: () => ({ meta: privatePortalMeta("Private analytics portal · Querix") }),
  component: AnalyticsRoot,
});

function AnalyticsRoot() {
  const { pathname } = useLocation();
  if (pathname !== "/analytics" && pathname !== "/analytics/") return <Outlet />;

  return (
    <main className="grid min-h-screen place-items-center px-5 py-12">
      <section className="glass-card w-full max-w-md rounded-3xl p-8 text-center">
        <QuerixLogo className="mx-auto" size={34} />
        <LockKeyhole className="mx-auto mt-8 h-7 w-7 text-blue-300" aria-hidden="true" />
        <h1 className="mt-4 text-xl font-semibold text-white">Private analytics portal</h1>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Use the company-specific portal link supplied directly by Querix.
        </p>
      </section>
    </main>
  );
}
