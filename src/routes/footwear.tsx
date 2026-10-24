import { createFileRoute } from "@tanstack/react-router";
import { CommerceDemo } from "@/components/commerce/CommerceDemo";
export const Route = createFileRoute("/footwear")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Footwear — Querix" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: () => <CommerceDemo key="footwear" storefront="footwear" />,
});
