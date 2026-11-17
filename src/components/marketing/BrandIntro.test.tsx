import { act, StrictMode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { BrandIntro } from "./BrandIntro";
import { brandIntroBootstrap } from "./brand-intro-bootstrap";

let root: Root;
let host: HTMLDivElement;
let reduced = false;
let motionListener: ((event: { matches: boolean }) => void) | undefined;

beforeEach(() => {
  vi.useFakeTimers();
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  sessionStorage.clear();
  history.replaceState(null, "", "/");
  reduced = false;
  motionListener = undefined;
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      matches: reduced,
      addEventListener: vi.fn((_event, listener) => {
        motionListener = listener;
      }),
      removeEventListener: vi.fn(),
    })),
  );
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});

afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  document.documentElement.removeAttribute("data-qx-intro");
  document.body.style.overflow = "";
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function bootstrap() {
  window.eval(brandIntroBootstrap);
}
async function render(strict = false) {
  const intro = (
    <BrandIntro>
      <main>Website content</main>
    </BrandIntro>
  );
  await act(async () => root.render(strict ? <StrictMode>{intro}</StrictMode> : intro));
}

it("reveals the loaded page after a bounded first-visit intro", async () => {
  bootstrap();
  expect(document.documentElement.dataset.qxIntro).toBe("active");
  await render();
  expect(host.querySelector("main")?.textContent).toBe("Website content");
  expect(host.querySelector(".qx-intro-content")?.hasAttribute("inert")).toBe(true);
  expect(document.body.style.overflow).toBe("hidden");
  await act(async () => vi.advanceTimersByTime(1950));
  expect(document.documentElement.dataset.qxIntro).toBe("revealing");
  await act(async () => vi.advanceTimersByTime(450));
  expect(host.querySelector('[role="dialog"]')).toBeNull();
  expect(host.querySelector(".qx-intro-content")?.hasAttribute("inert")).toBe(false);
  expect(document.body.style.overflow).toBe("");
});

it("does not replay on another page load within the same tab session", async () => {
  bootstrap();
  document.documentElement.removeAttribute("data-qx-intro");
  bootstrap();
  await render();
  expect(document.documentElement.hasAttribute("data-qx-intro")).toBe(false);
  expect(host.querySelector(".qx-intro-content")?.hasAttribute("inert")).toBe(false);
});

it.each([
  "/commerce/login",
  "/demo/commerce",
  "/clothing",
  "/commerce/account",
  "/analytics/company/login",
  "/internal/analytics/login",
])("keeps the intro out of private workflows at %s", async (pathname) => {
  history.replaceState(null, "", pathname);
  bootstrap();
  await render();
  expect(document.documentElement.hasAttribute("data-qx-intro")).toBe(false);
  expect(sessionStorage.getItem("querix-brand-intro-v1")).toBeNull();
});

it("skips motion entirely for reduced-motion visitors", async () => {
  reduced = true;
  bootstrap();
  await render();
  expect(document.documentElement.hasAttribute("data-qx-intro")).toBe(false);
  expect(document.body.style.overflow).toBe("");
});

it("restores keyboard access after Escape without later trapping Tab", async () => {
  bootstrap();
  await render();
  expect(document.activeElement).toBe(host.querySelector('[role="dialog"]'));
  await act(async () => document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })));
  await act(async () => vi.advanceTimersByTime(20));
  expect(document.activeElement).toBe(host.querySelector(".qx-intro-content"));
  const tab = new KeyboardEvent("keydown", { key: "Tab", cancelable: true });
  document.dispatchEvent(tab);
  expect(tab.defaultPrevented).toBe(false);
  await act(async () => vi.advanceTimersByTime(3000));
  expect(document.documentElement.hasAttribute("data-qx-intro")).toBe(false);
});

it("shows only the animated logo and keeps focus within the intro until it finishes", async () => {
  bootstrap();
  await render();
  const intro = host.querySelector('[role="dialog"]')!;
  expect(intro.querySelector(".qx-intro-logo")).not.toBeNull();
  expect(intro.querySelector("image")?.getAttribute("href")).toBe("/querixai-logo.png");
  expect(intro.querySelectorAll(".qx-logo-dots circle")).toHaveLength(6);
  expect(intro.querySelector("button")).toBeNull();
  expect(intro.textContent?.trim()).toBe("");
  const tab = new KeyboardEvent("keydown", { key: "Tab", cancelable: true });
  await act(async () => document.dispatchEvent(tab));
  expect(document.activeElement).toBe(intro);
  await act(async () => vi.advanceTimersByTime(2420));
  expect(host.querySelector('[role="dialog"]')).toBeNull();
  expect(host.querySelector(".qx-intro-content")?.hasAttribute("inert")).toBe(false);
  expect(document.activeElement).toBe(host.querySelector(".qx-intro-content"));
});

it("dismisses immediately when reduced motion is enabled during playback", async () => {
  bootstrap();
  await render();
  await act(async () => motionListener?.({ matches: true }));
  expect(host.querySelector('[role="dialog"]')).toBeNull();
  expect(document.body.style.overflow).toBe("");
});

it("fails open if the application never hydrates", () => {
  bootstrap();
  vi.advanceTimersByTime(3400);
  expect(document.documentElement.hasAttribute("data-qx-intro")).toBe(false);
});

it("still finishes when browser storage is unavailable", async () => {
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
    throw new Error("denied");
  });
  bootstrap();
  await render();
  await act(async () => vi.advanceTimersByTime(2400));
  expect(document.documentElement.hasAttribute("data-qx-intro")).toBe(false);
  expect(host.querySelector(".qx-intro-content")?.hasAttribute("inert")).toBe(false);
});

it("survives the development Strict Mode effect replay", async () => {
  bootstrap();
  await render(true);
  expect(document.documentElement.dataset.qxIntro).toBe("active");
  await act(async () => vi.advanceTimersByTime(2400));
  expect(document.documentElement.hasAttribute("data-qx-intro")).toBe(false);
  expect(host.querySelector(".qx-intro-content")?.hasAttribute("inert")).toBe(false);
  expect(document.body.style.overflow).toBe("");
});
