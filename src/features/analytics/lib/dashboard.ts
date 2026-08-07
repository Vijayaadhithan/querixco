import type { DashboardFilterValue } from "../model/types";

export function createDashboardFilters(): DashboardFilterValue {
  return {
    period: "30d",
    outcome: "",
    category: "",
    language: "",
    cityId: "",
    adType: "",
    executionPath: "",
    provider: "",
    operation: "",
    from: "",
    to: "",
  };
}
