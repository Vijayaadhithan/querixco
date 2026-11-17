import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { CommerceShowcase } from "./CommerceShowcase";

let root: Root;
let host: HTMLDivElement;
let motionChange: ((event: { matches: boolean }) => void) | undefined;
let motionMatches = false;
beforeEach(() => {
  vi.useFakeTimers();
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  motionMatches = false;
  motionChange = undefined;
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      get matches() {
        return motionMatches;
      },
      addEventListener: (_name: string, listener: typeof motionChange) => {
        motionChange = (event) => {
          motionMatches = event.matches;
          listener?.(event);
        };
      },
      removeEventListener: vi.fn(),
    })),
  );
  vi.stubGlobal("fetch", vi.fn());
  HTMLElement.prototype.scrollTo = vi.fn();
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.open = true;
    },
  });
  Object.defineProperty(HTMLDialogElement.prototype, "close", {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.open = false;
      this.dispatchEvent(new Event("close"));
    },
  });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  document.documentElement.removeAttribute("data-qx-intro");
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  Reflect.deleteProperty(HTMLDialogElement.prototype, "showModal");
  Reflect.deleteProperty(HTMLDialogElement.prototype, "close");
});
function button(text: string) {
  const item = [...host.querySelectorAll("button")].find(
    (b) => b.textContent?.includes(text) || b.getAttribute("aria-label") === text,
  );
  if (!item) throw new Error(`Missing button ${text}`);
  return item;
}
async function tick(ms: number) {
  await act(async () => vi.advanceTimersByTime(ms));
}
async function choose(label: string) {
  await act(async () => button(label).click());
  await tick(700);
}
const latest = () => host.querySelector(".qc-turn:last-child");

it("lets homepage visitors refine and compare actual results while preserving the earlier conversation", async () => {
  await act(async () => root.render(<CommerceShowcase brief />));
  expect(button("Workwear").getAttribute("aria-pressed")).toBe("true");
  expect(host.querySelector("form")).toBeNull();
  expect(host.querySelector(".qc-thread")?.textContent).toContain("$36.00");
  await act(async () => button("Keep it under $30").click());
  expect(host.querySelector(".qc-incoming .qc-user")?.textContent).toContain("under $30");
  expect(host.querySelector('[aria-label="Querix is preparing a reply"]')).not.toBeNull();
  await tick(700);
  expect(host.querySelectorAll(".qc-turn")).toHaveLength(2);
  expect(latest()?.textContent).not.toContain("$36.00");
  expect(host.querySelector('[data-turn="0"]')?.textContent).toContain("$36.00");
  await choose("Compare these two");
  const comparison = host.querySelector(".qc-comparison")!;
  expect(comparison.textContent).toContain("$29.00");
  expect(comparison.textContent).toContain("$22.00");
  expect(comparison.textContent).not.toContain("$36.00");
  expect(comparison.querySelectorAll("img")).toHaveLength(2);
  expect(host.querySelector(".qc-footer a")?.getAttribute("href")).toBe(
    "/use-cases/conversational-commerce",
  );
  expect(fetch).not.toHaveBeenCalled();
});

it.each([true, false])(
  "keeps both budget and colour constraints in either order (budget first: %s)",
  async (budgetFirst) => {
    await act(async () => root.render(<CommerceShowcase brief />));
    await choose(budgetFirst ? "Keep it under $30" : "Show blue shirts");
    await choose(budgetFirst ? "Show blue shirts" : "Keep it under $30");
    expect(latest()?.querySelectorAll(".commerce-product")).toHaveLength(1);
    expect(latest()?.textContent).toContain("Easy blue button-down");
    expect(latest()?.textContent).toContain("$22.00");
    expect(latest()?.textContent).not.toContain("Weekend cotton shirt");
    expect(latest()?.textContent).not.toContain("$36.00");
    expect(host.querySelector(".qc-choices")?.textContent).not.toContain("Compare these two");
    await tick(30000);
    expect(host.querySelectorAll(".qc-turn")).toHaveLength(3);
  },
);

it("compares the blue products when colour is selected before budget", async () => {
  await act(async () => root.render(<CommerceShowcase />));
  await choose("Show blue shirts");
  await choose("Compare these two");
  const table = host.querySelector(".qc-comparison")!;
  expect(table.textContent).toContain("The everyday navy shirt");
  expect(table.textContent).toContain("Easy blue button-down");
  expect(table.textContent).not.toContain("Weekend cotton shirt");
  await choose("Keep it under $30");
  expect(latest()?.querySelectorAll(".commerce-product")).toHaveLength(1);
});

it.each([true, false])(
  "keeps skincare volume and budget consistent in either order (budget first: %s)",
  async (budgetFirst) => {
    await act(async () => root.render(<CommerceShowcase initialScenario="beauty" />));
    await choose(budgetFirst ? "Keep it under $20" : "50 ml or more");
    await choose(budgetFirst ? "50 ml or more" : "Keep it under $20");
    expect(latest()?.querySelectorAll(".commerce-product")).toHaveLength(1);
    expect(latest()?.textContent).toContain("Cloud-soft moisturizer");
    expect(latest()?.textContent).toContain("$18.00");
    expect(latest()?.textContent).toContain("Still fragrance-free");
    await choose("View Cloud-soft moisturizer");
    expect(host.querySelector("dialog")?.open).toBe(true);
    expect(host.querySelector("dialog dl")?.textContent).toContain("60 ml");
    await choose("Close product details");
    expect(host.querySelector("dialog")).toBeNull();
  },
);

it("prevents duplicate sends and cancels a pending reply when changing examples or restarting", async () => {
  await act(async () => root.render(<CommerceShowcase brief />));
  await act(async () => {
    button("Keep it under $30").click();
    button("Keep it under $30").click();
  });
  await tick(700);
  expect(host.querySelectorAll(".qc-turn")).toHaveLength(2);
  await act(async () => button("Show blue shirts").click());
  await act(async () => button("Skincare").click());
  await tick(10000);
  expect(host.querySelectorAll(".qc-turn")).toHaveLength(1);
  expect(host.querySelector(".qc-thread")?.textContent).not.toContain("cotton");
  expect(host.querySelector(".qc-thread")?.textContent).toContain("fragrance-free");
  await act(async () => button("Keep it under $20").click());
  await act(async () => button("Restart preview").click());
  await tick(10000);
  expect(host.querySelectorAll(".qc-turn")).toHaveLength(1);
});

it("plays the homepage introduction once and then leaves follow-ups available to visitors", async () => {
  await act(async () => root.render(<CommerceShowcase brief />));
  await tick(3800);
  await tick(650);
  expect(host.querySelectorAll(".qc-turn")).toHaveLength(2);
  await tick(30000);
  expect(host.querySelectorAll(".qc-turn")).toHaveLength(2);
  expect(button("Compare these two").disabled).toBe(false);
  expect(button("Show blue shirts").disabled).toBe(false);
});

it("pauses autoplay and resumes without looping or replacing earlier turns", async () => {
  await act(async () => root.render(<CommerceShowcase />));
  await tick(2000);
  await act(async () => button("Pause preview").click());
  await tick(10000);
  expect(host.querySelectorAll(".qc-turn")).toHaveLength(1);
  await act(async () => button("Play preview").click());
  await tick(1800);
  await tick(650);
  await tick(3800);
  await tick(650);
  expect(host.querySelectorAll(".qc-turn")).toHaveLength(3);
  expect(host.querySelectorAll(".qc-comparison")).toHaveLength(1);
  await tick(30000);
  expect(host.querySelectorAll(".qc-turn")).toHaveLength(3);
});

it("leaves reduced-motion interaction immediate and under visitor control", async () => {
  motionMatches = true;
  await act(async () => root.render(<CommerceShowcase brief />));
  await tick(30000);
  expect(host.querySelectorAll(".qc-turn")).toHaveLength(1);
  expect(host.querySelector('[aria-label="Play preview"]')).toBeNull();
  await act(async () => button("Keep it under $30").click());
  expect(host.querySelectorAll(".qc-turn")).toHaveLength(2);
  expect(host.querySelector(".qc-incoming")).toBeNull();
  await act(async () => button("Compare these two").click());
  expect(host.querySelector(".qc-comparison")).not.toBeNull();
});

it("stops autoplay when reduced motion is enabled mid-session", async () => {
  await act(async () => root.render(<CommerceShowcase />));
  await tick(2000);
  await act(async () => motionChange?.({ matches: true }));
  await tick(20000);
  expect(host.querySelectorAll(".qc-turn")).toHaveLength(1);
  await act(async () => button("Show blue shirts").click());
  expect(host.querySelectorAll(".qc-turn")).toHaveLength(2);
});

it("does not pull readers to the bottom after they scroll up", async () => {
  await act(async () => root.render(<CommerceShowcase />));
  const thread = host.querySelector(".qc-thread") as HTMLDivElement;
  Object.defineProperties(thread, {
    scrollHeight: { value: 1200, configurable: true },
    clientHeight: { value: 350, configurable: true },
    scrollTop: { value: 0, writable: true, configurable: true },
  });
  await act(async () => thread.dispatchEvent(new Event("scroll")));
  vi.mocked(thread.scrollTo).mockClear();
  await choose("Keep it under $30");
  expect(thread.scrollTo).not.toHaveBeenCalled();
  await act(async () => button("Jump to latest example").click());
  expect(thread.scrollTo).toHaveBeenCalledWith({ top: 1200, behavior: "smooth" });
});

it("waits for the introduction and pauses outside the viewport or in a hidden tab", async () => {
  let intersection: IntersectionObserverCallback | undefined;
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(callback: IntersectionObserverCallback) {
        intersection = callback;
      }
      observe() {}
      disconnect() {}
    },
  );
  document.documentElement.setAttribute("data-qx-intro", "active");
  await act(async () => root.render(<CommerceShowcase />));
  const visible = async (yes: boolean) =>
    act(async () =>
      intersection?.(
        [{ isIntersecting: yes, intersectionRatio: yes ? 1 : 0 } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      ),
    );
  await visible(true);
  await tick(10000);
  expect(host.querySelectorAll(".qc-turn")).toHaveLength(1);
  await act(async () => document.documentElement.removeAttribute("data-qx-intro"));
  await visible(false);
  await tick(10000);
  expect(host.querySelectorAll(".qc-turn")).toHaveLength(1);
  await visible(true);
  const hidden = vi.spyOn(document, "hidden", "get").mockReturnValue(true);
  await act(async () => document.dispatchEvent(new Event("visibilitychange")));
  await tick(10000);
  expect(host.querySelectorAll(".qc-turn")).toHaveLength(1);
  hidden.mockReturnValue(false);
  await act(async () => document.dispatchEvent(new Event("visibilitychange")));
  await tick(3800);
  await tick(650);
  expect(host.querySelectorAll(".qc-turn")).toHaveLength(2);
});
