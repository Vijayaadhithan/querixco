import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";

import { DevelopersPage } from "@/components/developers/DevelopersPage";

export const Route = createFileRoute("/developers")({
  head: () => ({
    meta: [
      { title: "Querix AI Developers - Search API Reference" },
      {
        name: "description",
        content:
          "Integrate Querix AI semantic search with company-scoped authentication, production diagnostics, and clear operational guidance.",
      },
    ],
  }),
  component: DevelopersRoute,
});

function DevelopersRoute() {
  const { pathname } = useLocation();

  return pathname === "/developers" ? <DevelopersPage /> : <Outlet />;
}
