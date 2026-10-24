import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { CommerceDemo } from "./CommerceDemo";
import * as client from "@/features/commerce/client";
import { SAMPLE_PRODUCTS } from "@/features/commerce/sample";
vi.mock("@/features/commerce/client", async (original) => ({
  ...(await original<typeof client>()),
  liveStatus: vi.fn(),
  connectLive: vi.fn(),
  loadCatalog: vi.fn(),
  sendLive: vi.fn(),
}));
let root: Root;
let element: HTMLDivElement;
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  HTMLElement.prototype.scrollTo = vi.fn();
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
});
afterEach(async () => {
  await act(async () => root.unmount());
  element.remove();
  vi.clearAllMocks();
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
