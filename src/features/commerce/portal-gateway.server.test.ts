// @vitest-environment node
import { afterEach, expect, it, vi } from "vitest";
import { handleCommerceRequest, type CommerceEnv } from "./gateway.server";
const origin = "https://demo.example";
const token = "testing_portal_" + "b".repeat(32);
const env: CommerceEnv = {
  COMMERCE_API_URL: "http://127.0.0.1:8000",
  COMMERCE_API_TOKEN: "test".repeat(12),
  COMMERCE_SESSION_SECRET: "test".repeat(12),
};
const user = {
  id: "alice",
  name: "alice",
  role: "user",
  storefronts: ["beauty"],
  must_change_password: 0,
};
function req(path: string, method = "GET", body?: unknown, cookie = `querix_tester=${token}`) {
  return new Request(`${origin}/api/commerce/${path}`, {
    method,
    headers: { origin, cookie, "content-type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}
afterEach(() => vi.unstubAllGlobals());
it("rejects anonymous commerce and legacy browser cookies", async () => {
  const fetcher = vi.fn();
  vi.stubGlobal("fetch", fetcher);
  for (const cookie of ["", "querix_commerce_beauty=old-signed-cookie"])
    expect(
      (await handleCommerceRequest(req("status?storefront=beauty", "GET", undefined, cookie), env))
        .status,
    ).toBe(401);
  expect(fetcher).not.toHaveBeenCalled();
});
it("keeps exchanged credentials in a secure HttpOnly cookie and never returns the token", async () => {
  const fetcher = vi.fn().mockResolvedValue(Response.json({ token, user }));
  vi.stubGlobal("fetch", fetcher);
  const response = await handleCommerceRequest(
    req("auth/login", "POST", { username: "alice", password: "test-password-only" }),
    env,
  );
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ user });
  const cookie = response.headers.get("set-cookie")!;
  for (const flag of [
    "HttpOnly",
    "Secure",
    "SameSite=Strict",
    "Path=/api/commerce",
    "Max-Age=28800",
  ])
    expect(cookie).toContain(flag);
  expect(fetcher.mock.calls[0][1].headers.authorization).toBe(`Bearer ${env.COMMERCE_API_TOKEN}`);
});
it("blocks cross-origin password changes and login", async () => {
  const fetcher = vi.fn();
  vi.stubGlobal("fetch", fetcher);
  for (const path of ["auth/login", "auth/password", "admin/users"]) {
    const request = req(path, "POST", {});
    request.headers.set("origin", "https://untrusted.example");
    expect((await handleCommerceRequest(request, env)).status).toBe(403);
  }
  expect(fetcher).not.toHaveBeenCalled();
});
it("uses only the logged-in user's token for admin endpoints", async () => {
  const fetcher = vi
    .fn()
    .mockResolvedValue(Response.json({ detail: "Administrator access required" }, { status: 403 }));
  vi.stubGlobal("fetch", fetcher);
  expect((await handleCommerceRequest(req("admin/users"), env)).status).toBe(403);
  expect(fetcher.mock.calls[0][0]).toContain("/portal/users");
  expect(fetcher.mock.calls[0][1].headers.authorization).toBe(`Bearer ${token}`);
});
it("denies revoked categories and password-change-required sessions before shopping calls", async () => {
  for (const profile of [
    { ...user, storefronts: [] },
    { ...user, must_change_password: 1 },
  ]) {
    const fetcher = vi.fn().mockResolvedValue(Response.json({ user: profile }));
    vi.stubGlobal("fetch", fetcher);
    expect((await handleCommerceRequest(req("status?storefront=beauty"), env)).status).toBe(403);
    expect(fetcher).toHaveBeenCalledTimes(1);
  }
});
it("does not reuse another user's signed conversation cookie after account switching", async () => {
  let profile = user;
  const fetcher = vi
    .fn()
    .mockImplementation(() => Promise.resolve(Response.json({ user: profile })));
  vi.stubGlobal("fetch", fetcher);
  const initial = await handleCommerceRequest(req("status?storefront=beauty"), env);
  const conversationCookie = initial.headers.get("set-cookie")!.split(";")[0];
  profile = { ...user, id: "bob" };
  const response = await handleCommerceRequest(
    req(
      "history?storefront=beauty",
      "GET",
      undefined,
      `querix_tester=${token}; ${conversationCookie}`,
    ),
    env,
  );
  expect(response.status).toBe(401);
  expect(fetcher.mock.calls.every(([url]) => url.endsWith("/portal/me"))).toBe(true);
});
it("logs out expired sessions and removes the browser token", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(Response.json({ detail: "Expired" }, { status: 401 })),
  );
  const response = await handleCommerceRequest(req("auth/logout", "POST"), env);
  expect(response.status).toBe(200);
  expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
});
it("preserves login rate limits and rejects oversized login requests", async () => {
  const fetcher = vi
    .fn()
    .mockResolvedValue(
      Response.json({ detail: "Try later" }, { status: 429, headers: { "retry-after": "900" } }),
    );
  vi.stubGlobal("fetch", fetcher);
  const response = await handleCommerceRequest(
    req("auth/login", "POST", { username: "alice", password: "wrong" }),
    env,
  );
  expect(response.status).toBe(429);
  expect(response.headers.get("retry-after")).toBe("900");
  fetcher.mockClear();
  expect(
    (
      await handleCommerceRequest(
        req("auth/login", "POST", { username: "alice", password: "x".repeat(9000) }),
        env,
      )
    ).status,
  ).toBe(422);
  expect(fetcher).not.toHaveBeenCalled();
});
it("starts a new chat without deleting saved history and checks ownership when reopening", async () => {
  const fetcher = vi
    .fn()
    .mockImplementation((url: string) =>
      Promise.resolve(
        url.endsWith("/portal/me")
          ? Response.json({ user })
          : Response.json({ detail: "Conversation not found" }, { status: 404 }),
      ),
    );
  vi.stubGlobal("fetch", fetcher);
  const initial = await handleCommerceRequest(req("status?storefront=beauty"), env);
  const cookies = `querix_tester=${token}; ${initial.headers.get("set-cookie")!.split(";")[0]}`;
  const response = await handleCommerceRequest(
    req("session/new?storefront=beauty", "POST", undefined, cookies),
    env,
  );
  expect(response.status).toBe(200);
  expect(fetcher.mock.calls.every(([url]) => url.endsWith("/portal/me"))).toBe(true);
  const open = await handleCommerceRequest(
    req(
      "session/open?storefront=beauty&id=10000000-0000-4000-8000-000000000001",
      "POST",
      undefined,
      cookies,
    ),
    env,
  );
  expect(open.status).toBe(404);
});
