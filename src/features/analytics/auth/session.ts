import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useSyncExternalStore } from "react";

import { getSession, isAnalyticsApiError, logout } from "../api";
import type { AnalyticsAudience } from "../model/types";

export function analyticsSessionKey(audience: AnalyticsAudience) {
  return ["analytics", audience, "session"] as const;
}

const subscribeToClientReady = () => () => undefined;

export function useClientReady(): boolean {
  return useSyncExternalStore(
    subscribeToClientReady,
    () => true,
    () => false,
  );
}

export function useAnalyticsSession(audience: AnalyticsAudience, enabled = true) {
  return useQuery({
    queryKey: analyticsSessionKey(audience),
    queryFn: ({ signal }) => getSession(audience, signal),
    enabled,
    staleTime: 30_000,
    retry: false,
    refetchOnWindowFocus: "always",
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

export function loginPathWithReturn(loginPath: string): string {
  if (typeof window === "undefined") return loginPath;
  const returnTo = `${window.location.pathname}${window.location.search}`;
  return `${loginPath}?returnTo=${encodeURIComponent(returnTo)}`;
}

export function openPortalLogin(loginPath: string): void {
  window.location.assign(loginPathWithReturn(loginPath));
}

export function useUnauthorizedRedirect(
  errors: unknown[],
  audience: AnalyticsAudience,
  loginPath: string,
  queryClient: ReturnType<typeof useQueryClient>,
): void {
  const shouldRedirect = errors.some((error) => isAnalyticsApiError(error, 401));
  const shouldRefreshPrincipal = errors.some((error) => isAnalyticsApiError(error, 403));

  useEffect(() => {
    if (!shouldRedirect) return;
    queryClient.removeQueries({ queryKey: ["analytics", audience] });
    window.location.replace(loginPathWithReturn(loginPath));
  }, [audience, loginPath, queryClient, shouldRedirect]);

  useEffect(() => {
    if (!shouldRefreshPrincipal) return;
    void queryClient.invalidateQueries({ queryKey: analyticsSessionKey(audience) });
  }, [audience, queryClient, shouldRefreshPrincipal]);
}

export async function endAnalyticsSession(
  queryClient: ReturnType<typeof useQueryClient>,
  audience: AnalyticsAudience,
  destination: string,
): Promise<void> {
  try {
    await logout(audience);
  } finally {
    queryClient.removeQueries({ queryKey: ["analytics", audience] });
    window.location.assign(destination);
  }
}
