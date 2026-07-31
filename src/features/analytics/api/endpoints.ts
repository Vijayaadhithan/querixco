import type {
  AnalyticsDashboard,
  AnalyticsSession,
  CompanyInventory,
  CompanyQueryRecord,
  InternalQueryRecord,
  QueryFilters,
  QueryPage,
} from "../model/types";
import { analyticsRequest } from "./client";

export function login(username: string, password: string): Promise<AnalyticsSession> {
  return analyticsRequest<AnalyticsSession>("/api/v1/analytics/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
}

export function getSession(signal?: AbortSignal): Promise<AnalyticsSession> {
  return analyticsRequest<AnalyticsSession>("/api/v1/analytics/auth/me", { signal });
}

export function logout(): Promise<{ logged_out: boolean }> {
  return analyticsRequest<{ logged_out: boolean }>("/api/v1/analytics/auth/logout", {
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
  if (filters.language) params.set("language", filters.language.slice(0, 64));
  if (filters.from) params.set("from", new Date(filters.from).toISOString());
  if (filters.to) params.set("to", new Date(filters.to).toISOString());

  return params.toString();
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
