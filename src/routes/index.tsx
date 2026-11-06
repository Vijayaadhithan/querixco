import { createFileRoute } from "@tanstack/react-router";

import { LandingPage } from "@/components/landing/LandingPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Querix AI — Intelligent search & conversational commerce" },
      {
        name: "description",
        content:
          "Help shoppers find what they mean with intent-aware search and conversational shopping grounded in your catalog.",
      },
      { property: "og:title", content: "Querix AI — Intelligent search & conversational commerce" },
      {
        property: "og:description",
        content:
          "From “I need” to “that’s it.” Search, refine, and compare products with Querix AI.",
      },
    ],
  }),
  component: LandingPage,
});
