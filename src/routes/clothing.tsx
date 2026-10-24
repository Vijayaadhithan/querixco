import { createFileRoute } from "@tanstack/react-router";
import { CommerceDemo } from "@/components/commerce/CommerceDemo";
export const Route = createFileRoute("/clothing")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Clothing — Querix" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: () => <CommerceDemo key="clothing" storefront="clothing" />,
});
