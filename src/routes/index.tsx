import { createFileRoute } from "@tanstack/react-router";

import { LandingPage } from "@/components/landing/LandingPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Querix AI — The next evolution of e-commerce starts here" },
      {
        name: "description",
        content:
          "Introducing Interactive Commerce. Let shoppers ask questions, refine their needs and compare products through conversations grounded in your catalog.",
      },
      { property: "og:title", content: "Querix AI — The next evolution of e-commerce starts here" },
      {
        property: "og:description",
        content:
          "Ask, refine and compare. Discover Interactive Commerce and Intelligent Search from Querix AI.",
      },
    ],
  }),
  component: LandingPage,
});
