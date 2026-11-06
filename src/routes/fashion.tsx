import { createFileRoute } from "@tanstack/react-router";
import { PortalGate } from "@/components/commerce/Portal";
import { CommerceDemo } from "@/components/commerce/CommerceDemo";
export const Route = createFileRoute("/fashion")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Fashion accessories — Querix" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => (
    <PortalGate storefront="fashion">
      <CommerceDemo key="fashion" storefront="fashion" />
    </PortalGate>
  ),
});
