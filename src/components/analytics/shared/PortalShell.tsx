import { useQueryClient } from "@tanstack/react-query";
import { BarChart3, Building2, LogOut, Search } from "lucide-react";
import type { ReactNode } from "react";
import { Brand } from "@/components/marketing/Brand";
import "@/components/workspace/workspace.css";
import { endAnalyticsSession } from "@/features/analytics/auth/session";
import { formatCompanyName } from "@/features/analytics/lib/format";

type PortalShellProps = {
  audience: "company" | "internal";
  company?: string;
  username: string;
  current: "dashboard" | "queries" | "companies";
  children: ReactNode;
};

export function PortalShell({ audience, company, username, current, children }: PortalShellProps) {
  const queryClient = useQueryClient();
  const internal = audience === "internal";
  const dashboardHref = internal
    ? company
      ? `/internal/analytics/${company}`
      : "/internal/analytics"
    : `/analytics/${company}`;
  const queriesHref = internal
    ? `/internal/analytics/${company}/queries`
    : `/analytics/${company}/queries`;
  const logoutDestination = internal ? "/internal/analytics/login" : `/analytics/${company}/login`;
  return (
    <div className="qx-workspace qx-analytics">
      <a className="qx-workspace-skip" href="#analytics-content">
        Skip to analytics
      </a>
      <header className="qx-workspace-header">
        <div className="qx-workspace-header-inner">
          <a href="/" aria-label="Querix AI home">
            <Brand />
          </a>
          <div className="qx-workspace-identity">
            <p>
              {internal
                ? company
                  ? `${formatCompanyName(company)} · Internal`
                  : "Querix Internal"
                : `${formatCompanyName(company ?? "")} Analytics`}
            </p>
            <span>{username}</span>
          </div>
          <nav className="qx-workspace-nav" aria-label="Analytics portal">
            {internal && (
              <a
                href="/internal/analytics"
                aria-current={current === "companies" ? "page" : undefined}
              >
                <Building2 size={15} aria-hidden="true" />
                <span>Companies</span>
              </a>
            )}
            {company && (
              <>
                <a href={dashboardHref} aria-current={current === "dashboard" ? "page" : undefined}>
                  <BarChart3 size={15} aria-hidden="true" />
                  <span>Dashboard</span>
                </a>
                <a href={queriesHref} aria-current={current === "queries" ? "page" : undefined}>
                  <Search size={15} aria-hidden="true" />
                  <span>Queries</span>
                </a>
              </>
            )}
            <button
              type="button"
              onClick={() => void endAnalyticsSession(queryClient, audience, logoutDestination)}
            >
              <LogOut size={15} aria-hidden="true" />
              <span>Log out</span>
            </button>
          </nav>
        </div>
      </header>
      <div id="analytics-content" tabIndex={-1}>
        {children}
      </div>
    </div>
  );
}
