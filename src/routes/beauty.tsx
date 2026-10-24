import { createFileRoute } from "@tanstack/react-router";
import { CommerceDemo } from "@/components/commerce/CommerceDemo";
export const Route = createFileRoute("/beauty")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Beauty & personal care — Querix" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => <CommerceDemo key="beauty" storefront="beauty" />,
});
