import { Building2, MapPinned, Store, UserRoundCheck, UsersRound, Zap } from "lucide-react";

import { formatMetricValue } from "@/features/analytics/lib/format";
import type { CompanyBusinessOverview as CompanyBusinessOverviewValue } from "@/features/analytics/model/types";

export function CompanyBusinessOverview({ overview }: { overview: CompanyBusinessOverviewValue }) {
  const cards = [
    { label: "Active listings", value: overview.active_listings, icon: Store },
    { label: "Active users", value: overview.active_users, icon: UsersRound },
    { label: "Active sellers", value: overview.active_sellers, icon: UserRoundCheck },
    {
      label: "Cities with supply",
      value: overview.cities_with_active_supply,
      icon: MapPinned,
    },
    {
      label: "Recorded demand",
      value: overview.recorded_demand,
      icon: Building2,
    },
    {
      label: "Demand fulfillment",
      value: overview.fulfillment_rate,
      valueKey: "rate",
      icon: Zap,
    },
  ];

  return (
    <section className="mb-6" aria-labelledby="business-overview-heading">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">
            Company overview
          </p>
          <h2 id="business-overview-heading" className="mt-2 text-2xl font-semibold text-white">
            Gainr marketplace at a glance
          </h2>
        </div>
        <p className="text-xs text-slate-500">{overview.scope}</p>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map(({ label, value, valueKey = "value", icon: Icon }) => (
          <article key={label} className="rounded-2xl border border-white/8 bg-white/[0.035] p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-slate-500">{label}</p>
              <Icon className="h-4 w-4 text-blue-300" aria-hidden="true" />
            </div>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-white">
              {formatMetricValue(value, valueKey)}
            </p>
          </article>
        ))}
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500">
        Active listings are non-deleted ads in Gainr statuses 1 or 8. Search activity is shown
        separately below so marketplace totals are never confused with search-only analytics.
      </p>
    </section>
  );
}
