import { act, StrictMode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { QuerixLogo } from "./QuerixLogo";

let root: Root;
let host: HTMLDivElement;
let reduced = false;
let motionChange: (() => void) | undefined;
const cancel = vi.fn();
const animate = vi.fn(() => ({ cancel }) as unknown as Animation);

beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  reduced = false;
  motionChange = undefined;
  animate.mockClear();
  cancel.mockClear();
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      get matches() {
        return reduced;
      },
      addEventListener: (_event: string, listener: () => void) => {
        motionChange = listener;
      },
      removeEventListener: vi.fn(),
    })),
  );
  Object.defineProperty(Element.prototype, "animate", { configurable: true, value: animate });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  Reflect.deleteProperty(Element.prototype, "animate");
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
async function renderHeader(strict = false) {
  const logo = (
    <a href="/" aria-label="Querix AI home">
      <QuerixLogo motion="interactive" />
      <span>Home</span>
    </a>
  );
  await act(async () => root.render(strict ? <StrictMode>{logo}</StrictMode> : logo));
}
async function event(name: string) {
  await act(async () => host.querySelector("a")!.dispatchEvent(new Event(name, { bubbles: true })));
}

it.each(["orbit", "ripple"] as const)(
  "animates all six dots once with %s and restores their resting transforms",
  async (motionStyle) => {
    await act(async () =>
      root.render(<QuerixLogo markOnly motion="intro" motionStyle={motionStyle} />),
    );
    expect(host.querySelectorAll(".qx-logo-dot")).toHaveLength(6);
    expect(animate).toHaveBeenCalledTimes(6);
    const frames = animate.mock.calls as unknown as [Keyframe[], KeyframeAnimationOptions][];
    for (const [keyframes, options] of frames) {
      expect(options.iterations).toBe(1);
      expect(Number(options.duration) + Number(options.delay)).toBeLessThan(1950);
      expect(keyframes.some((frame) => frame.transform !== "translate(0px, 0px) scale(1)")).toBe(
        true,
      );
      expect(keyframes.at(-1)).toMatchObject({
        transform: "translate(0px, 0px) scale(1)",
        opacity: 1,
      });
    }
  },
);

it("keeps the header still until the whole home link is hovered and plays again on a new hover", async () => {
  await renderHeader();
  expect(animate).not.toHaveBeenCalled();
  await event("pointerenter");
  expect(animate).toHaveBeenCalledTimes(6);
  await event("pointerleave");
  expect(cancel).toHaveBeenCalledTimes(6);
  expect(animate).toHaveBeenCalledTimes(12);
  const returns = (animate.mock.calls as unknown as [Keyframe[], KeyframeAnimationOptions][]).slice(
    6,
  );
  returns.forEach(([frames, options]) => {
    expect(options.duration).toBe(260);
    expect(frames.at(-1)).toMatchObject({ transform: "translate(0px, 0px) scale(1)", opacity: 1 });
  });
  await event("pointerenter");
  expect(animate).toHaveBeenCalledTimes(18);
});

it("supports keyboard focus and retains the cycle while either focus or hover remains", async () => {
  await renderHeader();
  await event("focusin");
  expect(animate).toHaveBeenCalledTimes(6);
  await event("pointerenter");
  await event("pointerleave");
  expect(animate).toHaveBeenCalledTimes(6);
  await event("focusout");
  expect(animate).toHaveBeenCalledTimes(12);
});

it("does not animate for reduced motion and immediately cancels movement when enabled", async () => {
  reduced = true;
  await renderHeader();
  await event("pointerenter");
  await event("pointerleave");
  await event("focusin");
  expect(animate).not.toHaveBeenCalled();
  reduced = false;
  await event("focusout");
  animate.mockClear();
  cancel.mockClear();
  await event("pointerenter");
  expect(animate).toHaveBeenCalledTimes(6);
  reduced = true;
  await act(async () => motionChange?.());
  expect(cancel).toHaveBeenCalledTimes(6);
});

it("cleans up animations and event handlers across Strict Mode replay and unmount", async () => {
  await renderHeader(true);
  const link = host.querySelector("a")!;
  await event("pointerenter");
  expect(animate).toHaveBeenCalledTimes(6);
  await act(async () => root.render(null));
  expect(cancel).toHaveBeenCalledTimes(6);
  link.dispatchEvent(new Event("pointerenter"));
  expect(animate).toHaveBeenCalledTimes(6);
});

it("leaves noninteractive logos static and gives each animated instance separate SVG mask references", async () => {
  await act(async () =>
    root.render(
      <>
        <QuerixLogo />
        <QuerixLogo motion="interactive" />
        <QuerixLogo motion="interactive" />
      </>,
    ),
  );
  const logos = [...host.querySelectorAll("svg")];
  expect(logos[0].querySelector(".qx-logo-dots")).toBeNull();
  const masks = logos.slice(1).map((logo) => logo.querySelector("mask")!.id);
  expect(new Set(masks).size).toBe(2);
  logos
    .slice(1)
    .forEach((logo, index) =>
      expect(logo.querySelector("image")!.getAttribute("mask")).toBe(`url(#${masks[index]})`),
    );
  expect(animate).not.toHaveBeenCalled();
});

it("clips symbol-only artwork so the wordmark cannot escape an overflowing intro SVG", async () => {
  await act(async () =>
    root.render(
      <>
        <QuerixLogo markOnly motion="intro" />
        <QuerixLogo motion="interactive" />
      </>,
    ),
  );
  const [intro, header] = [...host.querySelectorAll("svg")];
  const clip = intro.querySelector("clipPath")!;
  expect(intro.querySelector("image")!.getAttribute("clip-path")).toBe(`url(#${clip.id})`);
  const crop = clip.querySelector("rect")!;
  expect(
    [
      crop.getAttribute("x"),
      crop.getAttribute("y"),
      crop.getAttribute("width"),
      crop.getAttribute("height"),
    ].join(" "),
  ).toBe(intro.getAttribute("viewBox"));
  expect(header.querySelector("image")!.hasAttribute("clip-path")).toBe(false);
});
