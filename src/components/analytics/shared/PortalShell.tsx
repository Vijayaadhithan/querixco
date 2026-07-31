import { useQueryClient } from "@tanstack/react-query";
import { BarChart3, Building2, LogOut, Search } from "lucide-react";
import type { ReactNode } from "react";

import { QuerixLogo } from "@/components/QuerixLogo";
import { endAnalyticsSession } from "@/lib/analytics-auth";
import { formatCompanyName } from "@/lib/analytics-format";

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
    <div className={internal ? "min-h-screen bg-[#0b1220]" : "min-h-screen"}>
      <header className="sticky top-0 z-40 border-b border-white/8 bg-[#0a1526]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1480px] items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="min-w-0 shrink-0">
            <QuerixLogo size={29} />
          </div>
          <div className="hidden h-7 w-px bg-white/10 sm:block" aria-hidden="true" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {internal
                ? company
                  ? `${formatCompanyName(company)} · Internal`
                  : "Querix Internal"
                : `${formatCompanyName(company ?? "")} Analytics`}
            </p>
            <p className="truncate text-xs text-slate-400">{username}</p>
          </div>

          <nav className="ml-auto flex items-center gap-1" aria-label="Analytics portal">
            {internal && (
              <a
                href="/internal/analytics"
                aria-current={current === "companies" ? "page" : undefined}
                className={navClass(current === "companies")}
              >
                <Building2 className="h-4 w-4" aria-hidden="true" />
                <span className="hidden md:inline">Companies</span>
              </a>
            )}
            {company && (
              <>
                <a
                  href={dashboardHref}
                  aria-current={current === "dashboard" ? "page" : undefined}
                  className={navClass(current === "dashboard")}
                >
                  <BarChart3 className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden md:inline">Dashboard</span>
                </a>
                <a
                  href={queriesHref}
                  aria-current={current === "queries" ? "page" : undefined}
                  className={navClass(current === "queries")}
                >
                  <Search className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden md:inline">Queries</span>
                </a>
              </>
            )}
            <button
              type="button"
              onClick={() => void endAnalyticsSession(queryClient, logoutDestination)}
              className={navClass(false)}
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span className="hidden md:inline">Log out</span>
            </button>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}

function navClass(active: boolean): string {
  return `inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300 ${
    active ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/6 hover:text-white"
  }`;
}
