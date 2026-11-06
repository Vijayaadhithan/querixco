import type { CommerceEnv } from "./gateway.server";

const COOKIE = "querix_tester";
const SESSION_AGE = 8 * 3600;
export function portalToken(request: Request) {
  const value = request.headers
    .get("cookie")
    ?.split(";")
    .map((p) => p.trim())
    .find((p) => p.startsWith(`${COOKIE}=`))
    ?.slice(COOKIE.length + 1);
  return value && /^[A-Za-z0-9_-]{40,128}$/.test(value) ? value : null;
}
function sessionCookie(request: Request, value: string, age = SESSION_AGE) {
  return `${COOKIE}=${value}; Path=/api/commerce; HttpOnly; SameSite=Strict; Max-Age=${age}${new URL(request.url).protocol === "https:" ? "; Secure" : ""}`;
}
function portalJSON(body: unknown, status = 200, headers?: HeadersInit) {
  return Response.json(body, {
    status,
    headers: {
      "cache-control": "private, no-store",
      "x-robots-tag": "noindex",
      ...Object.fromEntries(new Headers(headers)),
    },
  });
}
export async function portalUpstream(
  env: CommerceEnv,
  token: string,
  path: string,
  init: RequestInit = {},
) {
  return fetch(`${env.COMMERCE_API_URL!.replace(/\/$/, "")}${path}`, {
    ...init,
    redirect: "manual",
    signal: AbortSignal.timeout(30_000),
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
  });
}
export async function portalResponse(response: Response) {
  if (response.status >= 300 && response.status < 400)
    return portalJSON({ error: "Unexpected service redirect" }, 502);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const retry = response.headers.get("retry-after");
    return portalJSON(
      {
        error:
          response.status >= 500
            ? "The service is unavailable. Please try again."
            : typeof body.detail === "string"
              ? body.detail
              : "Check your account details and try again.",
      },
      response.status,
      retry && /^\d+$/.test(retry) ? { "retry-after": retry } : undefined,
    );
  }
  return portalJSON(body, response.status);
}
async function boundedBody(request: Request) {
  if (!request.headers.get("content-type")?.startsWith("application/json")) return null;
  const reader = request.body?.getReader();
  if (!reader) return null;
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 8192) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const buffer = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    buffer.set(chunk, offset);
    offset += chunk.length;
  }
  try {
    return JSON.parse(new TextDecoder().decode(buffer));
  } catch {
    return null;
  }
}
export async function handlePortalRequest(request: Request, env: CommerceEnv) {
  const url = new URL(request.url);
  const path = url.pathname.replace("/api/commerce", "");
  const token = portalToken(request);
  if (path === "/auth/login" && request.method === "POST") {
    const body = await boundedBody(request);
    if (!body || typeof body.username !== "string" || typeof body.password !== "string")
      return portalJSON({ error: "Enter your username and password" }, 422);
    const response = await portalUpstream(env, env.COMMERCE_API_TOKEN!, "/portal/login", {
      method: "POST",
      body: JSON.stringify({ username: body.username, password: body.password }),
    });
    if (!response.ok) return await portalResponse(response);
    const result = await response.json();
    if (!/^[A-Za-z0-9_-]{40,128}$/.test(result.token ?? ""))
      return portalJSON({ error: "Invalid login response" }, 502);
    return portalJSON({ user: result.user }, 200, {
      "set-cookie": sessionCookie(request, result.token),
    });
  }
  if (!token) return portalJSON({ error: "Sign in to continue" }, 401);
  if (path === "/auth/logout" && request.method === "POST") {
    const response = await portalUpstream(env, token, "/portal/logout", { method: "POST" });
    if (!response.ok && response.status !== 401) return await portalResponse(response);
    return portalJSON({ logged_out: true }, 200, { "set-cookie": sessionCookie(request, "", 0) });
  }
  if (path === "/auth/me" && request.method === "GET")
    return await portalResponse(await portalUpstream(env, token, "/portal/me"));
  if (path === "/auth/password" && request.method === "POST") {
    const body = await boundedBody(request);
    if (!body) return portalJSON({ error: "Enter your current and new password" }, 422);
    const response = await portalUpstream(env, token, "/portal/password", {
      method: "POST",
      body: JSON.stringify(body),
    });
    const safe = await portalResponse(response);
    if (safe.ok) safe.headers.set("set-cookie", sessionCookie(request, "", 0));
    return safe;
  }
  const match = /^\/admin\/(users(?:\/[a-f0-9-]{36}(?:\/password)?)?|audit)$/.exec(path);
  if (!match) return portalJSON({ error: "Not found" }, 404);
  let body;
  if (request.method === "POST" && !path.endsWith("/password")) {
    body = await boundedBody(request);
    if (!body) return portalJSON({ error: "Check the account fields" }, 422);
  }
  const query =
    request.method === "DELETE" && url.searchParams.get("purge_history") === "true"
      ? "?purge_history=true"
      : "";
  return await portalResponse(
    await portalUpstream(env, token, `/portal/${match[1]}${query}`, {
      method: request.method,
      ...(body ? { body: JSON.stringify(body) } : {}),
    }),
  );
}
