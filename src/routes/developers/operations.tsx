import { createFileRoute } from "@tanstack/react-router";
import { DeveloperDocument } from "@/components/developers/DeveloperDocs";

export const Route = createFileRoute("/developers/operations")({
  head: () => ({
    meta: [
      { title: "Reliability & Health — Querix AI Developers" },
      {
        name: "description",
        content:
          "Operate Querix with serving-path readiness, tenant health, incremental indexing, route-aware assurance, monitoring, and predictable fallbacks.",
      },
    ],
  }),
  component: () => <DeveloperDocument guide="operations" />,
});
