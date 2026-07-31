import { useEffect, type ReactNode } from "react";

import { PortalState } from "./PortalState";
import { isAnalyticsApiError } from "@/features/analytics/api";
import {
  loginPathWithReturn,
  openPortalLogin,
  useAnalyticsSession,
  useClientReady,
} from "@/features/analytics/auth/session";
import type { AnalyticsSession } from "@/features/analytics/model/types";

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

  if (session.data.user.role !== "company_user") {
    return (
      <PortalState
        kind="forbidden"
        title="Different portal session detected"
        message="Another analytics portal is signed in in this browser. Sign in to this company portal again, or use a separate browser profile to keep company and internal sessions open at the same time."
        action={{
          label: "Sign in to company portal",
          onClick: () => openPortalLogin(`/analytics/${company}/login`),
        }}
      />
    );
  }

  if (session.data.user.company_id !== company) {
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

  if (session.data.user.role !== "internal_admin") {
    return (
      <PortalState
        kind="forbidden"
        title="Different portal session detected"
        message="A company analytics session is active in this browser. Sign in to Querix Internal again, or use a separate browser profile to keep both portals open at the same time."
        action={{
          label: "Sign in to Querix Internal",
          onClick: () => openPortalLogin("/internal/analytics/login"),
        }}
        internal
      />
    );
  }

  return <>{children(session.data)}</>;
}
