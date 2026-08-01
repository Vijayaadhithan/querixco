import type {
  AnalyticsDashboard,
  AnalyticsAudience,
  AnalyticsSession,
  CompanyInventory,
  CompanyQueryRecord,
  InternalQueryRecord,
  QueryFilters,
  QueryPage,
} from "../model/types";
import { analyticsRequest } from "./client";

function authEndpoint(audience: AnalyticsAudience, action: "login" | "me" | "logout"): string {
  return `/api/v1/analytics/${audience}/auth/${action}`;
}

export function login(
  audience: AnalyticsAudience,
  username: string,
  password: string,
): Promise<AnalyticsSession> {
  return analyticsRequest<AnalyticsSession>(authEndpoint(audience, "login"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
}

export function getSession(
  audience: AnalyticsAudience,
  signal?: AbortSignal,
): Promise<AnalyticsSession> {
  return analyticsRequest<AnalyticsSession>(authEndpoint(audience, "me"), { signal });
}

export function logout(audience: AnalyticsAudience): Promise<{ logged_out: boolean }> {
  return analyticsRequest<{ logged_out: boolean }>(authEndpoint(audience, "logout"), {
    method: "POST",
  });
}

export function getCompanyDashboard(
  company: string,
  signal?: AbortSignal,
): Promise<AnalyticsDashboard> {
  return analyticsRequest<AnalyticsDashboard>(
    `/api/v1/${encodeURIComponent(company)}/analytics/dashboard`,
    { signal },
  );
}

export function getCompanyStatus(
  company: string,
  signal?: AbortSignal,
): Promise<Record<string, unknown>> {
  return analyticsRequest<Record<string, unknown>>(
    `/api/v1/${encodeURIComponent(company)}/analytics/status`,
    { signal },
  );
}

export function getInternalCompanies(signal?: AbortSignal): Promise<CompanyInventory> {
  return analyticsRequest<CompanyInventory>("/api/v1/admin/analytics/companies", { signal });
}

export function getInternalDashboard(
  company: string,
  signal?: AbortSignal,
): Promise<AnalyticsDashboard> {
  return analyticsRequest<AnalyticsDashboard>(
    `/api/v1/admin/analytics/${encodeURIComponent(company)}/dashboard`,
    { signal },
  );
}

function queryString(filters: QueryFilters, cursor: string | null): string {
  const params = new URLSearchParams({ limit: "50" });

  if (cursor) params.set("cursor", cursor);
  if (filters.query) params.set("query", filters.query.slice(0, 1000));
  if (filters.outcome) params.set("outcome", filters.outcome);
  if (filters.category) params.set("category", filters.category.slice(0, 191));
  if (filters.executionPath) {
    params.set("execution_path", filters.executionPath.slice(0, 128));
  }
  if (filters.language) params.set("language", filters.language.slice(0, 64));
  if (filters.from) params.set("from", dateBoundary(filters.from, "start"));
  if (filters.to) params.set("to", dateBoundary(filters.to, "end"));

  return params.toString();
}

function dateBoundary(value: string, boundary: "start" | "end"): string {
  const time = boundary === "start" ? "00:00:00.000" : "23:59:59.999";
  return new Date(`${value}T${time}`).toISOString();
}

export function getCompanyQueries(
  company: string,
  filters: QueryFilters,
  cursor: string | null,
  signal?: AbortSignal,
): Promise<QueryPage<CompanyQueryRecord>> {
  return analyticsRequest<QueryPage<CompanyQueryRecord>>(
    `/api/v1/${encodeURIComponent(company)}/analytics/queries?${queryString(filters, cursor)}`,
    { signal },
  );
}

export function getInternalQueries(
  company: string,
  filters: QueryFilters,
  cursor: string | null,
  signal?: AbortSignal,
): Promise<QueryPage<InternalQueryRecord>> {
  return analyticsRequest<QueryPage<InternalQueryRecord>>(
    `/api/v1/admin/analytics/${encodeURIComponent(company)}/queries?${queryString(filters, cursor)}`,
    { signal },
  );
}
