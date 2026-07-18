import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";

import { DevelopersPage } from "@/components/developers/DevelopersPage";

export const Route = createFileRoute("/developers")({
  head: () => ({
    meta: [
      { title: "Querix AI Developers — Search API reference" },
      {
        name: "description",
        content:
          "Integrate the Querix tenant-scoped Search API with server-side authentication, cursor pagination, health checks, and production-ready client patterns.",
      },
    ],
  }),
  component: DevelopersRoute,
});

function DevelopersRoute() {
  const { pathname } = useLocation();

  return pathname === "/developers" ? <DevelopersPage /> : <Outlet />;
}
