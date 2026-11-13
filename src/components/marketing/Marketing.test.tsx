import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { DemoRequest } from "./DemoRequest";
import { ProductExperience } from "./ProductExperience";

let root: Root;
let element: HTMLDivElement;
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  element = document.createElement("div");
  document.body.append(element);
  root = createRoot(element);
});
afterEach(async () => {
  await act(async () => root.unmount());
  element.remove();
  vi.unstubAllGlobals();
});
function button(label: string) {
  const found = [...element.querySelectorAll("button")].find(
    (item) => item.textContent?.includes(label) || item.getAttribute("aria-label") === label,
  );
  if (!found) throw new Error(`Missing button: ${label}`);
  return found;
}
async function prepareDemo() {
  await act(async () => root.render(<DemoRequest initialProduct="commerce" />));
  (element.querySelector('[name="name"]') as HTMLInputElement).value = "Sam & Team";
  (element.querySelector('[name="email"]') as HTMLInputElement).value = "sam@example.com";
  (element.querySelector('[name="company"]') as HTMLInputElement).value = "Example Store";
  (element.querySelector('[name="message"]') as HTMLTextAreaElement).value =
    "Clothing & beauty\nCompare sizes + budgets.";
  await act(async () => button("Prepare email request").click());
}
it("prepares an encoded commerce email without sending data or claiming delivery", async () => {
  const fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  await prepareDemo();
  const emailLink = [...element.querySelectorAll("a")].find((item) =>
    item.textContent?.includes("Open email draft"),
  )!;
  const email = new URL(emailLink.href);
  expect(email.pathname).toBe("hello@querix.co");
  expect(email.searchParams.get("subject")).toContain("Interactive commerce");
  expect(email.searchParams.get("body")).toContain("Sam & Team");
  expect(email.searchParams.get("body")).toContain("Clothing & beauty\nCompare sizes + budgets.");
  expect(element.textContent).toContain("Nothing has been sent yet.");
  expect(fetchMock).not.toHaveBeenCalled();
});
it("rejects invalid email and whitespace-only required fields", async () => {
  await act(async () => root.render(<DemoRequest initialProduct="search" />));
  (element.querySelector('[name="name"]') as HTMLInputElement).value = " ";
  (element.querySelector('[name="company"]') as HTMLInputElement).value = "Store";
  const email = element.querySelector('[name="email"]') as HTMLInputElement;
  email.value = "not-an-email";
  await act(async () => button("Prepare email request").click());
  expect(element.querySelector(".qx-email-draft")).toBeNull();
  email.value = "sam@example.com";
  await act(async () => button("Prepare email request").click());
  expect(element.querySelector(".qx-email-draft")).toBeNull();
  expect(element.textContent).toContain("Please enter your name");
});
it("invalidates the previous draft when the product choice changes", async () => {
  await prepareDemo();
  const select = element.querySelector("select")!;
  expect(select.value).toBe("commerce");
  await act(async () => {
    select.value = "search";
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
  expect(element.querySelector(".qx-email-draft")).toBeNull();
  await act(async () => button("Prepare email request").click());
  expect(
    (element.querySelector(".qx-email-draft textarea") as HTMLTextAreaElement).value,
  ).toContain("Intelligent search");
});
it("keeps the readable draft available when clipboard access fails", async () => {
  await prepareDemo();
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText: vi.fn().mockRejectedValue(new Error("denied")) },
  });
  await act(async () => button("Copy draft").click());
  expect(element.textContent).toContain("copy it manually");
  expect(
    (element.querySelector(".qx-email-draft textarea") as HTMLTextAreaElement).value,
  ).toContain("Example Store");
});
it("uses a conversational thread for commerce and catalog results for search", async () => {
  const fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  await act(async () => root.render(<ProductExperience />));
  await act(async () => button("Keep it under $30").click());
  expect(element.querySelectorAll(".qc-turn")).toHaveLength(2);
  expect(element.querySelector('[data-turn="1"]')?.textContent).toContain("$22.00");
  await act(async () => button("Compare these two").click());
  expect(element.querySelector(".qc-comparison")?.textContent).toContain("cotton");
  await act(async () => button("Restart preview").click());
  expect(element.querySelector(".qc-comparison")).toBeNull();
  expect(element.querySelector('[data-turn="0"]')?.textContent).toContain("$36.00");
  await act(async () => button("Intelligent search").click());
  expect(element.querySelector(".qc-thread")).toBeNull();
  expect(button("Intelligent search").getAttribute("aria-pressed")).toBe("true");
  await act(async () => button("Narrow the budget").click());
  expect(element.querySelector(".qx-filter-line")?.textContent).toContain("Under $30");
  expect(element.querySelector(".qs-products")?.textContent).toContain("$22.00");
  expect(fetchMock).not.toHaveBeenCalled();
});

it("opens accessible mobile navigation with a clearly separate demo sign-in", async () => {
  await act(async () => root.render(<DemoRequest initialProduct="both" />));
  const menu = element.querySelector('button[aria-label="Open menu"]') as HTMLButtonElement;
  await act(async () => menu.click());
  expect(menu.getAttribute("aria-expanded")).toBe("true");
  expect(element.querySelector('#qx-mobile-nav a[href="/commerce/login"]')?.textContent).toContain(
    "Demo sign-in",
  );
  await act(async () => menu.click());
  expect(element.querySelector("#qx-mobile-nav")).toBeNull();
});

it("uses the canonical sample catalog when refining and resetting a selected search example", async () => {
  await act(async () => root.render(<ProductExperience initialMode="search" />));
  await act(async () => button("Skincare").click());
  expect(element.querySelector(".qx-query")?.textContent).toContain("fragrance-free moisturizer");
  expect(element.querySelector(".qs-products")?.textContent).toContain("Daily comfort cream");
  await act(async () => button("Narrow the budget to $20").click());
  expect(element.querySelector(".qx-filter-line")?.textContent).toContain("Under $20");
  expect(element.querySelector(".qs-products")?.textContent).toContain("$16.00");
  expect(element.querySelector(".qs-products")?.textContent).toContain("$9.00");
  await act(async () => button("Restart").click());
  expect(element.querySelector(".qx-filter-line")?.textContent).toContain("Under $30");
  expect(element.querySelector(".qs-products")?.textContent).toContain("$24.00");
  expect(button("Skincare").getAttribute("aria-pressed")).toBe("true");
});

it.each([
  ["integration", "Discuss integration"],
  ["poc", "Request a proof of concept"],
] as const)("preserves the %s enquiry intent in the email draft", async (intent, label) => {
  await act(async () => root.render(<DemoRequest initialProduct="both" initialIntent={intent} />));
  expect((element.querySelector('[name="intent"]') as HTMLSelectElement).value).toBe(intent);
  (element.querySelector('[name="name"]') as HTMLInputElement).value = "Sam";
  (element.querySelector('[name="email"]') as HTMLInputElement).value = "sam@example.com";
  (element.querySelector('[name="company"]') as HTMLInputElement).value = "Example Store";
  await act(async () => button("Prepare email request").click());
  const link = [...element.querySelectorAll("a")].find((a) =>
    a.textContent?.includes("Open email draft"),
  )!;
  expect(new URL(link.href).searchParams.get("subject")).toContain(label);
  expect(
    (element.querySelector(".qx-email-draft textarea") as HTMLTextAreaElement).value,
  ).toContain(`Request: ${label}`);
});

it("closes product navigation with Escape and returns focus to its control", async () => {
  await act(async () => root.render(<DemoRequest initialProduct="both" />));
  const products = element.querySelector(".qx-product-menu") as HTMLDetailsElement;
  products.open = true;
  const link = products.querySelector(
    'a[href="/use-cases/conversational-commerce"]',
  ) as HTMLAnchorElement;
  link.focus();
  await act(async () => document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })));
  expect(products.open).toBe(false);
  expect(document.activeElement).toBe(products.querySelector("summary"));
  products.open = true;
  await act(async () => document.body.dispatchEvent(new Event("pointerdown", { bubbles: true })));
  expect(products.open).toBe(false);
});
it("closes mobile navigation with Escape and restores the menu button", async () => {
  await act(async () => root.render(<DemoRequest initialProduct="both" />));
  const menu = element.querySelector('button[aria-label="Open menu"]') as HTMLButtonElement;
  await act(async () => menu.click());
  (element.querySelector("#qx-mobile-nav a") as HTMLAnchorElement).focus();
  await act(async () => document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })));
  expect(element.querySelector("#qx-mobile-nav")).toBeNull();
  expect(document.activeElement).toBe(menu);
});
