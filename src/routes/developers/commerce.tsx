import { createFileRoute } from "@tanstack/react-router";
import { CommerceGuide } from "@/components/developers/CommerceGuide";
export const Route = createFileRoute("/developers/commerce")({
  head: () => ({
    meta: [
      { title: "Conversational commerce integration — Querix AI" },
      {
        name: "description",
        content:
          "Commerce conversation lifecycle, saved preferences, streaming, retries, and current access and catalog boundaries.",
      },
    ],
  }),
  component: CommerceGuide,
});
