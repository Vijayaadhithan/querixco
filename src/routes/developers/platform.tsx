import { createFileRoute } from "@tanstack/react-router";

import { DeveloperDocument } from "@/components/developers/DeveloperDocs";

export const Route = createFileRoute("/developers/platform")({
  head: () => ({
    meta: [
      { title: "Search Platform — Querix AI Developers" },
      {
        name: "description",
        content:
          "Understand Querix search routing, intent-aware discovery, exact filters, catalog freshness, cursor sessions, and tenant boundaries.",
      },
    ],
  }),
  component: () => <DeveloperDocument guide="platform" />,
});
