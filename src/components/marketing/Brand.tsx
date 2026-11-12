import { QuerixLogo } from "@/components/QuerixLogo";
import "./brand.css";

export function Brand({
  light = false,
  markOnly = false,
}: {
  light?: boolean;
  markOnly?: boolean;
}) {
  return (
    <span className={`qx-brand${light ? " qx-brand-light" : ""}`}>
      <QuerixLogo
        size={44}
        tone={light ? "dark" : "light"}
        markOnly={markOnly}
        className={markOnly ? "qx-mark" : "qx-logo"}
      />
    </span>
  );
}
