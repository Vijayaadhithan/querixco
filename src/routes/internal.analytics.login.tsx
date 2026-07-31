import { createFileRoute } from "@tanstack/react-router";

import { InternalLogin } from "@/components/analytics/internal/InternalLogin";
import { privatePortalMeta } from "@/lib/analytics-head";

export const Route = createFileRoute("/internal/analytics/login")({
  head: () => ({ meta: privatePortalMeta("Querix internal analytics sign in") }),
  component: InternalLogin,
});
