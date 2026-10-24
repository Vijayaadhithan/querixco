import { createFileRoute } from "@tanstack/react-router";
import { CommerceDemo } from "@/components/commerce/CommerceDemo";
export const Route = createFileRoute("/fashion")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Fashion accessories — Querix" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => <CommerceDemo key="fashion" storefront="fashion" />,
});
