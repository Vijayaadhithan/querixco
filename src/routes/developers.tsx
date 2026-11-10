import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";

import { DevelopersPage } from "@/components/developers/DevelopersPage";

export const Route = createFileRoute("/developers")({
  head: () => ({
    meta: [
      { title: "Querix AI API Documentation" },
      {
        name: "description",
        content:
          "Explore Querix search and interactive commerce integration guides, including authentication, conversation state, streaming, and deployment boundaries.",
      },
    ],
  }),
  component: DevelopersRoute,
});

function DevelopersRoute() {
  const { pathname } = useLocation();

  return pathname === "/developers" ? <DevelopersPage /> : <Outlet />;
}
