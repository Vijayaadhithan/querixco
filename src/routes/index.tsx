import { createFileRoute } from "@tanstack/react-router";

import { LandingPage } from "@/components/landing/LandingPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Querix AI — Understanding thoughts, not just words" },
      {
        name: "description",
        content:
          "Querix AI provides tenant-scoped product search APIs for e-commerce, marketplaces, product catalogs, and advertisement platforms.",
      },
      { property: "og:title", content: "Querix AI — Understanding thoughts, not just words" },
      {
        property: "og:description",
        content: "Intent-aware product search for e-commerce, marketplaces, and listing platforms.",
      },
    ],
  }),
  component: LandingPage,
});
