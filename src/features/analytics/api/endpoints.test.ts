import { afterEach, describe, expect, it, vi } from "vitest";

import { getInternalQueries, login } from "./endpoints";

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

  it("encodes internal query filters, UTC day boundaries, and cursor", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        company_id: "gainr",
        returned: 1,
        has_more: false,
        next_cursor: null,
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
        query: "bike & car",
        outcome: "fulfilled",
        category: "Vehicles",
        executionPath: "semantic",
        language: "en",
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
      cursor: "next token",
      query: "bike & car",
      outcome: "fulfilled",
      category: "Vehicles",
      execution_path: "semantic",
      language: "en",
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
          items: [],
        }),
      );
    vi.stubGlobal("fetch", fetchMock);

    const result = await getInternalQueries(
      "gainr",
      {
        query: "",
        outcome: "",
        category: "",
        executionPath: "",
        language: "",
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
