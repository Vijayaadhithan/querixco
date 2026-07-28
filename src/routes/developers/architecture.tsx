import { createFileRoute } from "@tanstack/react-router";
import { DeveloperDocument } from "@/components/developers/DeveloperDocs";

export const Route = createFileRoute("/developers/architecture")({
  head: () => ({
    meta: [
      { title: "Architecture — Querix AI Developers" },
      {
        name: "description",
        content:
          "Review the Querix request lifecycle, deterministic and hybrid search paths, canonical data hydration, tenant isolation, and fallback behavior.",
      },
    ],
  }),
  component: () => <DeveloperDocument guide="architecture" />,
});
