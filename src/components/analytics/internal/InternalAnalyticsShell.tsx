import type { ReactNode } from "react";

import { PortalShell } from "../shared/PortalShell";

export function InternalAnalyticsShell({
  company,
  username,
  current,
  children,
}: {
  company?: string;
  username: string;
  current: "companies" | "dashboard" | "queries";
  children: ReactNode;
}) {
  return (
    <PortalShell audience="internal" company={company} username={username} current={current}>
      {children}
    </PortalShell>
  );
}
