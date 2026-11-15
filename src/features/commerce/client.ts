import { commerceURL, type StorefrontID } from "./storefronts";
import {
  EMPTY_CONVERSATION,
  type CatalogSummary,
  type Commerce,
  type Conversation,
  type Message,
} from "./model";
export class CommerceError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly retryAfter: number,
  ) {
    super(message);
  }
}
async function request<T>(
  path: string,
  init: RequestInit = {},
  storefront?: StorefrontID,
): Promise<T> {
  const response = await fetch(commerceURL(path, storefront), {
    ...init,
    credentials: "same-origin",
    cache: "no-store",
    headers: { "content-type": "application/json", ...init.headers },
  });
  let data;
  try {
    data = await response.json();
  } catch {
    throw new CommerceError(
      "The local connection was interrupted. Retry to recover your response.",
      response.status,
      0,
    );
  }
  if (!response.ok)
    throw new CommerceError(
      data.error ?? "The request could not be completed.",
      response.status,
      Number(response.headers.get("retry-after") ?? 0),
    );
  return data as T;
}
export const liveStatus = (storefront?: StorefrontID) =>
  request<{ available: boolean; active?: boolean }>("status", {}, storefront);
export const loadCatalog = async (storefront?: StorefrontID) => {
  const summary = await request<CatalogSummary>("catalog", {}, storefront);
  if (!storefront) return summary;
  const section = summary.storefronts?.find((item) => item.id === storefront);
  if (!section)
    throw new CommerceError("Restart the local backend to enable shopping sections.", 503, 0);
  return {
    ...summary,
    product_count: section.product_count,
    indexed_product_count: section.product_count,
    categories: summary.categories.filter((item) => section.families.includes(item.family)),
  };
};
export async function connectLive(storefront?: StorefrontID): Promise<Conversation> {
  await liveStatus(storefront);
  const session = await request<{ session_id: string; conversation_id: string | null }>(
    "session",
    {
      method: "POST",
    },
    storefront,
  );
  const messages: Message[] = [];
  let after = 0;
  // Page until exhausted; the API returns history in ascending ID order.
  while (session.conversation_id) {
    const page = await request<{ messages: Message[]; next_after: number }>(
      `history?after=${after}`,
      {},
      storefront,
    );
    messages.push(...page.messages);
    if (page.messages.length < 100 || page.next_after <= after) break;
    after = page.next_after;
  }
  return {
    sessionId: session.session_id,
    conversationId: session.conversation_id ?? undefined,
    messages,
    preferences:
      [...messages].reverse().find((message) => message.commerce)?.commerce?.preferences ??
      EMPTY_CONVERSATION.preferences,
  };
}
export const startLive = (message: string, storefront?: StorefrontID, signal?: AbortSignal) =>
  request<{ session_id: string; conversation_id: string }>(
    "session/start",
    { method: "POST", body: JSON.stringify({ message }), signal },
    storefront,
  );
export type LiveReply = { reply: string; message_id: number; commerce: Commerce };
export type ChatEvent =
  | { type: "status"; text: string }
  | { type: "delta"; text: string }
  | { type: "commerce"; commerce: Commerce };
export async function sendLive(
  message: string,
  key: string,
  onEvent: (event: ChatEvent) => void,
  signal?: AbortSignal,
  storefront?: StorefrontID,
): Promise<LiveReply> {
  const response = await fetch(commerceURL("messages", storefront), {
    method: "POST",
    credentials: "same-origin",
    cache: "no-store",
    signal,
    headers: {
      "content-type": "application/json",
      accept: "text/event-stream",
      "idempotency-key": key,
    },
    body: JSON.stringify({ message }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new CommerceError(
      data.error ?? "The connection was interrupted. Retry your message.",
      response.status,
      Number(response.headers.get("retry-after") ?? 0),
    );
  }
  // Compatibility with a backend that has not yet been restarted after upgrading.
  if (!response.headers.get("content-type")?.includes("text/event-stream")) return response.json();
  if (!response.body) throw new CommerceError("The response stream was interrupted.", 503, 0);
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value, { stream: !done }).replaceAll("\r", "");
      let end: number;
      while ((end = buffer.indexOf("\n\n")) >= 0) {
        const frame = buffer.slice(0, end);
        buffer = buffer.slice(end + 2);
        const name = frame
          .split("\n")
          .find((line) => line.startsWith("event:"))
          ?.slice(6)
          .trim();
        const raw = frame
          .split("\n")
          .filter((line) => line.startsWith("data:"))
          .map((line) => line.slice(5).trimStart())
          .join("\n");
        if (!raw) continue;
        const data = JSON.parse(raw);
        if (name === "done") return data as LiveReply;
        if (name === "error")
          throw new CommerceError(data.error, data.status, data.retry_after ?? 0);
        if (name === "status" || name === "delta") onEvent({ type: name, text: data.text });
        if (name === "commerce") onEvent({ type: "commerce", commerce: data });
      }
      if (done)
        throw new CommerceError(
          "The response was interrupted. Recover it using the same message.",
          503,
          0,
        );
    }
  } finally {
    await reader.cancel().catch(() => undefined);
    reader.releaseLock();
  }
}
export const deleteLive = (storefront?: StorefrontID) =>
  request("session", { method: "DELETE" }, storefront);

export type SavedConversation = {
  id: string;
  title: string;
  updated_at: string;
  storefront_id: StorefrontID;
  is_empty?: boolean;
};
export const listLive = (storefront: StorefrontID, offset = 0) =>
  request<{ conversations: SavedConversation[] }>(`conversations?offset=${offset}`, {}, storefront);
export const newLive = (storefront?: StorefrontID) =>
  request("session/new", { method: "POST" }, storefront);
export const openLive = (id: string, storefront: StorefrontID) =>
  request(`session/open?id=${encodeURIComponent(id)}`, { method: "POST" }, storefront);
export const deleteSavedLive = (id: string, storefront: StorefrontID) =>
  request<{ deleted: boolean; active: boolean }>(
    `conversation?id=${encodeURIComponent(id)}`,
    { method: "DELETE" },
    storefront,
  );
