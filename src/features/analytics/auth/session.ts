import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useSyncExternalStore } from "react";

import { getSession, isAnalyticsApiError, logout } from "../api";

export const analyticsSessionKey = ["analytics", "session"] as const;

const subscribeToClientReady = () => () => undefined;

export function useClientReady(): boolean {
  return useSyncExternalStore(
    subscribeToClientReady,
    () => true,
    () => false,
  );
}

export function useAnalyticsSession(enabled = true) {
  return useQuery({
    queryKey: analyticsSessionKey,
    queryFn: ({ signal }) => getSession(signal),
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
  loginPath: string,
  queryClient: ReturnType<typeof useQueryClient>,
): void {
  const shouldRedirect = errors.some((error) => isAnalyticsApiError(error, 401));
  const shouldRefreshPrincipal = errors.some((error) => isAnalyticsApiError(error, 403));

  useEffect(() => {
    if (!shouldRedirect) return;
    queryClient.removeQueries({ queryKey: ["analytics"] });
    window.location.replace(loginPathWithReturn(loginPath));
  }, [loginPath, queryClient, shouldRedirect]);

  useEffect(() => {
    if (!shouldRefreshPrincipal) return;
    void queryClient.invalidateQueries({ queryKey: analyticsSessionKey });
  }, [queryClient, shouldRefreshPrincipal]);
}

export async function endAnalyticsSession(
  queryClient: ReturnType<typeof useQueryClient>,
  destination: string,
): Promise<void> {
  try {
    await logout();
  } finally {
    queryClient.removeQueries({ queryKey: ["analytics"] });
    window.location.assign(destination);
  }
}
