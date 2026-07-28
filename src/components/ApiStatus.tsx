import { Activity, ArrowRight } from "lucide-react";

import { useApiHealth } from "@/lib/use-api-health";

export function ApiStatusBadge({ detailed = false }: { detailed?: boolean }) {
  const { data, phase } = useApiHealth();
  const ready = phase === "ready";
  const label =
    phase === "loading" ? "Checking API" : ready ? "API operational" : "API status unavailable";

  return (
    <a
      href="/developers/operations#readiness-and-health-contract"
      className={`api-status-badge group ${ready ? "is-ready" : phase === "loading" ? "is-loading" : "is-unavailable"}`}
      aria-label={`${label}. Open the reliability guide.`}
    >
      <span className="api-status-orb" aria-hidden="true">
        <span />
      </span>
      <span>
        <span className="block text-[11px] font-medium leading-none text-white">{label}</span>
        {detailed && (
          <span className="mt-1 block text-[10px] leading-none text-[#71869d]">
            {data ? `${data.latencyMs} ms · serving path` : "Live serving-path probe"}
          </span>
        )}
      </span>
      {detailed ? (
        <ArrowRight className="h-3.5 w-3.5 text-[#6e849c] transition group-hover:translate-x-0.5 group-hover:text-white" />
      ) : (
        <Activity className="h-3.5 w-3.5 text-[#6e849c]" />
      )}
    </a>
  );
}
