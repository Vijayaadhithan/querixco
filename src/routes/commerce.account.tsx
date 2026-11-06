import { createFileRoute } from "@tanstack/react-router";
import { AccountPage } from "@/components/commerce/Portal";
import { PortalGate } from "@/components/commerce/Portal";
export const Route = createFileRoute("/commerce/account")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Querix — Account" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: () => (
    <PortalGate>
      <AccountPage />
    </PortalGate>
  ),
});
