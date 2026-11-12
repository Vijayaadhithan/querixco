import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function Reveal({ children, className = "", delay = 0 }: RevealProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const motion = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const supportsIntersectionObserver = typeof window.IntersectionObserver === "function";
    if (!supportsIntersectionObserver || motion?.matches) {
      const frame = window.requestAnimationFrame(() => setVisible(true));
      return () => window.cancelAnimationFrame(frame);
    }

    element.dataset.reveal = "pending";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setVisible(true);
        observer.unobserve(entry.target);
      },
      {
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.08,
      },
    );

    observer.observe(element);
    function motionChanged(event: MediaQueryListEvent) {
      if (event.matches) {
        setVisible(true);
        observer.disconnect();
      }
    }
    motion?.addEventListener("change", motionChanged);
    return () => {
      observer.disconnect();
      motion?.removeEventListener("change", motionChanged);
      element.removeAttribute("data-reveal");
    };
  }, []);

  return (
    <div
      ref={elementRef}
      data-reveal={visible ? "visible" : undefined}
      className={`reveal-on-scroll ${visible ? "is-visible" : ""} ${className}`}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}
