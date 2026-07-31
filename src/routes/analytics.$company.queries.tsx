import { createFileRoute } from "@tanstack/react-router";

import { CompanyQueries } from "@/components/analytics/company/CompanyQueries";
import { privatePortalMeta } from "@/features/analytics/lib/head";

export const Route = createFileRoute("/analytics/$company/queries")({
  head: () => ({ meta: privatePortalMeta("Company query history · Querix") }),
  component: CompanyQueriesRoute,
});

function CompanyQueriesRoute() {
  const { company } = Route.useParams();
  return <CompanyQueries company={company} />;
}
