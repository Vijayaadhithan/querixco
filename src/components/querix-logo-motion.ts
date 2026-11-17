/** Original artwork positions: three inner signals and three dots along the Q's tail. */
export const LOGO_DOTS = [
  { x: 128.875, y: 553.73, radius: 14, inner: true },
  { x: 167.5, y: 553.73, radius: 14, inner: true },
  { x: 206.125, y: 553.73, radius: 14, inner: true },
  { x: 239.9, y: 640.2, radius: 15.7, inner: false },
  { x: 265.25, y: 653.63, radius: 10.1, inner: false },
  { x: 285.2, y: 655.96, radius: 6.8, inner: false },
] as const;

export type LogoMotionStyle = "orbit" | "ripple";
const ease = (t: number) => t * t * (3 - 2 * t);
const round = (n: number) => Number(n.toFixed(3));

/** One shared orbit, then an eased return to each original position. */
export function thinkingFrames(index: number, style: LogoMotionStyle = "orbit"): Keyframe[] {
  const dot = LOGO_DOTS[index];
  const angle = ((index * 60 - 150) * Math.PI) / 180;
  const point = (rotation: number) => ({
    x: 167.5 + 48 * Math.cos(angle + rotation),
    y: 553.73 + 48 * Math.sin(angle + rotation),
  });
  return Array.from({ length: 61 }, (_, frame) => {
    const p = frame / 60;
    let x = 0,
      y = 0,
      scale = 1,
      opacity = 1;
    if (p > 0 && p < 0.87) {
      if (style === "ripple") {
        const t = p / 0.87;
        const pulse =
          (Math.sin(Math.PI * t) * (1 - Math.cos(2 * Math.PI * (t * 2 - index / 8)))) / 2;
        x = dot.inner ? 0 : -1.5 * pulse;
        y = (dot.inner ? -3 : -1.5) * pulse;
        scale = 1 + 0.13 * pulse;
        opacity = 1 - 0.45 * pulse;
      } else {
        let position;
        if (p < 0.22) {
          const t = ease(p / 0.22),
            target = point(0);
          position = { x: dot.x + (target.x - dot.x) * t, y: dot.y + (target.y - dot.y) * t };
        } else if (p < 0.62) {
          position = point((ease((p - 0.22) / 0.4) * Math.PI * 2) / 3);
        } else {
          const t = ease((p - 0.62) / 0.25),
            start = point((Math.PI * 2) / 3);
          position = { x: start.x + (dot.x - start.x) * t, y: start.y + (dot.y - start.y) * t };
        }
        x = position.x - dot.x;
        y = position.y - dot.y;
      }
    }
    return {
      offset: p,
      transform: `translate(${round(x)}px, ${round(y)}px) scale(${round(scale)})`,
      opacity: round(opacity),
    };
  });
}
