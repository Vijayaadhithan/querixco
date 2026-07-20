import { useId } from "react";

type QuerixLogoProps = {
  className?: string;
  size?: number;
  tone?: "dark" | "light";
};

export function QuerixLogo({ className = "", size = 40, tone = "dark" }: QuerixLogoProps) {
  const filterId = `querix-logo-${useId().replaceAll(":", "")}`;

  return (
    <svg
      width={Math.round(size * 3.5)}
      height={size}
      viewBox="40 435 1050 300"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Querix AI"
    >
      {tone === "dark" && (
        <defs>
          <filter
            id={filterId}
            x="0"
            y="0"
            width="1380"
            height="1020"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            {/* Keep the logo blue while adapting its black artwork for dark surfaces. */}
            <feColorMatrix
              type="matrix"
              values="1.48 0 -1.48 0 1
                      1.25 0 -1.25 0 1
                      0.48 0 -0.48 0 1
                      0    0  0    1 0"
            />
          </filter>
        </defs>
      )}
      <image
        href="/querixai-logo.png"
        width="1380"
        height="1020"
        preserveAspectRatio="xMidYMid meet"
        filter={tone === "dark" ? `url(#${filterId})` : undefined}
      />
    </svg>
  );
}
