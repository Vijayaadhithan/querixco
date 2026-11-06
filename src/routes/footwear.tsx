import { createFileRoute } from "@tanstack/react-router";
import { PortalGate } from "@/components/commerce/Portal";
import { CommerceDemo } from "@/components/commerce/CommerceDemo";
export const Route = createFileRoute("/footwear")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Footwear — Querix" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: () => (
    <PortalGate storefront="footwear">
      <CommerceDemo key="footwear" storefront="footwear" />
    </PortalGate>
  ),
});
