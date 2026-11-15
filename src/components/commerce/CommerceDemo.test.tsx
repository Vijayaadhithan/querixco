import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { CommerceDemo } from "./CommerceDemo";
import * as client from "@/features/commerce/client";
import { SAMPLE_PRODUCTS } from "@/features/commerce/sample";
import { PortalContext } from "@/features/commerce/portal-context";
import type { Conversation } from "@/features/commerce/model";
vi.mock("@/features/commerce/client", async (original) => ({
  ...(await original<typeof client>()),
  liveStatus: vi.fn(),
  connectLive: vi.fn(),
  loadCatalog: vi.fn(),
  sendLive: vi.fn(),
  startLive: vi.fn(),
  deleteSavedLive: vi.fn(),
  listLive: vi.fn(),
  openLive: vi.fn(),
  newLive: vi.fn(),
  deleteLive: vi.fn(),
}));
let root: Root;
let element: HTMLDivElement;
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  HTMLElement.prototype.scrollTo = vi.fn();
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.open = true;
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.open = false;
  });
  sessionStorage.clear();
  element = document.createElement("div");
  document.body.append(element);
  root = createRoot(element);
  vi.mocked(client.liveStatus).mockResolvedValue({ available: true });
  vi.mocked(client.connectLive).mockResolvedValue({
    sessionId: "test-session",
    messages: [],
    preferences: { tasks: [] },
  });
  vi.mocked(client.loadCatalog).mockResolvedValue({
    product_count: 50000,
    indexed_product_count: 50000,
    categories: [],
    price_context: "historical USD",
  });
  vi.mocked(client.startLive).mockResolvedValue({
    session_id: "test-session",
    conversation_id: "test-session",
  });
  vi.mocked(client.deleteSavedLive).mockResolvedValue({ deleted: true, active: false });
  vi.mocked(client.listLive).mockResolvedValue({ conversations: [] });
  vi.mocked(client.openLive).mockResolvedValue({});
  vi.mocked(client.newLive).mockResolvedValue({});
  vi.mocked(client.deleteLive).mockResolvedValue({});
});
afterEach(async () => {
  await act(async () => root.unmount());
  element.remove();
  vi.resetAllMocks();
  vi.unstubAllGlobals();
});
it("keeps products in each chat turn and scopes actions to the latest response", async () => {
  const commerce = {
    action: "recommend",
    products: SAMPLE_PRODUCTS.slice(0, 2),
    preferences: { active_task_id: 1, tasks: [{ id: 1, query: "moisturizer", filters: {} }] },
  };
  vi.mocked(client.sendLive).mockResolvedValueOnce({
    message_id: 2,
    reply: "For your request: moisturizer.\n1. First option",
    commerce,
  });
  vi.mocked(client.sendLive).mockResolvedValueOnce({
    message_id: 4,
    reply: "Compare these listings.",
    commerce: { ...commerce, action: "compare" },
  });
  await act(async () => root.render(<CommerceDemo />));
  const starter = [...element.querySelectorAll<HTMLButtonElement>("button")].find((button) =>
    button.textContent?.includes("A little care for dry skin"),
  )!;
  await act(async () => starter.click());
  expect(element.querySelectorAll(".chat-turn.assistant .commerce-product")).toHaveLength(2);
  expect(element.querySelector(".commerce-results")).toBeNull();
  const compare = [...element.querySelectorAll<HTMLButtonElement>("button")].find(
    (button) => button.textContent === "Compare first two",
  )!;
  await act(async () => compare.click());
  expect(element.querySelectorAll(".chat-turn.assistant")).toHaveLength(2);
  expect(element.querySelectorAll(".chat-turn.assistant .commerce-product")).toHaveLength(4);
  expect(element.querySelectorAll(".commerce-comparison")).toHaveLength(1);
  expect(
    element.querySelector(".chat-turn.assistant")?.querySelector(".chat-suggestions"),
  ).toBeNull();
  expect(client.sendLive).toHaveBeenLastCalledWith(
    "Compare the first two in task 1",
    expect.any(String),
    expect.any(Function),
    expect.any(AbortSignal),
    undefined,
  );
});

it("keeps scoped routes live and sends every request with the selected section", async () => {
  sessionStorage.setItem("querix-commerce-mode-v1", "sample");
  vi.mocked(client.sendLive).mockResolvedValue({
    message_id: 2,
    reply: "Who is this for?",
    commerce: { action: "clarify", products: [], preferences: { tasks: [] } },
  });
  await act(async () => root.render(<CommerceDemo storefront="clothing" />));
  expect(client.liveStatus).toHaveBeenCalledWith("clothing");
  expect(client.connectLive).toHaveBeenCalledWith("clothing");
  expect(client.loadCatalog).toHaveBeenCalledWith("clothing");
  expect(element.querySelector('a[aria-current="page"]')?.getAttribute("href")).toBe("/clothing");
  expect(element.textContent).not.toContain("Try sample");
  const button = [...element.querySelectorAll<HTMLButtonElement>("button")].find((item) =>
    item.textContent?.includes("A cotton shirt"),
  )!;
  await act(async () => button.click());
  expect(client.sendLive).toHaveBeenCalledWith(
    "A cotton shirt for men under $40",
    expect.any(String),
    expect.any(Function),
    expect.any(AbortSignal),
    "clothing",
  );
});
it("offers a handoff with only the literal request and prefills the destination", async () => {
  vi.mocked(client.connectLive).mockResolvedValue({
    sessionId: "beauty-session",
    preferences: { tasks: [] },
    messages: [
      {
        id: 2,
        role: "assistant",
        content: "Continue in clothing.",
        commerce: {
          action: "handoff",
          products: [],
          preferences: { tasks: [] },
          handoff: {
            targets: [
              {
                storefront_id: "clothing",
                label: "Clothing",
                href: "/clothing",
                message: "shirt under $40",
              },
            ],
          },
        },
      },
    ],
  });
  await act(async () => root.render(<CommerceDemo storefront="beauty" />));
  const link = element.querySelector<HTMLAnchorElement>(".chat-handoffs a")!;
  expect(link.getAttribute("href")).toBe("/clothing");
  link.addEventListener("click", (event) => event.preventDefault());
  await act(async () => link.click());
  const transfer = JSON.parse(sessionStorage.getItem("querix-transfer-clothing")!);
  expect(Object.keys(transfer).sort()).toEqual(["expires", "message"]);
  expect(transfer.message).toBe("shirt under $40");
  vi.mocked(client.connectLive).mockResolvedValue({
    sessionId: "clothing-session",
    preferences: { tasks: [] },
    messages: [],
  });
  await act(async () => root.render(<CommerceDemo key="clothing" storefront="clothing" />));
  expect(element.querySelector("textarea")?.value).toBe("shirt under $40");
  expect(element.textContent).toContain("Review it below");
  expect(client.sendLive).not.toHaveBeenCalled();
});
it("does not restore a pending message from another section", async () => {
  sessionStorage.setItem(
    "querix-commerce-pending-v1-beauty",
    JSON.stringify({ sessionId: "test-session", key: "beauty-request", message: "shampoo" }),
  );
  await act(async () => root.render(<CommerceDemo storefront="footwear" />));
  expect(element.querySelector(".chat-turn.user")).toBeNull();
  expect(element.textContent).not.toContain("Recover response");
});

const testUser = {
  id: "user-1",
  name: "Test shopper",
  role: "user" as const,
  enabled: 1,
  must_change_password: 0,
  storefronts: ["clothing", "footwear"] as const,
  created_at: 0,
  last_login: null,
};
const savedChat = (id: string, title = `Chat ${id}`) => ({
  id,
  title,
  updated_at: new Date().toISOString(),
  storefront_id: "clothing" as const,
});
const restoredChat = (id: string, content = `Message in ${id}`): Conversation => ({
  sessionId: `browser-${id}`,
  conversationId: id,
  preferences: { tasks: [] },
  messages: [
    { id: `${id}-1`, role: "user", content },
    { id: `${id}-2`, role: "assistant", content: "Here are some ideas." },
  ],
});
async function renderPortal() {
  await act(async () =>
    root.render(
      <PortalContext.Provider value={{ ...testUser, storefronts: [...testUser.storefronts] }}>
        <CommerceDemo storefront="clothing" />
      </PortalContext.Provider>,
    ),
  );
}
function button(label: string) {
  const match = [...element.querySelectorAll<HTMLButtonElement>("button")].find(
    (item) =>
      item.getAttribute("aria-label") === label ||
      (item.textContent?.trim() === label && !item.closest(".chat-history-menu")),
  );
  if (!match) throw new Error(`Button not found: ${label}`);
  return match;
}
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

it("loads account history automatically, groups dates and marks the restored chat", async () => {
  vi.mocked(client.connectLive).mockResolvedValue(restoredChat("active"));
  vi.mocked(client.listLive).mockResolvedValue({
    conversations: [
      savedChat("active", "Cotton shirts"),
      { ...savedChat("older"), updated_at: "2020-01-01T12:00:00Z" },
    ],
  });
  await renderPortal();
  expect(client.listLive).toHaveBeenCalledWith("clothing", 0);
  expect(button("Open chat: Cotton shirts").getAttribute("aria-current")).toBe("true");
  expect(element.querySelector('[aria-label="Today"]')).not.toBeNull();
  expect(element.querySelector('[aria-label="Older"]')).not.toBeNull();
  expect(element.querySelector('a[href="/beauty"]')).toBeNull();
  expect(element.querySelector('a[href="/footwear"]')).not.toBeNull();
  await act(async () => button("Hide history").click());
  expect(element.querySelector(".chat-history-sidebar")).toBeNull();
  await act(async () => button("Show history").click());
  expect(button("Open chat: Cotton shirts")).toBeTruthy();
});

it("shows history loading and errors locally, then retries without replacing the chat", async () => {
  const page = deferred<Awaited<ReturnType<typeof client.listLive>>>();
  vi.mocked(client.listLive).mockReturnValueOnce(page.promise);
  vi.mocked(client.connectLive).mockResolvedValue(restoredChat("active"));
  await renderPortal();
  expect(element.querySelector(".chat-history-status")?.textContent).toContain("Loading");
  expect(element.textContent).not.toContain("A place for your finds");
  await act(async () => page.reject(new Error("History unavailable")));
  expect(element.querySelector(".chat-history-error")?.textContent).toContain(
    "History unavailable",
  );
  expect(element.querySelector(".chat-composer .commerce-error")).toBeNull();
  expect(element.querySelector(".chat-user-bubble")?.textContent).toBe("Message in active");
  vi.mocked(client.listLive).mockResolvedValue({ conversations: [savedChat("active")] });
  await act(async () => button("Try again").click());
  expect(element.querySelector(".chat-history-error")).toBeNull();
  expect(button("Open chat: Chat active")).toBeTruthy();
});

it("prevents overlapping pagination, deduplicates rows and advances by server row count", async () => {
  const first = Array.from({ length: 50 }, (_, i) => savedChat(String(i)));
  const second = [first[49], ...Array.from({ length: 49 }, (_, i) => savedChat(String(i + 50)))];
  const page = deferred<Awaited<ReturnType<typeof client.listLive>>>();
  vi.mocked(client.listLive)
    .mockResolvedValueOnce({ conversations: first })
    .mockReturnValueOnce(page.promise);
  await renderPortal();
  const more = button("Load older conversations");
  await act(async () => {
    more.click();
    more.click();
  });
  expect(client.listLive).toHaveBeenCalledTimes(2);
  expect(client.listLive).toHaveBeenLastCalledWith("clothing", 50);
  await act(async () => page.resolve({ conversations: second }));
  expect(element.querySelectorAll(".chat-history-item")).toHaveLength(99);
  vi.mocked(client.listLive).mockResolvedValueOnce({ conversations: [] });
  await act(async () => button("Load older conversations").click());
  expect(client.listLive).toHaveBeenLastCalledWith("clothing", 100);
  expect(element.querySelector(".chat-history-more")).toBeNull();
});

it("switches chats once, clears temporary UI and scrolls even for equal message counts", async () => {
  vi.mocked(client.connectLive).mockResolvedValue(restoredChat("active"));
  vi.mocked(client.listLive).mockResolvedValue({
    conversations: [savedChat("active"), savedChat("other")],
  });
  const opening = deferred<unknown>();
  vi.mocked(client.openLive).mockReturnValueOnce(opening.promise);
  await renderPortal();
  await act(async () => {
    button("Conversation preferences").click();
    element.querySelector(".chat-thread")!.dispatchEvent(new Event("scroll", { bubbles: true }));
  });
  const scroll = vi.mocked(HTMLElement.prototype.scrollTo).mock.calls.length;
  await act(async () => {
    button("Open chat: Chat other").click();
    button("Open chat: Chat active").click();
  });
  expect(client.openLive).toHaveBeenCalledTimes(1);
  expect(element.querySelector(".chat-opening")?.textContent).toContain("Opening conversation");
  vi.mocked(client.connectLive).mockResolvedValueOnce(restoredChat("other"));
  await act(async () => opening.resolve({}));
  expect(element.querySelector(".chat-user-bubble")?.textContent).toBe("Message in other");
  expect(button("Open chat: Chat other").getAttribute("aria-current")).toBe("true");
  expect(element.querySelector(".chat-context")).toBeNull();
  expect(vi.mocked(HTMLElement.prototype.scrollTo).mock.calls.length).toBeGreaterThan(scroll);
  expect(element.querySelector(".chat-history-sidebar")).not.toBeNull();
});

it("ignores history responses from before a chat transition", async () => {
  vi.mocked(client.connectLive).mockResolvedValueOnce(restoredChat("active"));
  const stale = deferred<Awaited<ReturnType<typeof client.listLive>>>();
  vi.mocked(client.listLive)
    .mockReturnValueOnce(stale.promise)
    .mockResolvedValue({ conversations: [savedChat("fresh")] });
  await renderPortal();
  vi.mocked(client.connectLive).mockResolvedValueOnce(restoredChat("new"));
  await act(async () => button("New chat").click());
  await act(async () => stale.resolve({ conversations: [savedChat("stale")] }));
  expect(element.textContent).not.toContain("Chat stale");
  expect(button("Open chat: Chat fresh")).toBeTruthy();
  expect(client.newLive).toHaveBeenCalledWith("clothing");
  expect(client.deleteLive).not.toHaveBeenCalled();
});

it("refreshes history after sending, starting a chat and confirmed deletion", async () => {
  await renderPortal();
  vi.mocked(client.sendLive).mockResolvedValue({
    message_id: 2,
    reply: "What size?",
    commerce: { action: "clarify", products: [], preferences: { tasks: [] } },
  });
  vi.mocked(client.listLive).mockResolvedValue({
    conversations: [savedChat("test-session", "Cotton shirt")],
  });
  const starter = [...element.querySelectorAll<HTMLButtonElement>(".chat-starters button")][0];
  await act(async () => starter.click());
  expect(button("Open chat: Cotton shirt").getAttribute("aria-current")).toBe("true");
  vi.mocked(client.connectLive).mockResolvedValue(restoredChat("new"));
  await act(async () => button("New chat").click());
  expect(client.newLive).toHaveBeenCalledTimes(1);
  await act(async () => button("Delete chat").click());
  expect(client.deleteLive).not.toHaveBeenCalled();
  expect(element.querySelector("dialog")?.open).toBe(true);
  await act(async () => button("Keep conversation").click());
  expect(client.deleteLive).not.toHaveBeenCalled();
  await act(async () => button("Delete chat").click());
  vi.mocked(client.listLive).mockResolvedValue({ conversations: [] });
  vi.mocked(client.connectLive).mockResolvedValue({
    sessionId: "empty",
    messages: [],
    preferences: { tasks: [] },
  });
  await act(async () => element.querySelector<HTMLButtonElement>("dialog .portal-danger")!.click());
  expect(client.deleteLive).toHaveBeenCalledWith("clothing");
  expect(element.querySelector(".chat-history-item")).toBeNull();
  expect(element.querySelector(".chat-history-empty")).not.toBeNull();
  expect(client.listLive).toHaveBeenCalledTimes(4);
});

it("prevents sending to an unseen conversation when restoration fails after opening", async () => {
  vi.mocked(client.connectLive)
    .mockResolvedValueOnce(restoredChat("active"))
    .mockRejectedValueOnce(new Error("Restore interrupted"));
  vi.mocked(client.listLive).mockResolvedValue({ conversations: [savedChat("other")] });
  await renderPortal();
  await act(async () => button("Open chat: Chat other").click());
  expect(element.querySelector("textarea")?.disabled).toBe(true);
  expect(element.querySelector(".chat-user-bubble")).toBeNull();
  expect(element.textContent).toContain("Restore interrupted");
  vi.mocked(client.connectLive).mockResolvedValueOnce(restoredChat("other"));
  await act(async () => button("Reconnect & restore").click());
  expect(element.querySelector("textarea")?.disabled).toBe(false);
  expect(element.querySelector(".chat-user-bubble")?.textContent).toBe("Message in other");
});

it("opens mobile history as a modal drawer and closes it after selecting a chat", async () => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: query.includes("max-width"),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
  vi.mocked(client.listLive).mockResolvedValue({ conversations: [savedChat("other")] });
  await renderPortal();
  expect(element.querySelector(".chat-history-sidebar")).toBeNull();
  await act(async () => button("Show history").click());
  expect(element.querySelector<HTMLDialogElement>(".chat-history-drawer")?.open).toBe(true);
  await act(async () =>
    element.querySelector("dialog")!.dispatchEvent(new Event("cancel", { cancelable: true })),
  );
  expect(element.querySelector(".chat-history-drawer")).toBeNull();
  expect(document.activeElement).toBe(button("Show history"));
  await act(async () => button("Show history").click());
  vi.mocked(client.connectLive).mockResolvedValueOnce(restoredChat("other"));
  await act(async () => button("Open chat: Chat other").click());
  expect(element.querySelector(".chat-history-drawer")).toBeNull();
  expect(element.querySelector(".chat-user-bubble")?.textContent).toBe("Message in other");
});

it("retries the failed history page and retries refresh from the first page", async () => {
  const first = Array.from({ length: 50 }, (_, i) => savedChat(String(i)));
  vi.mocked(client.listLive)
    .mockResolvedValueOnce({ conversations: first })
    .mockRejectedValueOnce(new Error("Page unavailable"));
  await renderPortal();
  await act(async () => button("Load older conversations").click());
  expect(element.querySelectorAll(".chat-history-item")).toHaveLength(50);
  vi.mocked(client.listLive).mockResolvedValueOnce({
    conversations: Array.from({ length: 50 }, (_, i) => savedChat(String(i + 50))),
  });
  await act(async () => button("Try again").click());
  expect(client.listLive).toHaveBeenLastCalledWith("clothing", 50);
  expect(element.querySelectorAll(".chat-history-item")).toHaveLength(100);
  vi.mocked(client.listLive).mockRejectedValueOnce(new Error("Refresh unavailable"));
  await act(async () => button("Refresh history").click());
  vi.mocked(client.listLive).mockResolvedValueOnce({ conversations: [savedChat("fresh")] });
  await act(async () => button("Try again").click());
  expect(client.listLive).toHaveBeenLastCalledWith("clothing", 0);
  expect(element.querySelectorAll(".chat-history-item")).toHaveLength(1);
});

it("keeps a conversation from an older page visible and selected after opening it", async () => {
  const conversations = Array.from({ length: 52 }, (_, i) => savedChat(String(i)));
  vi.mocked(client.listLive).mockImplementation(async (_storefront, offset = 0) => ({
    conversations: conversations.slice(offset, offset + 50),
  }));
  await renderPortal();
  await act(async () => button("Load older conversations").click());
  vi.mocked(client.connectLive).mockResolvedValueOnce(restoredChat("51"));
  await act(async () => button("Open chat: Chat 51").click());
  expect(element.querySelectorAll(".chat-history-item")).toHaveLength(52);
  expect(button("Open chat: Chat 51").getAttribute("aria-current")).toBe("true");
  expect(client.listLive).toHaveBeenLastCalledWith("clothing", 50);
});

it("keeps repeated New chat clicks local while the current chat is empty", async () => {
  await renderPortal();
  for (let i = 0; i < 4; i++) await act(async () => button("New chat").click());
  expect(client.newLive).not.toHaveBeenCalled();
  expect(client.startLive).not.toHaveBeenCalled();
  expect(client.connectLive).toHaveBeenCalledTimes(1);
  expect(element.querySelector(".chat-welcome")).not.toBeNull();
});

it("recognizes the current saved chat even though its browser session ID differs", async () => {
  vi.mocked(client.connectLive).mockResolvedValue(restoredChat("active"));
  vi.mocked(client.listLive).mockResolvedValue({ conversations: [savedChat("active")] });
  await renderPortal();
  await act(async () => button("Open chat: Chat active").click());
  expect(client.openLive).not.toHaveBeenCalled();
  expect(client.connectLive).toHaveBeenCalledTimes(1);
  expect(button("Open chat: Chat active").getAttribute("aria-current")).toBe("true");
});

it("separates verified empty chats and confirms row deletion without switching the current chat", async () => {
  const blank = { ...savedChat("blank", "Querix shopping demo"), is_empty: true };
  vi.mocked(client.connectLive).mockResolvedValue(restoredChat("active"));
  vi.mocked(client.listLive).mockResolvedValue({
    conversations: [savedChat("active", "Querix shopping demo"), blank],
  });
  await renderPortal();
  const emptySection = element.querySelector<HTMLDetailsElement>(".chat-empty-conversations")!;
  expect(emptySection.open).toBe(false);
  expect(emptySection.textContent).toContain("Empty chats (1)");
  expect(element.querySelectorAll(".chat-history-group .chat-history-item")).toHaveLength(1);
  expect(element.querySelector(".chat-history-group .chat-history-label")?.textContent).toContain(
    "Untitled chat",
  );
  const removeBlank = emptySection.querySelector<HTMLButtonElement>(".chat-history-menu button")!;
  await act(async () => removeBlank.click());
  expect(client.deleteSavedLive).not.toHaveBeenCalled();
  await act(async () => button("Keep conversation").click());
  expect(client.deleteSavedLive).not.toHaveBeenCalled();
  await act(async () => removeBlank.click());
  vi.mocked(client.listLive).mockResolvedValue({ conversations: [savedChat("active")] });
  await act(async () => element.querySelector<HTMLButtonElement>("dialog .portal-danger")!.click());
  expect(client.deleteSavedLive).toHaveBeenCalledWith("blank", "clothing");
  expect(client.openLive).not.toHaveBeenCalled();
  expect(client.newLive).not.toHaveBeenCalled();
  expect(client.connectLive).toHaveBeenCalledTimes(1);
  expect(element.querySelector(".chat-user-bubble")?.textContent).toBe("Message in active");
  expect(element.querySelector(".chat-empty-conversations")).toBeNull();
});

it("deletes the active saved chat into an unsaved draft without creating a replacement", async () => {
  vi.mocked(client.connectLive).mockResolvedValue(restoredChat("active"));
  vi.mocked(client.listLive).mockResolvedValue({ conversations: [savedChat("active")] });
  await renderPortal();
  await act(async () => button("Delete chat: Chat active").click());
  vi.mocked(client.deleteSavedLive).mockResolvedValueOnce({ deleted: true, active: true });
  vi.mocked(client.connectLive).mockResolvedValueOnce({
    sessionId: "new-draft",
    messages: [],
    preferences: { tasks: [] },
  });
  vi.mocked(client.listLive).mockResolvedValue({ conversations: [] });
  await act(async () => element.querySelector<HTMLButtonElement>("dialog .portal-danger")!.click());
  expect(element.querySelector(".chat-welcome")).not.toBeNull();
  await act(async () => button("New chat").click());
  expect(client.startLive).not.toHaveBeenCalled();
  expect(client.newLive).not.toHaveBeenCalled();
  expect(client.deleteLive).not.toHaveBeenCalled();
});

it("keeps chats and their messages when row deletion fails", async () => {
  vi.mocked(client.connectLive).mockResolvedValue(restoredChat("active"));
  vi.mocked(client.listLive).mockResolvedValue({
    conversations: [savedChat("active"), savedChat("older")],
  });
  vi.mocked(client.deleteSavedLive).mockRejectedValueOnce(new Error("Delete unavailable"));
  await renderPortal();
  await act(async () => button("Delete chat: Chat older").click());
  await act(async () => element.querySelector<HTMLButtonElement>("dialog .portal-danger")!.click());
  expect(element.querySelector("dialog")).toBeNull();
  expect(element.querySelector(".commerce-error")?.textContent).toContain("Delete unavailable");
  expect(button("Open chat: Chat older")).toBeTruthy();
  expect(element.querySelector(".chat-user-bubble")?.textContent).toBe("Message in active");
});

it("reuses the first saved conversation and message key after a failed first turn", async () => {
  vi.mocked(client.sendLive)
    .mockRejectedValueOnce(new Error("Temporary interruption"))
    .mockResolvedValueOnce({
      message_id: 2,
      reply: "Which size?",
      commerce: { action: "clarify", products: [], preferences: { tasks: [] } },
    });
  await renderPortal();
  await act(async () => element.querySelector<HTMLButtonElement>(".chat-starters button")!.click());
  expect(client.startLive).toHaveBeenCalledTimes(1);
  const operation = vi.mocked(client.sendLive).mock.calls[0];
  await act(async () => button("Retry same message").click());
  expect(client.startLive).toHaveBeenCalledTimes(1);
  expect(vi.mocked(client.sendLive).mock.calls[1].slice(0, 2)).toEqual(operation.slice(0, 2));
  expect(element.querySelectorAll(".chat-turn.user")).toHaveLength(1);
  expect(element.querySelectorAll(".chat-turn.assistant")).toHaveLength(1);
});
