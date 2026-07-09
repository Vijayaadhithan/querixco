export function QuerixLogo({ className = "", size = 36 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Querix AI logo"
    >
      <defs>
        <linearGradient id="qx-grad" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#1E90FF" />
          <stop offset="1" stopColor="#7B5CFF" />
        </linearGradient>
      </defs>
      {/* pixels */}
      <rect x="6" y="10" width="4" height="4" rx="1" fill="#7B5CFF" />
      <rect x="12" y="6" width="3" height="3" rx="1" fill="#1E90FF" />
      <rect x="14" y="13" width="3" height="3" rx="1" fill="#7B5CFF" />
      <rect x="8" y="18" width="2.5" height="2.5" rx="0.5" fill="#1E90FF" />
      {/* Q circle */}
      <circle cx="34" cy="34" r="18" stroke="url(#qx-grad)" strokeWidth="5" fill="none" />
      {/* Q tail */}
      <rect
        x="40"
        y="42"
        width="12"
        height="5"
        rx="1.5"
        transform="rotate(35 40 42)"
        fill="url(#qx-grad)"
      />
    </svg>
  );
}
