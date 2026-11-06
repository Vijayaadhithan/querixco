import { createFileRoute } from "@tanstack/react-router";
import { PortalGate } from "@/components/commerce/Portal";
import { CommerceDemo } from "@/components/commerce/CommerceDemo";
export const Route = createFileRoute("/beauty")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Beauty & personal care — Querix" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => (
    <PortalGate storefront="beauty">
      <CommerceDemo key="beauty" storefront="beauty" />
    </PortalGate>
  ),
});
