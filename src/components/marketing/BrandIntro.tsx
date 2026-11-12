import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import "./brand-intro.css";

const REVEAL_AT = 1950;
const FINISH_AT = 2400;

export function BrandIntro({ children }: { children: ReactNode }) {
  const [dismissed, setDismissed] = useState(false);
  const content = useRef<HTMLDivElement>(null);
  const intro = useRef<HTMLDivElement>(null);
  const shouldPlay = useRef(
    typeof document !== "undefined" && document.documentElement.hasAttribute("data-qx-intro"),
  );

  useEffect(() => {
    const html = document.documentElement;
    if (!shouldPlay.current) return;

    const motion = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (motion?.matches) {
      html.removeAttribute("data-qx-intro");
      return;
    }

    html.setAttribute("data-qx-intro", "active");
    const page = content.current;
    page?.setAttribute("inert", "");
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    intro.current?.focus({ preventScroll: true });

    function finish() {
      const restoreFocus = intro.current?.contains(document.activeElement);
      release();
      setDismissed(true);
      // Move focus after React removes the intro dialog.
      if (restoreFocus) {
        window.requestAnimationFrame(() => content.current?.focus({ preventScroll: true }));
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") finish();
      if (event.key === "Tab") {
        event.preventDefault();
        intro.current?.focus({ preventScroll: true });
      }
    }
    function onMotionChange(event: MediaQueryListEvent) {
      if (event.matches) finish();
    }
    const reveal = window.setTimeout(
      () => html.setAttribute("data-qx-intro", "revealing"),
      REVEAL_AT,
    );
    const end = window.setTimeout(finish, FINISH_AT);
    document.addEventListener("keydown", onKeyDown);
    motion?.addEventListener("change", onMotionChange);

    function release() {
      window.clearTimeout(reveal);
      window.clearTimeout(end);
      document.removeEventListener("keydown", onKeyDown);
      motion?.removeEventListener("change", onMotionChange);
      html.removeAttribute("data-qx-intro");
      page?.removeAttribute("inert");
      document.body.style.overflow = previousOverflow;
    }
    return release;
  }, []);

  return (
    <>
      {!dismissed && (
        <div
          ref={intro}
          className="qx-intro"
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label="Querix AI introduction"
        >
          <div className="qx-intro-logo">
            <IntroMark />
          </div>
        </div>
      )}
      <div ref={content} className="qx-intro-content" tabIndex={-1}>
        {children}
      </div>
    </>
  );
}

// Preserve the original icon artwork; animate only its three blue signal dots.
function IntroMark() {
  const maskId = `intro-mark-${useId().replaceAll(":", "")}`;
  return (
    <svg
      className="qx-intro-mark"
      viewBox="48 435 250 250"
      width="156"
      height="156"
      aria-hidden="true"
    >
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse" x="48" y="435" width="250" height="250">
          <rect x="48" y="435" width="250" height="250" fill="white" />
          <rect x="108" y="534" width="118" height="40" fill="black" />
        </mask>
      </defs>
      <image
        className="qx-intro-artwork"
        href="/querixai-logo.png"
        width="1380"
        height="1020"
        mask={`url(#${maskId})`}
      />
      <g className="qx-intro-signals" fill="#65A5FF">
        <circle cx="129" cy="554" r="14" />
        <circle cx="168" cy="554" r="14" />
        <circle cx="206" cy="554" r="14" />
      </g>
    </svg>
  );
}
