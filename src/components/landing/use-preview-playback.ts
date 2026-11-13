import { useEffect, useRef, useState } from "react";

/** Autoplay belongs to a visible preview, after the introduction and with motion allowed. */
export function usePreviewPlayback() {
  const preview = useRef<HTMLDivElement>(null);
  const [canAdvance, setCanAdvance] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    const motion = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    let reduced = motion?.matches ?? false;
    setReducedMotion(reduced);
    let visible = typeof IntersectionObserver !== "function";
    function update() {
      setCanAdvance(visible && !reduced && !document.hidden && !html.hasAttribute("data-qx-intro"));
    }
    function motionChanged(event: MediaQueryListEvent) {
      reduced = event.matches;
      setReducedMotion(reduced);
      update();
    }
    const observer =
      typeof IntersectionObserver === "function"
        ? new IntersectionObserver(
            ([entry]) => {
              visible = entry.isIntersecting && entry.intersectionRatio >= 0.35;
              update();
            },
            { threshold: [0, 0.35] },
          )
        : undefined;
    if (preview.current) observer?.observe(preview.current);
    const intro = new MutationObserver(update);
    intro.observe(html, { attributes: true, attributeFilter: ["data-qx-intro"] });
    motion?.addEventListener("change", motionChanged);
    document.addEventListener("visibilitychange", update);
    update();
    return () => {
      observer?.disconnect();
      intro.disconnect();
      motion?.removeEventListener("change", motionChanged);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  return { preview, canAdvance, reducedMotion };
}
