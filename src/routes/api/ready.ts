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

        try {
          const upstream = await fetch(READY_URL, {
            method: "GET",
            headers: { accept: "application/json" },
            signal: AbortSignal.timeout(4_000),
          });

          const latencyMs = Date.now() - startedAt;
          const contentType = upstream.headers.get("content-type") ?? "";
          const data = contentType.includes("application/json")
            ? ((await upstream.json()) as ReadyResponse)
            : {};

          return Response.json(
            {
              status: data.status ?? (upstream.ok ? "unknown" : "unavailable"),
              tenantMode: Boolean(data.tenant_mode),
              configuredCompanies: data.configured_companies ?? 0,
              latencyMs,
              checkedAt: new Date().toISOString(),
              upstreamStatus: upstream.status,
            },
            {
              status: upstream.ok ? 200 : 502,
              headers: {
                "cache-control": "no-store",
              },
            },
          );
        } catch {
          return Response.json(
            {
              status: "unavailable",
              tenantMode: false,
              configuredCompanies: 0,
              latencyMs: Date.now() - startedAt,
              checkedAt: new Date().toISOString(),
              upstreamStatus: null,
            },
            {
              status: 503,
              headers: {
                "cache-control": "no-store",
              },
            },
          );
        }
      },
    },
  },
});
