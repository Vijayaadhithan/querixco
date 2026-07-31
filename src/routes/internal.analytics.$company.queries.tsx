import { createFileRoute } from "@tanstack/react-router";

import { InternalQueries } from "@/components/analytics/internal/InternalQueries";
import { privatePortalMeta } from "@/features/analytics/lib/head";

export const Route = createFileRoute("/internal/analytics/$company/queries")({
  head: () => ({ meta: privatePortalMeta("Internal query history · Querix") }),
  component: InternalQueriesRoute,
});

function InternalQueriesRoute() {
  const { company } = Route.useParams();
  return <InternalQueries company={company} />;
}
