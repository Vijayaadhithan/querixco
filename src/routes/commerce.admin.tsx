import { createFileRoute } from "@tanstack/react-router";
import { PortalAdmin } from "@/components/commerce/PortalAdmin";
import { PortalGate } from "@/components/commerce/Portal";
export const Route = createFileRoute("/commerce/admin")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Querix — Admin" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: () => (
    <PortalGate admin>
      <PortalAdmin />
    </PortalGate>
  ),
});
