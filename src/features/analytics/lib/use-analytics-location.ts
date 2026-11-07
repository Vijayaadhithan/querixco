import { useLocation, useRouter } from "@tanstack/react-router";
import { dashboardFiltersFromSearch, filterSearch, queryFiltersFromSearch } from "./navigation";
import type { AnalyticsAudience, DashboardFilterValue, QueryFilters } from "../model/types";

export function useAnalyticsLocation(audience: AnalyticsAudience) {
  const location = useLocation();
  const router = useRouter();
  const search = location.searchStr;
  function update(filters: DashboardFilterValue | QueryFilters, replace = false) {
    const href = `${location.pathname}?${filterSearch(filters, search)}`;
    if (replace) router.history.replace(href);
    else router.history.push(href);
  }
  const requestedView = new URLSearchParams(search).get("view") ?? "overview";
  const views =
    audience === "company"
      ? ["overview", "activity", "catalog"]
      : ["overview", "activity", "performance"];
  return {
    search,
    href: `${location.pathname}${search}`,
    dashboardFilters: dashboardFiltersFromSearch(search, audience),
    queryFilters: queryFiltersFromSearch(search, audience),
    update,
    view: views.includes(requestedView) ? requestedView : "overview",
    setView(view: string) {
      const params = new URLSearchParams(search);
      params.set("view", view);
      router.history.push(`${location.pathname}?${params}`);
    },
  };
}
