import { createFileRoute } from "@tanstack/react-router";
import { CommerceUseCase } from "@/components/commerce/CommerceUseCase";
export const Route = createFileRoute("/use-cases/conversational-commerce")({
  head: () => ({
    meta: [
      { title: "Conversational commerce — Querix AI" },
      {
        name: "description",
        content:
          "Shopping conversations that keep context. Refine requirements, manage separate budgets, and compare supplied catalog details with Querix AI.",
      },
      { property: "og:title", content: "Conversational commerce — Querix AI" },
      {
        property: "og:description",
        content:
          "The next question makes the difference. Shopping conversations grounded in the catalog.",
      },
      { property: "og:url", content: "https://querix.co/use-cases/conversational-commerce" },
    ],
  }),
  component: CommerceUseCase,
});
