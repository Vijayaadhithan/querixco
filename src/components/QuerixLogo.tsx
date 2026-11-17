import { useEffect, useId, useRef } from "react";
import { LOGO_DOTS, thinkingFrames, type LogoMotionStyle } from "./querix-logo-motion";
import "./querix-logo.css";

type QuerixLogoProps = {
  className?: string;
  size?: number;
  tone?: "dark" | "light";
  markOnly?: boolean;
  motion?: "none" | "intro" | "interactive";
  motionStyle?: LogoMotionStyle;
};

export function QuerixLogo({
  className = "",
  size = 40,
  tone = "dark",
  markOnly = false,
  motion = "none",
  motionStyle = "orbit",
}: QuerixLogoProps) {
  const id = useId().replaceAll(":", "");
  const filterId = `querix-logo-${id}`;
  const maskId = `querix-dots-${id}`;
  const clipId = `querix-mark-${id}`;
  const svg = useRef<SVGSVGElement>(null);
  const moving = motion !== "none";

  useEffect(() => {
    const node = svg.current;
    if (!node || !moving) return;
    const dots = [...node.querySelectorAll<SVGCircleElement>(".qx-logo-dot")];
    const media = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const target = node.closest("a") ?? node;
    let animations: Animation[] = [];
    let hovered = false;
    let focused = false;

    function cancel() {
      animations.forEach((animation) => animation.cancel());
      animations = [];
    }
    function play() {
      if (media?.matches || typeof dots[0]?.animate !== "function") return;
      cancel();
      animations = dots.map((dot, index) =>
        dot.animate(thinkingFrames(index, motionStyle), {
          duration: motion === "intro" ? 1700 : 1500,
          delay: motionStyle === "orbit" ? 0 : index * 30,
          easing: "linear",
          iterations: 1,
          fill: "none",
        }),
      );
    }
    function settle() {
      if (!animations.length) return;
      if (media?.matches || typeof dots[0]?.animate !== "function") {
        cancel();
        return;
      }
      const current = dots.map((dot) => {
        const style = window.getComputedStyle(dot);
        return { transform: style.transform, opacity: style.opacity };
      });
      cancel();
      animations = dots.map((dot, index) =>
        dot.animate([current[index], { transform: "translate(0px, 0px) scale(1)", opacity: 1 }], {
          duration: 260,
          easing: "cubic-bezier(.22, 1, .36, 1)",
          fill: "none",
        }),
      );
    }
    function enter(event: Event) {
      if ((event as PointerEvent).pointerType === "touch") return;
      hovered = true;
      if (!focused) play();
    }
    function leave() {
      hovered = false;
      if (!focused) settle();
    }
    function focus() {
      focused = true;
      if (!hovered) play();
    }
    function blur() {
      focused = false;
      if (!hovered) settle();
    }
    function touch(event: Event) {
      if ((event as PointerEvent).pointerType === "touch") play();
    }
    function motionChange() {
      if (media?.matches) cancel();
    }

    if (motion === "intro") play();
    else {
      target.addEventListener("pointerenter", enter);
      target.addEventListener("pointerleave", leave);
      target.addEventListener("focusin", focus);
      target.addEventListener("focusout", blur);
      target.addEventListener("pointerdown", touch);
    }
    media?.addEventListener("change", motionChange);
    return () => {
      cancel();
      target.removeEventListener("pointerenter", enter);
      target.removeEventListener("pointerleave", leave);
      target.removeEventListener("focusin", focus);
      target.removeEventListener("focusout", blur);
      target.removeEventListener("pointerdown", touch);
      media?.removeEventListener("change", motionChange);
    };
  }, [motion, moving, motionStyle]);

  return (
    <svg
      ref={svg}
      width={markOnly ? size : Math.round(size * 3.5)}
      height={size}
      viewBox={markOnly ? "48 435 250 250" : "40 435 1050 300"}
      xmlns="http://www.w3.org/2000/svg"
      className={`${className}${moving ? " qx-logo-motion" : ""}`}
      role={motion === "intro" ? undefined : "img"}
      aria-label={motion === "intro" ? undefined : "Querix AI"}
      aria-hidden={motion === "intro" ? true : undefined}
    >
      <defs>
        {markOnly && (
          <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
            <rect x="48" y="435" width="250" height="250" />
          </clipPath>
        )}
        {tone === "dark" && (
          <filter
            id={filterId}
            x="0"
            y="0"
            width="1380"
            height="1020"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            {/* Adapt the original black artwork for dark surfaces, preserving its blue. */}
            <feColorMatrix
              type="matrix"
              values="1.48 0 -1.48 0 1
                      1.25 0 -1.25 0 1
                      0.48 0 -0.48 0 1
                      0    0  0    1 0"
            />
          </filter>
        )}
        {moving && (
          <mask
            id={maskId}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="1380"
            height="1020"
            style={{ maskType: "luminance" }}
          >
            <rect width="1380" height="1020" fill="white" />
            <rect x="111" y="536" width="114" height="36" fill="black" />
            {LOGO_DOTS.slice(3).map((dot, index) => (
              <circle key={index} cx={dot.x} cy={dot.y} r={dot.radius + 1} fill="black" />
            ))}
            {/* The first tail dot touches the Q. Retain the ring under that dot's mask. */}
            <circle cx="167.5" cy="553.5" r="96.75" fill="none" stroke="white" strokeWidth="25.5" />
          </mask>
        )}
      </defs>
      <image
        href="/querixai-logo.png"
        width="1380"
        height="1020"
        preserveAspectRatio="xMidYMid meet"
        filter={tone === "dark" ? `url(#${filterId})` : undefined}
        clipPath={markOnly ? `url(#${clipId})` : undefined}
        mask={moving ? `url(#${maskId})` : undefined}
      />
      {moving && (
        <g className="qx-logo-dots">
          {LOGO_DOTS.map((dot, index) => (
            <circle
              key={index}
              className="qx-logo-dot"
              cx={dot.x}
              cy={dot.y}
              r={dot.radius}
              fill={
                dot.inner
                  ? tone === "dark"
                    ? "#1a3db5"
                    : "#00269b"
                  : tone === "dark"
                    ? "#ffffff"
                    : "#111111"
              }
            />
          ))}
        </g>
      )}
    </svg>
  );
}
