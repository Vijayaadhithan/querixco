import { createFileRoute } from "@tanstack/react-router";

import { InternalLogin } from "@/components/analytics/internal/InternalLogin";
import { privatePortalMeta } from "@/features/analytics/lib/head";

export const Route = createFileRoute("/internal/analytics/login")({
  head: () => ({ meta: privatePortalMeta("Querix internal analytics sign in") }),
  component: InternalLogin,
});
