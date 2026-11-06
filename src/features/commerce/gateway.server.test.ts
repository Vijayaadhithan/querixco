// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { handleCommerceRequest, type CommerceEnv } from "./gateway.server";
const env: CommerceEnv = {
  COMMERCE_API_URL: "http://127.0.0.1:8000",
  COMMERCE_API_TOKEN: "test-only-service-token",
  COMMERCE_SESSION_SECRET: "test-only-session-secret-longer-than-32-bytes",
};
const userToken = "test_user_session_" + "a".repeat(32);
const user = {
  id: "alice",
  name: "alice",
  role: "user",
  storefronts: ["beauty", "clothing", "footwear"],
  must_change_password: 0,
};
function mockUpstream(handler: (url: string, init: RequestInit) => Promise<Response>) {
  vi.stubGlobal("fetch", (url: string, init: RequestInit) =>
    url.endsWith("/portal/me") ? Promise.resolve(Response.json({ user })) : handler(url, init),
  );
}
const origin = "https://demo.example";
const cidA = "10000000-0000-4000-8000-000000000001";
const cidB = "10000000-0000-4000-8000-000000000002";
function req(
  path: string,
  method = "GET",
  cookie?: string,
  body?: unknown,
  headers?: Record<string, string>,
) {
  if (!path.includes("storefront=")) path += `${path.includes("?") ? "&" : "?"}storefront=beauty`;
  return new Request(`${origin}/api/commerce/${path}`, {
    method,
    headers: {
      origin,
      "content-type": "application/json",
      cookie: `querix_tester=${userToken}${cookie ? `; ${cookie}` : ""}`,
      ...headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}
function extractCookie(response: Response) {
  return response.headers.get("set-cookie")!.split(";")[0];
}
async function bootstrap() {
  mockUpstream(vi.fn());
  return extractCookie(await handleCommerceRequest(req("status"), env));
}
async function start(cid: string) {
  const initial = await bootstrap();
  mockUpstream(vi.fn().mockResolvedValue(Response.json({ id: cid, storefront_id: "beauty" })));
  return extractCookie(await handleCommerceRequest(req("session", "POST", initial), env));
}
afterEach(() => vi.unstubAllGlobals());
describe("commerce browser gateway", () => {
  it("keeps live mode explicitly unavailable without configuration", async () => {
    const result = await handleCommerceRequest(req("status"), {});
    expect(await result.json()).toEqual({ available: false });
    expect(result.headers.get("set-cookie")).toBeNull();
  });
  it("requires a signed session for catalog coverage and forwards the full overview", async () => {
    const summary = { product_count: 50000, indexed_product_count: 50000, categories: [] };
    const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(Response.json(summary)));
    mockUpstream(fetchMock);
    expect((await handleCommerceRequest(req("catalog"), env)).status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
    const cookie = await bootstrap();
    mockUpstream(fetchMock);
    const response = await handleCommerceRequest(req("catalog", "GET", cookie), env);
    expect(await response.json()).toEqual(summary);
    expect(fetchMock.mock.calls[0][0]).toBe("http://127.0.0.1:8000/catalog/summary");
    expect(response.headers.get("cache-control")).toContain("no-store");
  });
  it("restores the same browser session without creating another conversation", async () => {
    const cookie = await start(cidA);
    const fetchMock = vi.fn();
    mockUpstream(fetchMock);
    const first = await handleCommerceRequest(req("session", "POST", cookie), env);
    const restored = await handleCommerceRequest(req("session", "POST", extractCookie(first)), env);
    const data = await first.json();
    expect(data.ready).toBe(true);
    expect(data.session_id).toEqual(expect.any(String));
    expect(await restored.json()).toEqual(data);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("uses the Worker-compatible manual redirect mode and refuses upstream redirects", async () => {
    const cookie = await start(cidA);
    const fetchMock = vi.fn().mockResolvedValue(
      new Response("private redirect body", {
        status: 302,
        headers: { location: "https://other.example/private" },
      }),
    );
    mockUpstream(fetchMock);
    const result = await handleCommerceRequest(req("history", "GET", cookie), env);
    expect(fetchMock.mock.calls[0][1].redirect).toBe("manual");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result.status).toBe(502);
    expect(result.headers.get("location")).toBeNull();
    expect(await result.text()).not.toContain("private");
  });
  it("forwards a stream without buffering it and preserves the visitor retry scope", async () => {
    const cookie = await start(cidA);
    let writer: ReadableStreamDefaultController<Uint8Array>;
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        writer = controller;
      },
    });
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(body, { headers: { "content-type": "text/event-stream" } }));
    mockUpstream(fetchMock);
    const response = await handleCommerceRequest(
      req(
        "messages",
        "POST",
        cookie,
        { message: "shampoo" },
        {
          accept: "text/event-stream",
          "idempotency-key": "stream-key-123",
        },
      ),
      env,
    );
    expect(response.headers.get("content-type")).toContain("text/event-stream");
    expect(fetchMock.mock.calls[0][1].headers.accept).toBe("text/event-stream");
    expect(fetchMock.mock.calls[0][1].headers["idempotency-key"]).toMatch(/:stream-key-123$/);
    writer!.enqueue(new TextEncoder().encode('event: status\ndata: {"text":"Searching"}\n\n'));
    const reader = response.body!.getReader();
    expect(new TextDecoder().decode((await reader.read()).value)).toContain("Searching");
    writer!.close();
    expect((await reader.read()).done).toBe(true);
  });
  it("rejects cross-origin mutations before calling the backend", async () => {
    const fetchMock = vi.fn();
    mockUpstream(fetchMock);
    const result = await handleCommerceRequest(
      req("session", "POST", undefined, undefined, { origin: "https://foreign.example" }),
      env,
    );
    expect(result.status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("binds two visitors to distinct conversations and ignores supplied conversation IDs", async () => {
    const a = await start(cidA);
    const b = await start(cidB);
    const fetchMock = vi
      .fn()
      .mockImplementation(() => Promise.resolve(Response.json({ messages: [], next_after: 0 })));
    mockUpstream(fetchMock);
    await handleCommerceRequest(req(`history?conversation_id=${cidB}`, "GET", a), env);
    await handleCommerceRequest(req("history", "GET", b), env);
    expect(fetchMock.mock.calls[0][0]).toContain(`/conversations/${cidA}/messages`);
    expect(fetchMock.mock.calls[1][0]).toContain(`/conversations/${cidB}/messages`);
  });
  it("rejects a tampered cookie without accessing the backend", async () => {
    const cookie = await start(cidA);
    const fetchMock = vi.fn();
    mockUpstream(fetchMock);
    const result = await handleCommerceRequest(req("history", "GET", cookie + "x"), env);
    expect(result.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("retains the same create key after a lost response", async () => {
    const initial = await bootstrap();
    const fetchMock = vi
      .fn()
      .mockImplementation(() =>
        Promise.resolve(Response.json({ id: cidA, storefront_id: "beauty" })),
      );
    mockUpstream(fetchMock);
    await handleCommerceRequest(req("session", "POST", initial), env);
    await handleCommerceRequest(req("session", "POST", initial), env);
    expect(fetchMock.mock.calls[0][1].headers["idempotency-key"]).toBe(
      fetchMock.mock.calls[1][1].headers["idempotency-key"],
    );
  });
  it("keeps message retry keys stable and private to the visitor", async () => {
    const cookie = await start(cidA);
    const fetchMock = vi
      .fn()
      .mockImplementation(() => Promise.resolve(Response.json({ reply: "done" })));
    mockUpstream(fetchMock);
    for (let i = 0; i < 2; i++)
      await handleCommerceRequest(
        req(
          "messages",
          "POST",
          cookie,
          { message: "under $20" },
          { "idempotency-key": "retry-key-123" },
        ),
        env,
      );
    expect(fetchMock.mock.calls[0][1].headers["idempotency-key"]).toBe(
      fetchMock.mock.calls[1][1].headers["idempotency-key"],
    );
    expect(fetchMock.mock.calls[0][1].headers.authorization).toBe(`Bearer ${userToken}`);
  });
  it("sanitizes upstream failures and preserves retry guidance", async () => {
    const cookie = await start(cidA);
    mockUpstream(
      vi
        .fn()
        .mockResolvedValue(
          new Response("private failure details", { status: 429, headers: { "retry-after": "8" } }),
        ),
    );
    const result = await handleCommerceRequest(
      req("messages", "POST", cookie, { message: "hello" }, { "idempotency-key": "retry-key-123" }),
      env,
    );
    expect(result.status).toBe(429);
    expect(result.headers.get("retry-after")).toBe("8");
    expect(await result.text()).not.toContain("private failure details");
  });
  it("checks UTF-8 byte size and never forwards excessive messages", async () => {
    const cookie = await start(cidA);
    const fetchMock = vi.fn();
    mockUpstream(fetchMock);
    const result = await handleCommerceRequest(
      req(
        "messages",
        "POST",
        cookie,
        { message: "😀".repeat(1001) },
        { "idempotency-key": "retry-key-123" },
      ),
      env,
    );
    expect(result.status).toBe(422);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("deletes only the cookie-bound conversation and expires the cookie", async () => {
    const cookie = await start(cidA);
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    mockUpstream(fetchMock);
    const result = await handleCommerceRequest(req("session", "DELETE", cookie), env);
    expect(fetchMock.mock.calls[0][0]).toContain(`/conversations/${cidA}`);
    expect(result.headers.get("set-cookie")).toContain("Max-Age=0");
  });
});

describe("storefront session isolation", () => {
  async function scopedStart(scope: string, cid: string) {
    mockUpstream(vi.fn());
    const cookie = extractCookie(
      await handleCommerceRequest(req(`status?storefront=${scope}`), env),
    );
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ id: cid, storefront_id: scope }));
    mockUpstream(fetchMock);
    const response = await handleCommerceRequest(
      req(`session?storefront=${scope}`, "POST", cookie),
      env,
    );
    expect(response.status).toBe(200);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({
      mode: "commerce",
      storefront_id: scope,
    });
    return extractCookie(response);
  }
  it("restores each conversation even when all section cookies are present", async () => {
    const beauty = await scopedStart("beauty", cidA);
    const clothing = await scopedStart("clothing", cidB);
    const cookies = `${beauty}; ${clothing}`;
    const fetchMock = vi
      .fn()
      .mockImplementation(() => Promise.resolve(Response.json({ messages: [], next_after: 0 })));
    mockUpstream(fetchMock);
    await handleCommerceRequest(req("history?storefront=beauty", "GET", cookies), env);
    await handleCommerceRequest(req("history?storefront=clothing", "GET", cookies), env);
    expect(fetchMock.mock.calls.map((call) => call[0])).toEqual([
      `http://127.0.0.1:8000/conversations/${cidA}/messages?limit=100&after=0`,
      `http://127.0.0.1:8000/conversations/${cidB}/messages?limit=100&after=0`,
    ]);
    expect(
      (await handleCommerceRequest(req("history?storefront=footwear", "GET", cookies), env)).status,
    ).toBe(401);
    expect(
      (
        await handleCommerceRequest(
          new Request(`${origin}/api/commerce/history`, {
            headers: { cookie: `querix_tester=${userToken}; ${cookies}` },
          }),
          env,
        )
      ).status,
    ).toBe(403);
  });
  it("rejects a valid signed payload renamed for another section", async () => {
    const beauty = await scopedStart("beauty", cidA);
    const forged = beauty.replace("querix_commerce_beauty=", "querix_commerce_clothing=");
    const fetchMock = vi.fn();
    mockUpstream(fetchMock);
    expect(
      (await handleCommerceRequest(req("history?storefront=clothing", "GET", forged), env)).status,
    ).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("deletes only the selected section and clears only its cookie", async () => {
    const beauty = await scopedStart("beauty", cidA);
    const clothing = await scopedStart("clothing", cidB);
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ deleted: true }));
    mockUpstream(fetchMock);
    const response = await handleCommerceRequest(
      req("session?storefront=beauty", "DELETE", `${beauty}; ${clothing}`),
      env,
    );
    expect(fetchMock.mock.calls[0][0]).toBe(`http://127.0.0.1:8000/conversations/${cidA}`);
    expect(response.headers.get("set-cookie")).toContain("querix_commerce_beauty=;");
    expect(response.headers.get("set-cookie")).not.toContain("clothing");
  });
  it("refuses unknown, duplicate sections and an old backend that ignores scope", async () => {
    for (const query of [
      "storefront=unknown",
      "storefront=",
      "storefront=beauty&storefront=clothing",
    ])
      expect((await handleCommerceRequest(req(`status?${query}`), env)).status).toBe(400);
    mockUpstream(vi.fn());
    const cookie = extractCookie(await handleCommerceRequest(req("status?storefront=beauty"), env));
    mockUpstream(vi.fn().mockResolvedValue(Response.json({ id: cidA })));
    const oldBackend = await handleCommerceRequest(
      req("session?storefront=beauty", "POST", cookie),
      env,
    );
    expect(oldBackend.status).toBe(503);
    expect(oldBackend.headers.get("set-cookie")).toContain("Max-Age=0");
  });
});
