import { AnalyticsLogin } from "../shared/AnalyticsLogin";

export function CompanyLogin({ company }: { company: string }) {
  return <AnalyticsLogin audience="company" company={company} />;
}
