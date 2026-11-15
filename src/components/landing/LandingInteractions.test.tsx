import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { CommerceShowcase } from "./CommerceShowcase";

let root: Root;
let host: HTMLDivElement;
let motionChange: ((event: { matches: boolean }) => void) | undefined;
let motionMatches = false;
beforeEach(() => {
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
it("appends refinements and comparison without replacing earlier products or fetching live data", async () => {
  await act(async () => root.render(<CommerceShowcase />));
  expect(host.querySelectorAll(".qc-turn")).toHaveLength(1);
  expect(host.querySelector('[data-turn="0"]')?.textContent).toContain("$36.00");
  await act(async () => button("Keep it under $30").click());
  expect(host.querySelectorAll(".qc-turn")).toHaveLength(2);
  expect(host.querySelectorAll(".qc-products .commerce-product")).toHaveLength(4);
  expect(host.querySelector('[data-turn="0"]')?.textContent).toContain("$36.00");
  expect(host.querySelector('[data-turn="1"]')?.textContent).not.toContain("$36.00");
  expect(host.querySelector('[data-turn="1"]')?.textContent).toContain("cotton preference");
  await act(async () => button("Compare these two").click());
  expect(host.querySelectorAll(".qc-turn")).toHaveLength(3);
  expect(host.querySelector(".qc-comparison")?.textContent).toContain("$22.00");
  expect(host.querySelector(".qc-comparison")?.textContent).toContain("sand");
  await act(async () => button("View Easy blue button-down").click());
  expect(host.querySelector("dialog")?.open).toBe(true);
  expect(host.querySelector("dialog dl")?.textContent).toContain("cotton");
  await act(async () => button("Close product details").click());
  expect(host.querySelector("dialog")).toBeNull();
  await act(async () => button("Restart preview").click());
  expect(host.querySelectorAll(".qc-turn")).toHaveLength(1);
  expect(fetch).not.toHaveBeenCalled();
});
it("types the next request at the bottom, adds the user turn, then appends the reply", async () => {
  vi.useFakeTimers();
  await act(async () => root.render(<CommerceShowcase />));
  await tick(4000);
  const typed = host.querySelector(".qc-composer output")?.textContent ?? "";
  expect(typed.length).toBeGreaterThan(0);
  expect(typed.length).toBeLessThan("Keep it under $30".length);
  expect(host.querySelectorAll(".qc-turn")).toHaveLength(1);
  await tick(1000);
  expect(host.querySelector(".qc-incoming .qc-user")?.textContent).toBe("Keep it under $30");
  expect(host.querySelector('[aria-label="Querix is preparing a reply"]')).not.toBeNull();
  await tick(600);
  expect(host.querySelectorAll(".qc-turn")).toHaveLength(2);
  expect(host.querySelector(".qc-incoming")).toBeNull();
  await tick(5500);
  expect(host.querySelectorAll(".qc-turn")).toHaveLength(3);
  await tick(30000);
  expect(host.querySelectorAll(".qc-turn")).toHaveLength(3);
});
it("pauses and resumes an in-progress draft without losing its position", async () => {
  vi.useFakeTimers();
  await act(async () => root.render(<CommerceShowcase />));
  await tick(4000);
  const draft = host.querySelector(".qc-composer output")?.textContent;
  await act(async () => button("Pause preview").click());
  await tick(20000);
  expect(host.querySelector(".qc-composer output")?.textContent).toBe(draft);
  await act(async () => button("Play preview").click());
  await tick(1600);
  expect(host.querySelectorAll(".qc-turn")).toHaveLength(2);
});
it("finishes a long playback interval without skipping or duplicating conversation turns", async () => {
  vi.useFakeTimers();
  await act(async () => root.render(<CommerceShowcase />));
  await tick(30000);
  expect(host.querySelectorAll(".qc-turn")).toHaveLength(3);
  expect(host.querySelectorAll(".qc-comparison")).toHaveLength(1);
  expect(host.querySelectorAll(".qc-products .commerce-product")).toHaveLength(4);
  await tick(30000);
  expect(host.querySelectorAll(".qc-turn")).toHaveLength(3);
});
it("leaves reduced-motion examples under visitor control", async () => {
  vi.useFakeTimers();
  vi.mocked(matchMedia).mockReturnValue({
    matches: true,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  } as unknown as MediaQueryList);
  await act(async () => root.render(<CommerceShowcase />));
  await tick(20000);
  expect(host.querySelectorAll(".qc-turn")).toHaveLength(1);
  await act(async () => button("Keep it under $30").click());
  expect(host.querySelectorAll(".qc-turn")).toHaveLength(2);
  await act(async () => button("Compare these two").click());
  await act(async () => button("Replay conversation").click());
  expect(host.querySelectorAll(".qc-turn")).toHaveLength(1);
});
it("freezes an in-flight draft when reduced motion is enabled", async () => {
  vi.useFakeTimers();
  await act(async () => root.render(<CommerceShowcase />));
  await tick(4000);
  const draft = host.querySelector(".qc-composer output")?.textContent;
  await act(async () => motionChange?.({ matches: true }));
  await tick(20000);
  expect(host.querySelector(".qc-composer output")?.textContent).toBe(draft);
  await act(async () => button("Send next example").click());
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
  await act(async () => button("Keep it under $30").click());
  expect(thread.scrollTo).not.toHaveBeenCalled();
  await act(async () => button("Jump to latest example").click());
  expect(thread.scrollTo).toHaveBeenCalledWith({ top: 1200, behavior: "smooth" });
});
it("resets the thread and catalog when the visitor chooses a different example", async () => {
  await act(async () => root.render(<CommerceShowcase />));
  await act(async () => button("Keep it under $30").click());
  await act(async () => button("Beauty").click());
  expect(host.querySelectorAll(".qc-turn")).toHaveLength(1);
  expect(host.querySelector(".qc-thread")?.textContent).not.toContain("cotton");
  await act(async () => button("Keep it under $20").click());
  expect(host.querySelector('[data-turn="1"]')?.textContent).toContain("fragrance-free");
  expect(host.querySelector('[data-turn="1"]')?.textContent).not.toContain("$24.00");
  await act(async () => button("Compare these two").click());
  expect(host.querySelector(".qc-comparison")?.textContent).toContain("40 ml");
  expect(host.querySelector(".qc-comparison")?.textContent).toContain("$9.00");
});
it("waits for the introduction and pauses outside the viewport or in a hidden tab", async () => {
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
  await tick(20000);
  expect(host.querySelectorAll(".qc-turn")).toHaveLength(1);
  await act(async () => document.documentElement.removeAttribute("data-qx-intro"));
  await visible(false);
  await tick(20000);
  expect(host.querySelectorAll(".qc-turn")).toHaveLength(1);
  await visible(true);
  const hidden = vi.spyOn(document, "hidden", "get").mockReturnValue(true);
  await act(async () => document.dispatchEvent(new Event("visibilitychange")));
  await tick(20000);
  expect(host.querySelectorAll(".qc-turn")).toHaveLength(1);
  hidden.mockReturnValue(false);
  await act(async () => document.dispatchEvent(new Event("visibilitychange")));
  await tick(5500);
  expect(host.querySelectorAll(".qc-turn")).toHaveLength(2);
});
it("ends the brief home preview after refinement and links to the full walkthrough", async () => {
  vi.useFakeTimers();
  await act(async () => root.render(<CommerceShowcase brief />));
  await tick(30000);
  expect(host.querySelectorAll(".qc-turn")).toHaveLength(2);
  expect(host.querySelector(".qc-comparison")).toBeNull();
  expect(host.querySelector(".qc-suggestion")).toBeNull();
  expect(host.querySelector(".qc-examples")).toBeNull();
  expect(host.querySelector(".qc-footer a")?.getAttribute("href")).toBe(
    "/use-cases/conversational-commerce",
  );
  expect(host.querySelector('[role="status"]')?.textContent).toContain("2 of 2 replies");
  await act(async () => button("Replay conversation").click());
  await tick(2300);
  expect(host.querySelectorAll(".qc-turn")).toHaveLength(1);
});
it("starts the full walkthrough with skincare and preserves both category examples", async () => {
  await act(async () => root.render(<CommerceShowcase initialScenario="beauty" />));
  expect(host.querySelector(".qc-thread")?.textContent).toContain("fragrance-free");
  await act(async () => button("Keep it under $20").click());
  await act(async () => button("Compare these two").click());
  expect(host.querySelector(".qc-comparison")?.textContent).toContain("40 ml");
  await act(async () => button("Fashion").click());
  expect(host.querySelectorAll(".qc-turn")).toHaveLength(1);
  expect(host.querySelector(".qc-thread")?.textContent).toContain("cotton");
});
