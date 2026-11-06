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
  const found = [...element.querySelectorAll("button")].find((item) =>
    item.textContent?.includes(label),
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
  expect(email.searchParams.get("subject")).toContain("Conversational commerce");
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
it("supports refinement, comparison, restart, and search without an AI request", async () => {
  const fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  await act(async () => root.render(<ProductExperience />));
  await act(async () => button("Keep it under $30").click());
  expect(element.textContent).toContain("Budget updated");
  expect(element.querySelector(".qx-demo-products")?.textContent).not.toContain("$38");
  await act(async () => button("Compare these two").click());
  expect(element.querySelector(".qx-mini-comparison")?.textContent).toContain("Structured collar");
  await act(async () => button("Restart").click());
  expect(element.querySelector(".qx-mini-comparison")).toBeNull();
  expect(element.querySelector(".qx-demo-products")?.textContent).toContain("$38");
  await act(async () => button("Intelligent search").click());
  expect(button("Intelligent search").getAttribute("aria-pressed")).toBe("true");
  await act(async () => button("Narrow the budget").click());
  expect(element.querySelector(".qx-filter-line")?.textContent).toContain("Under $30");
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

it("lets visitors pause, change search scenarios, and replay without losing the selected example", async () => {
  await act(async () => root.render(<ProductExperience initialMode="search" />));
  await act(async () => button("Pause").click());
  expect(element.querySelector(".qx-experience")?.getAttribute("data-paused")).toBe("true");
  await act(async () => button("Skincare").click());
  expect(element.querySelector(".qx-query")?.textContent).toContain("fragrance-free moisturizer");
  await act(async () => button("Narrow the budget to $20").click());
  expect(element.querySelector(".qx-filter-line")?.textContent).toContain("Under $20");
  expect(element.querySelector(".qx-demo-products")?.textContent).toContain("$18");
  await act(async () => button("Resume").click());
  expect(element.querySelector(".qx-experience")?.getAttribute("data-paused")).toBe("false");
  await act(async () => button("Restart").click());
  expect(element.querySelector(".qx-filter-line")?.textContent).toContain("Under $30");
  expect(button("Skincare").getAttribute("aria-pressed")).toBe("true");
});
