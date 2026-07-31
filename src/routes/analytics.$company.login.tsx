import { createFileRoute } from "@tanstack/react-router";

import { CompanyLogin } from "@/components/analytics/company/CompanyLogin";
import { privatePortalMeta } from "@/features/analytics/lib/head";

export const Route = createFileRoute("/analytics/$company/login")({
  head: () => ({ meta: privatePortalMeta("Company analytics sign in · Querix") }),
  component: CompanyLoginRoute,
});

function CompanyLoginRoute() {
  const { company } = Route.useParams();
  return <CompanyLogin company={company} />;
}
