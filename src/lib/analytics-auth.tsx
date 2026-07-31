/* eslint-disable react-refresh/only-export-components */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";

import { getSession, isAnalyticsApiError, logout } from "./analytics-api";
import type { AnalyticsSession } from "./analytics-types";
import { PortalState } from "@/components/analytics/shared/PortalState";

export const analyticsSessionKey = ["analytics", "session"] as const;

export function useClientReady(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return ready;
}

export function useAnalyticsSession(enabled = true) {
  return useQuery({
    queryKey: analyticsSessionKey,
    queryFn: ({ signal }) => getSession(signal),
    enabled,
    staleTime: 30_000,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export function safeCompanyReturnPath(value: string | null, company: string): string {
  const base = `/analytics/${company}`;
  if (!value) return base;
  const isSamePortal =
    value === base || value.startsWith(`${base}/`) || value.startsWith(`${base}?`);
  return isSamePortal ? value : base;
}

export function safeInternalReturnPath(value: string | null): string {
  const base = "/internal/analytics";
  if (!value) return base;
  const isSamePortal =
    value === base || value.startsWith(`${base}/`) || value.startsWith(`${base}?`);
  return isSamePortal ? value : base;
}

function loginPathWithReturn(loginPath: string): string {
  if (typeof window === "undefined") return loginPath;
  const returnTo = `${window.location.pathname}${window.location.search}`;
  return `${loginPath}?returnTo=${encodeURIComponent(returnTo)}`;
}

export function useUnauthorizedRedirect(
  errors: unknown[],
  loginPath: string,
  queryClient: ReturnType<typeof useQueryClient>,
) {
  const shouldRedirect = errors.some((error) => isAnalyticsApiError(error, 401));

  useEffect(() => {
    if (!shouldRedirect) return;
    queryClient.removeQueries({ queryKey: ["analytics"] });
    window.location.replace(loginPathWithReturn(loginPath));
  }, [loginPath, queryClient, shouldRedirect]);
}

export async function endAnalyticsSession(
  queryClient: ReturnType<typeof useQueryClient>,
  destination: string,
) {
  try {
    await logout();
  } finally {
    queryClient.removeQueries({ queryKey: ["analytics"] });
    window.location.assign(destination);
  }
}

type GuardProps = {
  children: (session: AnalyticsSession) => ReactNode;
};

export function CompanyRouteGuard({ company, children }: GuardProps & { company: string }) {
  const ready = useClientReady();
  const session = useAnalyticsSession(ready);

  useEffect(() => {
    if (!ready || !isAnalyticsApiError(session.error, 401)) return;
    window.location.replace(loginPathWithReturn(`/analytics/${company}/login`));
  }, [company, ready, session.error]);

  if (!ready || session.isPending) return <PortalState kind="loading" />;

  if (session.isError) {
    return (
      <PortalState
        kind="error"
        title="Session check unavailable"
        message="We couldn’t verify this private session. Check your connection and try again."
        action={{ label: "Try again", onClick: () => void session.refetch() }}
      />
    );
  }

  if (session.data?.user.role !== "company_user" || session.data.user.company_id !== company) {
    return (
      <PortalState
        kind="forbidden"
        title="Access denied"
        message="This account is not authorized for this company portal."
      />
    );
  }

  return <>{children(session.data)}</>;
}

export function InternalRouteGuard({ children }: GuardProps) {
  const ready = useClientReady();
  const session = useAnalyticsSession(ready);

  useEffect(() => {
    if (!ready || !isAnalyticsApiError(session.error, 401)) return;
    window.location.replace(loginPathWithReturn("/internal/analytics/login"));
  }, [ready, session.error]);

  if (!ready || session.isPending) return <PortalState kind="loading" internal />;

  if (session.isError) {
    return (
      <PortalState
        kind="error"
        title="Session check unavailable"
        message="We couldn’t verify this internal session. Check your connection and try again."
        action={{ label: "Try again", onClick: () => void session.refetch() }}
        internal
      />
    );
  }

  if (session.data?.user.role !== "internal_admin") {
    return (
      <PortalState
        kind="forbidden"
        title="Internal access required"
        message="This account is not authorized for the Querix internal portal."
        internal
      />
    );
  }

  return <>{children(session.data)}</>;
}
