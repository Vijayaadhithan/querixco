import { createFileRoute } from "@tanstack/react-router";
import { DemoRequest } from "@/components/marketing/DemoRequest";
export const Route = createFileRoute("/request-demo")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { product: "search" | "commerce" | "both" } => ({
    product: search.product === "search" || search.product === "commerce" ? search.product : "both",
  }),
  head: () => ({
    meta: [
      { title: "Request a demo — Querix AI" },
      {
        name: "description",
        content:
          "Explore intelligent search and interactive commerce for your catalog. Prepare a tailored demo request for the Querix team.",
      },
      { property: "og:title", content: "Request a demo — Querix AI" },
      {
        property: "og:description",
        content: "Start with your catalog and the shopping journeys that matter.",
      },
      { property: "og:url", content: "https://querix.co/request-demo" },
    ],
  }),
  component: RequestDemoRoute,
});
function RequestDemoRoute() {
  const { product } = Route.useSearch();
  return <DemoRequest key={product} initialProduct={product} />;
}
