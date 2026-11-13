import { createFileRoute } from "@tanstack/react-router";

import { LandingPage } from "@/components/landing/LandingPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Querix AI — Intelligent search & interactive commerce" },
      {
        name: "description",
        content:
          "Help shoppers find what they mean with intent-aware search and conversational shopping grounded in your catalog.",
      },
      { property: "og:title", content: "Querix AI — Intelligent search & interactive commerce" },
      {
        property: "og:description",
        content:
          "Help shoppers find what they mean. Intelligent search, conversational shopping and insight into customer demand.",
      },
    ],
  }),
  component: LandingPage,
});
