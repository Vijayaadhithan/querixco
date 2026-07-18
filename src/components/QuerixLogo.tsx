export function QuerixLogo({ className = "", size = 36 }: { className?: string; size?: number }) {
  return (
    <svg
      width={Math.round(size * 1.16)}
      height={size}
      viewBox="0 0 116 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Querix AI mark"
    >
      <circle cx="45" cy="47" r="31" stroke="currentColor" strokeWidth="9" />

      <circle cx="33" cy="47" r="4" fill="#1746D1" />
      <circle cx="45" cy="47" r="4" fill="#1746D1" />
      <circle cx="57" cy="47" r="4" fill="#1746D1" />

      <circle cx="70" cy="70" r="7.5" fill="currentColor" />
      <circle cx="85" cy="77" r="6" fill="currentColor" />
      <circle cx="98" cy="76" r="5" fill="currentColor" />
      <circle cx="109" cy="69" r="3" fill="currentColor" />
    </svg>
  );
}
