import { createFileRoute } from "@tanstack/react-router";
import { CommerceUseCase } from "@/components/commerce/CommerceUseCase";
export const Route = createFileRoute("/use-cases/conversational-commerce")({
  head: () => ({
    meta: [
      { title: "Conversational commerce — Querix AI" },
      {
        name: "description",
        content:
          "Turn shopping requirements into a conversation. Explore beauty and fashion discovery, remembered preferences, and product comparisons with Querix.",
      },
    ],
  }),
  component: CommerceUseCase,
});
