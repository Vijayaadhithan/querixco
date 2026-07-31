import type { ReactNode } from "react";

import { PortalShell } from "../shared/PortalShell";

export function CompanyAnalyticsShell({
  company,
  username,
  current,
  children,
}: {
  company: string;
  username: string;
  current: "dashboard" | "queries";
  children: ReactNode;
}) {
  return (
    <PortalShell audience="company" company={company} username={username} current={current}>
      {children}
    </PortalShell>
  );
}
