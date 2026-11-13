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
    <div className="qx-workspace qx-analytics-theme qx-analytics">
      <a className="qx-workspace-skip" href="#analytics-content">
        Skip to analytics
      </a>
      <header className="qx-workspace-header">
        <div className="qx-workspace-header-inner">
          <a href="/" aria-label="Querix AI home">
            <Brand light />
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
          <span className="analytics-workspace-label">
            {internal ? "Internal workspace" : "Company workspace"}
          </span>
        </div>
      </header>
      <div className="analytics-layout">
        <aside className="analytics-sidebar">
          <p className="analytics-sidebar-label">
            {internal ? "OPERATIONS" : "SEARCH INTELLIGENCE"}
          </p>
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
                  <span>Overview</span>
                </a>
                <a href={queriesHref} aria-current={current === "queries" ? "page" : undefined}>
                  <Search size={15} aria-hidden="true" />
                  <span>{internal ? "Requests" : "Search history"}</span>
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
          <div className="analytics-sidebar-note">
            <BarChart3 size={20} aria-hidden="true" />
            <strong>{internal ? "Request diagnostics" : "Company analytics"}</strong>
            <p>
              {internal
                ? "Review request outcomes and investigate performance."
                : "Explore searches, results, and catalog reports."}
            </p>
          </div>
        </aside>
        <div id="analytics-content" tabIndex={-1}>
          {children}
        </div>
      </div>
    </div>
  );
}
