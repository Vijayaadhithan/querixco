import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "@/components/commerce/Portal";
export const Route = createFileRoute("/commerce/login")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Querix — Login" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: () => <LoginPage />,
});
