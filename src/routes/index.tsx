import { createFileRoute } from "@tanstack/react-router";

import { LandingPage } from "@/components/landing/LandingPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Querix AI — Intent-aware product discovery" },
      {
        name: "description",
        content:
          "Querix AI understands customer intent and helps shoppers find the products they actually want—even from vague, incomplete, and natural-language queries.",
      },
      { property: "og:title", content: "Querix AI — Intent-aware product discovery" },
      {
        property: "og:description",
        content:
          "Help shoppers find the products they actually want, even from vague or natural-language queries.",
      },
    ],
  }),
  component: LandingPage,
});
