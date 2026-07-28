import { createFileRoute } from "@tanstack/react-router";

import { DeveloperDocument } from "@/components/developers/DeveloperDocs";

export const Route = createFileRoute("/developers/data-pipeline")({
  head: () => ({
    meta: [
      { title: "Data Lifecycle — Querix AI Developers" },
      {
        name: "description",
        content:
          "Learn how Querix prepares company catalogs through read-only source sync, normalization, retrieval content, validation, incremental updates, and atomic publishing.",
      },
    ],
  }),
  component: () => <DeveloperDocument guide="data-pipeline" />,
});
