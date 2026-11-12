import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { CommerceShowcase } from "./CommerceShowcase";
import { IndustryShowcase } from "./IndustryShowcase";
import { IntelligenceDashboard } from "./IntelligenceDashboard";

let root: Root;
let host: HTMLDivElement;
let motionChange: ((event: { matches: boolean }) => void) | undefined;
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      matches: false,
      addEventListener: (_name: string, listener: typeof motionChange) => {
        motionChange = listener;
      },
      removeEventListener: vi.fn(),
    })),
  );
  vi.stubGlobal("fetch", vi.fn());
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
async function change(label: string, value: string) {
  const select =
    host.querySelector(`select[aria-label="${label}"]`) ??
    [...host.querySelectorAll("label")]
      .find((item) => item.textContent?.includes(label))
      ?.querySelector("select");
  if (!(select instanceof HTMLSelectElement)) throw new Error(`Missing select ${label}`);
  await act(async () => {
    select.value = value;
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
}
function total() {
  return Number(host.querySelector(".ql-dash-metrics strong")?.textContent?.replaceAll(",", ""));
}

it("discovers sample products, preserves cotton on refinement, compares actual prices, and opens details without a live request", async () => {
  await act(async () => root.render(<CommerceShowcase />));
  expect(host.querySelectorAll(".ql-product")).toHaveLength(2);
  expect(host.querySelector(".ql-product-grid")?.textContent).toContain("$36.00");
  await act(async () => button("Keep it under $30").click());
  expect(host.querySelectorAll(".ql-product")).toHaveLength(2);
  expect(host.querySelector(".ql-filter-chips")?.textContent).toContain("Cotton");
  expect(host.querySelector(".ql-product-grid")?.textContent).not.toContain("$36.00");
  await act(async () => button("Compare these two").click());
  expect(host.querySelector(".ql-comparison")?.textContent).toContain("$22.00");
  expect(host.querySelector(".ql-comparison")?.textContent).toContain("sand");
  await act(async () => button("View Easy blue button-down").click());
  expect(host.querySelector("dialog")?.open).toBe(true);
  expect(host.querySelector("dialog dl")?.textContent).toContain("cotton");
  await act(async () => button("Close product details").click());
  expect(host.querySelector("dialog")).toBeNull();
  await act(async () => button("Restart preview").click());
  expect(host.querySelectorAll(".ql-product")).toHaveLength(2);
  expect(fetch).not.toHaveBeenCalled();
});
it("pauses automated progression and finishes playback at comparison", async () => {
  vi.useFakeTimers();
  await act(async () => root.render(<CommerceShowcase />));
  await act(async () => button("Pause preview").click());
  await act(async () => vi.advanceTimersByTime(14000));
  expect(host.querySelectorAll(".ql-product")).toHaveLength(2);
  await act(async () => button("Play preview").click());
  await act(async () => vi.advanceTimersByTime(6500));
  expect(host.querySelectorAll(".ql-product")).toHaveLength(2);
  await act(async () => vi.advanceTimersByTime(6500));
  expect(host.querySelector(".ql-comparison")).not.toBeNull();
  await act(async () => vi.advanceTimersByTime(30000));
  expect(host.querySelector(".ql-comparison")).not.toBeNull();
});
it("stops an in-flight transition when reduced motion is enabled", async () => {
  vi.useFakeTimers();
  await act(async () => root.render(<CommerceShowcase />));
  await act(async () => motionChange?.({ matches: true }));
  await act(async () => vi.advanceTimersByTime(20000));
  expect(host.querySelectorAll(".ql-product")).toHaveLength(2);
  await act(async () => button("Keep it under $30").click());
  expect(host.querySelectorAll(".ql-product")).toHaveLength(2);
});
it("leaves the reduced-motion preview under visitor control", async () => {
  vi.useFakeTimers();
  vi.mocked(matchMedia).mockReturnValue({
    matches: true,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  } as unknown as MediaQueryList);
  await act(async () => root.render(<CommerceShowcase />));
  await act(async () => vi.advanceTimersByTime(20000));
  expect(host.querySelectorAll(".ql-product")).toHaveLength(2);
});
it("recalculates synthetic dashboard totals across category and period filters without fetching customer analytics", async () => {
  await act(async () => root.render(<IntelligenceDashboard />));
  const all = total();
  await change("Dashboard catalogue", "Fashion");
  const fashion = total();
  await change("Dashboard catalogue", "Beauty");
  const beauty = total();
  expect(fashion + beauty).toBe(all);
  expect(host.querySelector(".ql-interest")?.textContent).not.toContain("Cotton workwear");
  await change("Dashboard period", "7");
  expect(total()).toBeLessThan(beauty);
  expect(host.querySelectorAll(".ql-chart-targets button")).toHaveLength(7);
  expect(host.querySelector(".ql-trend-plot svg")?.getAttribute("aria-label")).toContain(
    `${total()} searches in total`,
  );
  expect(host.textContent).toContain("Illustrative data");
  expect(fetch).not.toHaveBeenCalled();
});
it("drills into unmet demand and exposes chart values through keyboard controls", async () => {
  await act(async () => root.render(<IntelligenceDashboard />));
  await act(async () => button("lightweight summer blazer").click());
  expect(host.querySelector(".ql-query-detail")?.textContent).toContain(
    "lightweight summer blazer",
  );
  const day = host.querySelector(".ql-chart-targets button") as HTMLButtonElement;
  await act(async () => day.focus());
  expect(host.querySelector(".ql-trend-label")?.textContent).toContain("Day 1");
  await change("Dashboard period", "7");
  expect(host.querySelector(".ql-trend-label")?.textContent).toContain("Day 28");
});
it("switches industry requirements and resets the previous refinement", async () => {
  await act(async () => root.render(<IndustryShowcase />));
  await act(async () => button("Electronics").click());
  expect(host.querySelector(".ql-industry-query")?.textContent).toContain("Wireless headphones");
  await act(async () => button("Only show noise-cancelling options").click());
  expect(host.querySelector(".ql-filter-chips")?.textContent).toContain("Noise cancelling");
  await act(async () => button("Automotive").click());
  expect(host.querySelector(".ql-filter-chips")?.textContent).not.toContain("Noise cancelling");
  expect(host.querySelector(".ql-industry-query")?.textContent).toContain("Replacement brake pads");
  expect(host.textContent).toContain("Illustrative industry scenario");
  expect(fetch).not.toHaveBeenCalled();
});

it("waits for the opening animation before advancing the visible preview", async () => {
  vi.useFakeTimers();
  document.documentElement.setAttribute("data-qx-intro", "active");
  await act(async () => root.render(<CommerceShowcase />));
  await act(async () => vi.advanceTimersByTime(20000));
  expect(host.querySelector(".ql-filter-chips")?.textContent).toContain("Under $40");
  await act(async () => document.documentElement.removeAttribute("data-qx-intro"));
  await act(async () => vi.advanceTimersByTime(6500));
  expect(host.querySelector(".ql-filter-chips")?.textContent).toContain("Under $30");
});
it("pauses outside the viewport and while the browser tab is hidden", async () => {
  vi.useFakeTimers();
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
  const show = async (visible: boolean) =>
    act(async () =>
      intersection?.(
        [
          {
            isIntersecting: visible,
            intersectionRatio: visible ? 1 : 0,
          } as IntersectionObserverEntry,
        ],
        {} as IntersectionObserver,
      ),
    );
  await act(async () => root.render(<CommerceShowcase />));
  await act(async () => vi.advanceTimersByTime(20000));
  expect(host.querySelector(".ql-filter-chips")?.textContent).toContain("Under $40");
  await show(true);
  await act(async () => vi.advanceTimersByTime(6500));
  expect(host.querySelector(".ql-filter-chips")?.textContent).toContain("Under $30");
  await show(false);
  await act(async () => vi.advanceTimersByTime(20000));
  expect(host.querySelector(".ql-comparison")).toBeNull();
  await show(true);
  const hidden = vi.spyOn(document, "hidden", "get").mockReturnValue(true);
  await act(async () => document.dispatchEvent(new Event("visibilitychange")));
  await act(async () => vi.advanceTimersByTime(20000));
  expect(host.querySelector(".ql-comparison")).toBeNull();
  hidden.mockReturnValue(false);
  await act(async () => document.dispatchEvent(new Event("visibilitychange")));
  await act(async () => vi.advanceTimersByTime(6500));
  expect(host.querySelector(".ql-comparison")).not.toBeNull();
});
it("changes industry, preserves beauty preferences, and compares catalogue attributes", async () => {
  await act(async () => root.render(<CommerceShowcase />));
  await act(async () => button("Keep it under $30").click());
  await act(async () => button("Beauty").click());
  expect(host.querySelector(".ql-filter-chips")?.textContent).toContain("Under $30");
  expect(host.querySelector(".ql-filter-chips")?.textContent).not.toContain("Cotton");
  await act(async () => button("Keep it under $20").click());
  expect(host.querySelector(".ql-filter-chips")?.textContent).toContain("Fragrance-free");
  expect(host.querySelector(".ql-product-grid")?.textContent).not.toContain("$24.00");
  await act(async () => button("Compare these two").click());
  expect(host.querySelector(".ql-comparison")?.textContent).toContain("40 ml");
  expect(host.querySelector(".ql-comparison")?.textContent).toContain("$9.00");
  expect(fetch).not.toHaveBeenCalled();
});
