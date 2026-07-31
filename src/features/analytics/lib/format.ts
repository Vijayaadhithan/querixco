const numberFormatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 });

export function formatCompanyName(value: string): string {
  return value
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatDateTime(value: unknown): string {
  if (typeof value !== "string" || !value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatMetricValue(value: unknown, key = ""): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "string") {
    if (/(?:_at|date|time)$/i.test(key)) return formatDateTime(value);
    return value;
  }
  if (typeof value !== "number" || !Number.isFinite(value)) return String(value);

  if (/percent|percentage|rate|share|ratio/i.test(key)) {
    const percent = Math.abs(value) <= 1 ? value * 100 : value;
    return `${numberFormatter.format(percent)}%`;
  }

  if (/duration|latency|_ms$/i.test(key)) return `${numberFormatter.format(value)} ms`;
  return numberFormatter.format(value);
}

export function humanizeKey(value: string): string {
  return value
    .replace(/^[a-z]\d+_/i, "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
