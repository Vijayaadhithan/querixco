import "./brand.css";

export function Brand({
  light = false,
  markOnly = false,
}: {
  light?: boolean;
  markOnly?: boolean;
}) {
  return (
    <span className={`qx-brand${light ? " qx-brand-light" : ""}`} role="img" aria-label="Querix AI">
      <svg className="qx-mark" viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <circle
          className="qx-mark-ring"
          cx="29"
          cy="29"
          r="23"
          stroke="currentColor"
          strokeWidth="6"
          pathLength="100"
        />
        <path d="m46 46 7 7" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
        <circle cx="58" cy="57" r="2.4" fill="currentColor" />
        <g fill="#2764ed" className="qx-mark-dots">
          <circle cx="19" cy="29" r="3.5" />
          <circle cx="29" cy="29" r="3.5" />
          <circle cx="39" cy="29" r="3.5" />
        </g>
      </svg>
      {!markOnly && (
        <span className="qx-wordmark">
          querix<span>AI</span>
        </span>
      )}
    </span>
  );
}
