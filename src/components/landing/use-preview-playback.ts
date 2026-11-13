import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

const REDUCED_MOTION = 1;
const PAUSED_DOCUMENT = 2;
const serverEnvironment = () => PAUSED_DOCUMENT;

/** Autoplay belongs to a visible preview, after the introduction and with motion allowed. */
export function usePreviewPlayback() {
  const preview = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const motion = useMemo(
    () =>
      typeof window === "undefined"
        ? undefined
        : window.matchMedia?.("(prefers-reduced-motion: reduce)"),
    [],
  );
  const readEnvironment = useCallback(
    () =>
      (motion?.matches ? REDUCED_MOTION : 0) |
      (document.hidden || document.documentElement.hasAttribute("data-qx-intro")
        ? PAUSED_DOCUMENT
        : 0),
    [motion],
  );
  const subscribe = useCallback(
    (notify: () => void) => {
      const intro = new MutationObserver(notify);
      intro.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-qx-intro"],
      });
      motion?.addEventListener("change", notify);
      document.addEventListener("visibilitychange", notify);
      return () => {
        intro.disconnect();
        motion?.removeEventListener("change", notify);
        document.removeEventListener("visibilitychange", notify);
      };
    },
    [motion],
  );
  const environment = useSyncExternalStore(subscribe, readEnvironment, serverEnvironment);

  useEffect(() => {
    if (typeof IntersectionObserver !== "function") return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting && entry.intersectionRatio >= 0.35),
      { threshold: [0, 0.35] },
    );
    if (preview.current) observer.observe(preview.current);
    return () => observer.disconnect();
  }, []);

  const reducedMotion = Boolean(environment & REDUCED_MOTION);
  const visible = typeof IntersectionObserver !== "function" || inView;
  const canAdvance = visible && !reducedMotion && !(environment & PAUSED_DOCUMENT);
  return { preview, canAdvance, reducedMotion };
}
