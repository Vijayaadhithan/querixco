import { createFileRoute } from "@tanstack/react-router";

const READY_URL = "https://api.querix.co/api/v1/ready";

type ReadyResponse = {
  status?: string;
  tenant_mode?: boolean;
  configured_companies?: number;
};

export const Route = createFileRoute("/api/ready")({
  server: {
    handlers: {
      GET: async () => {
        const startedAt = Date.now();
        const upstream = await fetch(READY_URL, {
          method: "GET",
          headers: { accept: "application/json" },
          signal: AbortSignal.timeout(4_000),
        });

        const latencyMs = Date.now() - startedAt;
        const data = (await upstream.json()) as ReadyResponse;

        return Response.json(
          {
            status: data.status ?? "unknown",
            tenantMode: Boolean(data.tenant_mode),
            configuredCompanies: data.configured_companies ?? 0,
            latencyMs,
            checkedAt: new Date().toISOString(),
          },
          {
            status: upstream.ok ? 200 : 502,
            headers: {
              "cache-control": "no-store",
            },
          },
        );
      },
    },
  },
});
