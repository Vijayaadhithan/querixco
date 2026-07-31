import { useEffect, useState } from "react";

type ApiHealth = {
  status: string;
  tenantMode: boolean;
  configuredCompanies: number;
  latencyMs: number;
  checkedAt: string;
  upstreamStatus: number | null;
};

type HealthState = {
  data: ApiHealth | null;
  phase: "loading" | "ready" | "unavailable";
};

export function useApiHealth(refreshMs = 60_000) {
  const [state, setState] = useState<HealthState>({
    data: null,
    phase: "loading",
  });

  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const response = await fetch("/api/ready", { cache: "no-store" });
        const payload = (await response.json()) as ApiHealth;
        if (cancelled) return;

        setState({
          data: payload,
          phase: response.ok && payload.status === "ok" ? "ready" : "unavailable",
        });
      } catch {
        if (!cancelled) {
          setState((current) => ({ ...current, phase: "unavailable" }));
        }
      }
    }

    void check();
    const interval = window.setInterval(check, refreshMs);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [refreshMs]);

  return state;
}
