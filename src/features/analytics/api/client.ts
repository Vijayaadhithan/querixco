import type { ResponseDecoder } from "./validate";

const isLocalBrowser =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

const apiBaseUrl =
  import.meta.env.VITE_ANALYTICS_API_BASE_URL ??
  (isLocalBrowser ? "http://localhost:8010" : "https://api.querix.co");

const requestTimeoutMs = 15_000;

class AnalyticsApiError extends Error {
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
  const timeoutSignal = AbortSignal.timeout(requestTimeoutMs);
  if (!signal) return timeoutSignal;
  return AbortSignal.any([signal, timeoutSignal]);
}

function isTransientNetworkError(error: unknown): boolean {
  return error instanceof TypeError;
}

export async function analyticsRequest<T>(
  path: string,
  decode: ResponseDecoder<T>,
  init: RequestInit = {},
  retryCount = 0,
): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase();

  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
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
        return analyticsRequest(path, decode, init, 1);
      }
      throw new AnalyticsApiError(response.status, payload);
    }

    return decode(payload);
  } catch (error) {
    if (method === "GET" && retryCount === 0 && isTransientNetworkError(error)) {
      return analyticsRequest(path, decode, init, 1);
    }
    throw error;
  }
}

export function isAnalyticsApiError(error: unknown, status?: number): error is AnalyticsApiError {
  return error instanceof AnalyticsApiError && (status === undefined || error.status === status);
}
