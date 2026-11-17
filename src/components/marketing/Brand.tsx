import { QuerixLogo } from "@/components/QuerixLogo";
import "./brand.css";

export function Brand({
  light = false,
  markOnly = false,
  interactive = false,
}: {
  light?: boolean;
  markOnly?: boolean;
  interactive?: boolean;
}) {
  return (
    <span className={`qx-brand${light ? " qx-brand-light" : ""}`}>
      <QuerixLogo
        size={44}
        tone={light ? "dark" : "light"}
        markOnly={markOnly}
        motion={interactive ? "interactive" : "none"}
        className={markOnly ? "qx-mark" : "qx-logo"}
      />
    </span>
  );
}
