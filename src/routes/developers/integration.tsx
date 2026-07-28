import { createFileRoute } from "@tanstack/react-router";
import { DeveloperDocument } from "@/components/developers/DeveloperDocs";

export const Route = createFileRoute("/developers/integration")({
  head: () => ({
    meta: [
      { title: "API Integration — Querix AI Developers" },
      {
        name: "description",
        content:
          "Integrate Querix with server-side authentication, natural-language search requests, cursor pagination, typed client patterns, and explicit error handling.",
      },
    ],
  }),
  component: () => <DeveloperDocument guide="integration" />,
});
