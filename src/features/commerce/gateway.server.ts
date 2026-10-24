/** Server-only proxy. The browser can address only the conversation in its signed cookie. */
export type CommerceEnv = {
  COMMERCE_API_URL?: string;
  COMMERCE_API_TOKEN?: string;
  COMMERCE_SESSION_SECRET?: string;
};
import { isStorefront, type StorefrontID } from "./storefronts";
type Session = { sid: string; cid?: string; expires: number; storefront?: StorefrontID };
const COOKIE = "querix_commerce";
const AGE = 60 * 60 * 24;
const encoder = new TextEncoder();
function json(value: unknown, status = 200, headers?: HeadersInit) {
  return Response.json(value, {
    status,
    headers: {
      "cache-control": "private, no-store",
      "x-robots-tag": "noindex",
      ...Object.fromEntries(new Headers(headers)),
    },
  });
}
function configured(env: CommerceEnv) {
  try {
    const url = new URL(env.COMMERCE_API_URL ?? "");
    return Boolean(
      env.COMMERCE_API_TOKEN &&
      (env.COMMERCE_SESSION_SECRET?.length ?? 0) >= 32 &&
      !url.username &&
      !url.password &&
      (url.protocol === "https:" ||
        (url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname))),
    );
  } catch {
    return false;
  }
}
async function signingKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}
async function seal(session: Session, secret: string) {
  const payload = btoa(JSON.stringify(session));
  const signature = await crypto.subtle.sign(
    "HMAC",
    await signingKey(secret),
    encoder.encode(payload),
  );
  return `${payload}.${btoa(String.fromCharCode(...new Uint8Array(signature)))}`;
}
async function readSession(
  request: Request,
  secret: string,
  storefront?: StorefrontID,
): Promise<Session | null> {
  const name = COOKIE + (storefront ? `_${storefront}` : "");
  try {
    const cookie = request.headers
      .get("cookie")
      ?.split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${name}=`))
      ?.slice(name.length + 1);
    if (!cookie || cookie.length > 1200) return null;
    const [payload, signature, extra] = cookie.split(".");
    if (!payload || !signature || extra) return null;
    if (
      !(await crypto.subtle.verify(
        "HMAC",
        await signingKey(secret),
        Uint8Array.from(atob(signature), (c) => c.charCodeAt(0)),
        encoder.encode(payload),
      ))
    )
      return null;
    const session = JSON.parse(atob(payload)) as Session;
    const uuid = /^[a-f0-9-]{36}$/i;
    return session.storefront === storefront &&
      uuid.test(session.sid) &&
      (!session.cid || uuid.test(session.cid)) &&
      session.expires > Date.now()
      ? session
      : null;
  } catch {
    return null;
  }
}
function cookie(request: Request, value: string, age = AGE) {
  const scope = new URL(request.url).searchParams.get("storefront");
  const name = COOKIE + (scope ? `_${scope}` : "");
  return `${name}=${value}; Path=/api/commerce; HttpOnly; SameSite=Strict; Max-Age=${age}${new URL(request.url).protocol === "https:" ? "; Secure" : ""}`;
}
function upstream(env: CommerceEnv, path: string, init: RequestInit = {}) {
  return fetch(`${env.COMMERCE_API_URL!.replace(/\/$/, "")}${path}`, {
    ...init,
    redirect: "manual",
    headers: {
      authorization: `Bearer ${env.COMMERCE_API_TOKEN}`,
      "content-type": "application/json",
      ...Object.fromEntries(new Headers(init.headers)),
    },
    signal: AbortSignal.timeout(480_000),
  });
}
async function safeResponse(response: Response) {
  if (response.status >= 300 && response.status < 400)
    return json({ error: "The commerce origin returned an unexpected redirect." }, 502);
  if (response.ok) return json(await response.json());
  const messages: Record<number, string> = {
    401: "The commerce connection needs attention. Your API credentials stay on the server.",
    404: "This conversation is no longer available. Start a new conversation.",
    409: "The previous request may still be processing. Retry the same message shortly.",
    422: "Please check your message and try again.",
    429: "The demo is busy. Please wait before retrying.",
    503: "The commerce service is temporarily unavailable. You can retry or choose the sample walkthrough.",
  };
  const status = response.status === 401 ? 503 : response.status >= 500 ? 503 : response.status;
  const retry = response.headers.get("retry-after");
  return json(
    {
      error: messages[response.status] ?? "The request could not be completed. Please try again.",
    },
    status,
    retry && /^\d+$/.test(retry) ? { "retry-after": retry } : undefined,
  );
}
async function messageBody(request: Request): Promise<{ message: string } | null> {
  if (!request.headers.get("content-type")?.startsWith("application/json")) return null;
  const reader = request.body?.getReader();
  if (!reader) return null;
  let bytes = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    bytes += value.length;
    if (bytes > 16_384) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  try {
    const buffer = new Uint8Array(bytes);
    let offset = 0;
    for (const chunk of chunks) {
      buffer.set(chunk, offset);
      offset += chunk.length;
    }
    const body = JSON.parse(new TextDecoder().decode(buffer));
    return typeof body.message === "string" &&
      body.message.trim() &&
      encoder.encode(body.message).length <= 4000
      ? { message: body.message }
      : null;
  } catch {
    return null;
  }
}
export async function handleCommerceRequest(request: Request, env: CommerceEnv): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;
  const value = url.searchParams.get("storefront");
  if ((value !== null && !isStorefront(value)) || url.searchParams.getAll("storefront").length > 1)
    return json({ error: "Unknown shopping section" }, 400);
  const storefront = value as StorefrontID | undefined | null;
  if (!["GET", "POST", "DELETE"].includes(request.method))
    return json({ error: "Method not allowed" }, 405);
  if (request.method !== "GET" && request.headers.get("origin") !== url.origin)
    return json({ error: "Origin not allowed" }, 403);
  if (!configured(env))
    return path === "/api/commerce/status" && request.method === "GET"
      ? json({ available: false })
      : json(
          {
            error: "Live mode is not configured yet. The sample walkthrough is available.",
          },
          503,
        );
  let session = await readSession(request, env.COMMERCE_SESSION_SECRET!, storefront ?? undefined);
  if (path === "/api/commerce/status" && request.method === "GET") {
    if (!session)
      session = {
        sid: crypto.randomUUID(),
        expires: Date.now() + AGE * 1000,
        ...(storefront ? { storefront } : {}),
      };
    return json({ available: true, active: Boolean(session.cid) }, 200, {
      "set-cookie": cookie(request, await seal(session, env.COMMERCE_SESSION_SECRET!)),
    });
  }
  if (!session)
    return json({ error: "Your demo session expired. Reconnect to start a new one." }, 401);
  try {
    if (path === "/api/commerce/catalog" && request.method === "GET") {
      return safeResponse(await upstream(env, "/catalog/summary"));
    }
    if (path === "/api/commerce/session" && request.method === "POST") {
      if (!session.cid) {
        const response = await upstream(env, "/conversations", {
          method: "POST",
          headers: { "idempotency-key": `web-create:${session.sid}` },
          body: JSON.stringify({
            title: "Querix shopping demo",
            mode: "commerce",
            ...(storefront ? { storefront_id: storefront } : {}),
          }),
        });
        if (!response.ok) return safeResponse(response);
        const record = (await response.json()) as { id?: string; storefront_id?: string };
        if (!record.id || !/^[a-f0-9-]{36}$/i.test(record.id))
          return json({ error: "The commerce service returned an invalid session." }, 502);
        if (storefront && record.storefront_id !== storefront)
          return json(
            { error: "Restart the local backend to enable isolated shopping sections." },
            503,
            { "set-cookie": cookie(request, "", 0) },
          );
        session.cid = record.id;
      }
      return json({ ready: true, session_id: session.sid }, 200, {
        "set-cookie": cookie(request, await seal(session, env.COMMERCE_SESSION_SECRET!)),
      });
    }
    if (path === "/api/commerce/session" && request.method === "DELETE") {
      if (session.cid) {
        const response = await upstream(env, `/conversations/${session.cid}`, {
          method: "DELETE",
        });
        if (!response.ok && response.status !== 404) return safeResponse(response);
      }
      return json({ deleted: true }, 200, {
        "set-cookie": cookie(request, "", 0),
      });
    }
    if (!session.cid) return json({ error: "Start a conversation first." }, 409);
    if (path === "/api/commerce/history" && request.method === "GET") {
      const after = url.searchParams.get("after") ?? "0";
      if (!/^\d{1,12}$/.test(after)) return json({ error: "Invalid history cursor" }, 400);
      return safeResponse(
        await upstream(env, `/conversations/${session.cid}/messages?limit=100&after=${after}`),
      );
    }
    if (path === "/api/commerce/messages" && request.method === "POST") {
      const key = request.headers.get("idempotency-key") ?? "";
      if (!/^[A-Za-z0-9._:-]{8,64}$/.test(key))
        return json({ error: "A valid request key is required." }, 400);
      const body = await messageBody(request);
      if (!body)
        return json({ error: "Please enter a message of at most 4,000 UTF-8 bytes." }, 422);
      const streaming = request.headers.get("accept")?.includes("text/event-stream");
      const response = await upstream(env, `/conversations/${session.cid}/messages`, {
        method: "POST",
        headers: {
          "idempotency-key": `${session.sid}:${key}`,
          accept: streaming ? "text/event-stream" : "application/json",
        },
        body: JSON.stringify(body),
      });
      if (
        streaming &&
        response.ok &&
        response.headers.get("content-type")?.includes("text/event-stream")
      ) {
        return new Response(response.body, {
          headers: {
            "content-type": "text/event-stream; charset=utf-8",
            "cache-control": "private, no-store",
            "x-accel-buffering": "no",
            "x-robots-tag": "noindex",
          },
        });
      }
      return safeResponse(response);
    }
    return json({ error: "Not found" }, 404);
  } catch (error) {
    const diagnostic = error instanceof Error ? error.message : "Unknown transport error";
    console.error(
      "Commerce gateway transport:",
      diagnostic
        .replaceAll(env.COMMERCE_API_TOKEN!, "[redacted]")
        .replaceAll(env.COMMERCE_SESSION_SECRET!, "[redacted]"),
    );
    return json(
      {
        error:
          "The commerce service did not respond. Retry with the same request; your message may already have completed.",
      },
      503,
    );
  }
}
