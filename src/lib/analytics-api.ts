import type {
  AnalyticsDashboard,
  AnalyticsSession,
  CompanyInventory,
  CompanyQueryRecord,
  InternalQueryRecord,
  QueryFilters,
  QueryPage,
} from "./analytics-types";

const IS_LOCAL_BROWSER =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
const ANALYTICS_API_BASE_URL =
  import.meta.env.VITE_ANALYTICS_API_BASE_URL ??
  (IS_LOCAL_BROWSER ? "http://localhost:8010" : "https://api.querix.co");
const REQUEST_TIMEOUT_MS = 15_000;

export class AnalyticsApiError extends Error {
  readonly status: number;
  readonly payload: unknown;

  constructor(status: number, payload: unknown) {
    super(apiErrorMessage(status, payload));
    this.name = "AnalyticsApiError";
    this.status = status;
    this.payload = payload;
  }
}

function apiErrorMessage(status: number, payload: unknown): string {
  if (
    payload &&
    typeof payload === "object" &&
    "detail" in payload &&
    typeof payload.detail === "string"
  ) {
    return payload.detail;
  }

  if (status === 400 || status === 422) return "Please check the supplied values and try again.";
  if (status === 401) return "Your session has expired.";
  if (status === 403) return "This account does not have access to this portal.";
  if (status === 404) return "The requested company or resource was not found.";
  if (status === 503) return "Analytics is temporarily unavailable.";
  return "The analytics service could not complete this request.";
}

function boundedSignal(signal?: AbortSignal | null): AbortSignal {
  const timeoutSignal = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  if (!signal) return timeoutSignal;
  return AbortSignal.any([signal, timeoutSignal]);
}

function isTransientNetworkError(error: unknown): boolean {
  return error instanceof TypeError;
}

export async function analyticsFetch<T>(
  path: string,
  init: RequestInit = {},
  retryCount = 0,
): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase();

  try {
    const response = await fetch(`${ANALYTICS_API_BASE_URL}${path}`, {
      ...init,
      credentials: "include",
      cache: "no-store",
      signal: boundedSignal(init.signal),
      headers: {
        accept: "application/json",
        ...init.headers,
      },
    });

    const payload: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      if (method === "GET" && response.status === 503 && retryCount === 0) {
        return analyticsFetch<T>(path, init, 1);
      }
      throw new AnalyticsApiError(response.status, payload);
    }

    return payload as T;
  } catch (error) {
    if (method === "GET" && retryCount === 0 && isTransientNetworkError(error)) {
      return analyticsFetch<T>(path, init, 1);
    }
    throw error;
  }
}

export function login(username: string, password: string): Promise<AnalyticsSession> {
  return analyticsFetch<AnalyticsSession>("/api/v1/analytics/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
}

export function getSession(signal?: AbortSignal): Promise<AnalyticsSession> {
  return analyticsFetch<AnalyticsSession>("/api/v1/analytics/auth/me", { signal });
}

export function logout(): Promise<{ logged_out: boolean }> {
  return analyticsFetch<{ logged_out: boolean }>("/api/v1/analytics/auth/logout", {
    method: "POST",
  });
}

export function getCompanyDashboard(
  company: string,
  signal?: AbortSignal,
): Promise<AnalyticsDashboard> {
  return analyticsFetch<AnalyticsDashboard>(
    `/api/v1/${encodeURIComponent(company)}/analytics/dashboard`,
    { signal },
  );
}

export function getCompanyStatus(
  company: string,
  signal?: AbortSignal,
): Promise<Record<string, unknown>> {
  return analyticsFetch<Record<string, unknown>>(
    `/api/v1/${encodeURIComponent(company)}/analytics/status`,
    { signal },
  );
}

export function getInternalCompanies(signal?: AbortSignal): Promise<CompanyInventory> {
  return analyticsFetch<CompanyInventory>("/api/v1/admin/analytics/companies", { signal });
}

export function getInternalDashboard(
  company: string,
  signal?: AbortSignal,
): Promise<AnalyticsDashboard> {
  return analyticsFetch<AnalyticsDashboard>(
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
  return analyticsFetch<QueryPage<CompanyQueryRecord>>(
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
  return analyticsFetch<QueryPage<InternalQueryRecord>>(
    `/api/v1/admin/analytics/${encodeURIComponent(company)}/queries?${queryString(filters, cursor)}`,
    { signal },
  );
}

export function isAnalyticsApiError(error: unknown, status?: number): error is AnalyticsApiError {
  return error instanceof AnalyticsApiError && (status === undefined || error.status === status);
}
