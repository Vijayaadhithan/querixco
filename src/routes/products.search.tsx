import { createFileRoute } from "@tanstack/react-router";
import { ProductPage } from "@/components/marketing/ProductPage";
export const Route = createFileRoute("/products/search")({
  head: () => ({
    meta: [
      { title: "Intelligent product search — Querix AI" },
      {
        name: "description",
        content:
          "Connect natural-language customer intent to relevant catalog products with precise filters and a tenant-scoped search API.",
      },
      { property: "og:title", content: "Intelligent product search — Querix AI" },
      { property: "og:description", content: "Their words. Your catalog. A better match." },
      { property: "og:url", content: "https://querix.co/products/search" },
    ],
  }),
  component: () => <ProductPage product="search" />,
});
