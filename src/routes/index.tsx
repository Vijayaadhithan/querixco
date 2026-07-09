import { createFileRoute } from "@tanstack/react-router";

import { LandingPage } from "@/components/landing/LandingPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Querix AI - Beyond Keywords" },
      {
        name: "description",
        content:
          "Querix AI helps businesses understand what users mean, not just what they type. Semantic search, embeddings, and intelligent discovery.",
      },
      { property: "og:title", content: "Querix AI - Beyond Keywords" },
      {
        property: "og:description",
        content: "The intelligence layer behind search, recommendations, and discovery.",
      },
    ],
  }),
  component: LandingPage,
});
