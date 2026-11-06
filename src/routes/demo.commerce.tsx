import { createFileRoute } from "@tanstack/react-router";
import { PortalGate, Workspace } from "@/components/commerce/Portal";
export const Route = createFileRoute("/demo/commerce")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Shopping companion — Querix demo" },
      {
        name: "description",
        content:
          "Explore conversational shopping with a sample beauty and fashion catalog, or connect the live commerce backend.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => (
    <PortalGate>
      <Workspace />
    </PortalGate>
  ),
});
