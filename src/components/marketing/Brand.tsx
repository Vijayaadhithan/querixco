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
        <g className="qx-mark-tail" fill="currentColor">
          <circle cx="46.5" cy="50" r="3.4" />
          <circle cx="52.5" cy="52.8" r="2.4" />
          <circle cx="57.5" cy="53.4" r="1.6" />
        </g>
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
