import { createFileRoute } from "@tanstack/react-router";
import { PortalGate } from "@/components/commerce/Portal";
import { CommerceDemo } from "@/components/commerce/CommerceDemo";
export const Route = createFileRoute("/clothing")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Clothing — Querix" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: () => (
    <PortalGate storefront="clothing">
      <CommerceDemo key="clothing" storefront="clothing" />
    </PortalGate>
  ),
});
