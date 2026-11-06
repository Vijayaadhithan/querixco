import type { StorefrontID } from "./storefronts";
export type PortalUser = {
  id: string;
  name: string;
  role: "user" | "admin";
  enabled: number;
  must_change_password: number;
  storefronts: StorefrontID[];
  created_at: number;
  last_login: number | null;
};
export class PortalError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}
export async function portalRequest<T>(path: string, method = "GET", body?: unknown): Promise<T> {
  const response = await fetch(`/api/commerce/${path}`, {
    method,
    credentials: "same-origin",
    cache: "no-store",
    headers: { "content-type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new PortalError(result.error ?? "The request failed. Please try again.", response.status);
  return result;
}
export function clearPrivateBrowserState() {
  for (const storage of [sessionStorage, localStorage]) {
    for (const key of Object.keys(storage)) {
      if (key.startsWith("querix-commerce") || key.startsWith("querix-transfer"))
        storage.removeItem(key);
    }
  }
}
