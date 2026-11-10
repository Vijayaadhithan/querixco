import { useEffect, useRef, useState, type ReactNode } from "react";
import { Brand } from "./Brand";
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
      const restoreFocus = document.activeElement === intro.current;
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
            <Brand markOnly />
          </div>
        </div>
      )}
      <div ref={content} className="qx-intro-content" tabIndex={-1}>
        {children}
      </div>
    </>
  );
}
