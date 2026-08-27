import { afterEach, describe, expect, it, vi } from "vitest";

import { getCompanyQueries, getInternalQueries, login } from "./endpoints";

const emptyFacets = {
  request_kinds: [],
  outcomes: [],
  categories: [],
  cities: [],
  subcategories: [],
  ad_types: [],
  execution_paths: [],
  languages: [],
  diagnostic_codes: [],
};

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json" },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("analytics API contract", () => {
  it("sends login credentials in a cookie-enabled JSON request", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        user: { username: "operator", role: "internal_admin", company_id: null },
        expires_at: "2026-08-10T00:00:00Z",
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await login("internal", "operator", "secret");

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(/\/api\/v1\/analytics\/internal\/auth\/login$/);
    expect(init.credentials).toBe("include");
    expect(init.method).toBe("POST");
    expect(JSON.parse(String(init.body))).toEqual({
      username: "operator",
      password: "secret",
    });
  });

  it("binds company login to the encoded company endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        user: { username: "owner", role: "company_user", company_id: "gainr/company" },
        expires_at: "2026-08-10T00:00:00Z",
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await login("company", "owner", "secret", "gainr/company");

    const [rawUrl] = fetchMock.mock.calls[0] as [string];
    expect(new URL(rawUrl).pathname).toBe("/api/v1/gainr%2Fcompany/analytics/auth/login");
  });

  it("rejects a query page returned for a different company", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        company_id: "acme",
        returned: 0,
        has_more: false,
        next_cursor: null,
        facets: emptyFacets,
        items: [],
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      getCompanyQueries(
        "gainr",
        {
          sortBy: "created_at",
          sortDirection: "desc",
          query: "",
          outcome: "",
          category: "",
          executionPath: "",
          language: "",
          includeFilteredResults: false,
          requestKind: "",
          cityId: "",
          subcategoryId: "",
          adType: "",
          diagnosticCode: "",
          hasFilters: false,
          from: "",
          to: "",
        },
        null,
      ),
    ).rejects.toThrow("different company");
  });

  it("encodes internal query filters, UTC day boundaries, and cursor", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        company_id: "gainr/company",
        returned: 1,
        has_more: false,
        next_cursor: null,
        facets: emptyFacets,
        items: [
          {
            request_id: "req-1",
            query: "bike",
            created_at: "2026-08-09T10:00:00Z",
            outcome: "fulfilled",
          },
        ],
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await getInternalQueries(
      "gainr/company",
      {
        sortBy: "results",
        sortDirection: "desc",
        query: "bike & car",
        outcome: "fulfilled",
        category: "Vehicles",
        requestKind: "search",
        cityId: "12",
        subcategoryId: "34",
        adType: "offer",
        executionPath: "semantic",
        language: "en",
        diagnosticCode: "city_filter_no_candidates",
        hasFilters: true,
        includeFilteredResults: true,
        from: "2026-08-01",
        to: "2026-08-09",
      },
      "next token",
    );

    const [rawUrl] = fetchMock.mock.calls[0] as [string];
    const url = new URL(rawUrl);
    expect(url.pathname).toBe("/api/v1/admin/analytics/gainr%2Fcompany/queries");
    expect(Object.fromEntries(url.searchParams)).toMatchObject({
      limit: "50",
      sort_by: "results",
      sort_direction: "desc",
      cursor: "next token",
      query: "bike & car",
      outcome: "fulfilled",
      category: "Vehicles",
      request_kind: "search",
      city_id: "12",
      subcategory_id: "34",
      ad_type: "offer",
      execution_path: "semantic",
      language: "en",
      diagnostic_code: "city_filter_no_candidates",
      has_filters: "true",
      include_filtered_results: "true",
      from: new Date("2026-08-01T00:00:00.000").toISOString(),
      to: new Date("2026-08-09T23:59:59.999").toISOString(),
    });
  });

  it("retries one transient GET failure and then decodes the response", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ detail: "warming" }, 503))
      .mockResolvedValueOnce(
        jsonResponse({
          company_id: "gainr",
          returned: 0,
          has_more: false,
          next_cursor: null,
          facets: emptyFacets,
          items: [],
        }),
      );
    vi.stubGlobal("fetch", fetchMock);

    const result = await getInternalQueries(
      "gainr",
      {
        sortBy: "created_at",
        sortDirection: "desc",
        query: "",
        outcome: "",
        category: "",
        requestKind: "",
        cityId: "",
        subcategoryId: "",
        adType: "",
        executionPath: "",
        language: "",
        diagnosticCode: "",
        hasFilters: false,
        includeFilteredResults: false,
        from: "",
        to: "",
      },
      null,
    );

    expect(result.returned).toBe(0);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
