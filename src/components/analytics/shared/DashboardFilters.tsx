import { useState } from "react";
import { LoaderCircle, SlidersHorizontal, X } from "lucide-react";
import { humanizeKey } from "@/features/analytics/lib/format";
import { createDashboardFilters } from "@/features/analytics/lib/dashboard";
import { validDate } from "@/features/analytics/lib/navigation";
import type {
  AnalyticsAudience,
  DashboardAvailableFilters,
  DashboardFilterValue,
  DashboardPeriod,
} from "@/features/analytics/model/types";

type Props = {
  audience: AnalyticsAudience;
  value: DashboardFilterValue;
  available: DashboardAvailableFilters;
  isFetching: boolean;
  onChange: (value: DashboardFilterValue) => void;
  onReset: () => void;
};
const advancedKeys = [
  "outcome",
  "cityId",
  "category",
  "language",
  "adType",
  "executionPath",
  "provider",
  "operation",
  "from",
  "to",
] as const;
const labels: Record<string, string> = {
  outcome: "Outcome",
  cityId: "City",
  category: "Category",
  language: "Language",
  adType: "Listing type",
  executionPath: "Execution path",
  provider: "Provider",
  operation: "Operation",
  from: "From",
  to: "To",
};
const outcomeOptions = [
  { value: "fulfilled", label: "Results found" },
  { value: "zero_result", label: "No results" },
  { value: "failure", label: "System error" },
  { value: "telemetry_missing", label: "Telemetry unavailable" },
];
export function DashboardFilters(props: Props) {
  const { value, onChange, onReset, isFetching, available } = props;
  const [open, setOpen] = useState(false);
  const active = advancedKeys.filter((key) => value[key]);
  return (
    <section className="analytics-filterbar" aria-label="Filter dashboard activity">
      <div className="analytics-filterbar-row">
        <div className="analytics-periods" aria-label="Dashboard period">
          {[
            ["24h", "24 hours"],
            ["7d", "7 days"],
            ["30d", "30 days"],
            ["90d", "90 days"],
            ["all", "All time"],
          ].map(([period, label]) => (
            <button
              type="button"
              key={period}
              aria-pressed={value.period === period}
              onClick={() =>
                onChange({ ...value, period: period as DashboardPeriod, from: "", to: "" })
              }
            >
              {label}
            </button>
          ))}
        </div>
        <label className="analytics-scope">
          Activity
          <select
            aria-label="Activity type"
            value={value.requestScope}
            onChange={(event) =>
              onChange({
                ...value,
                requestScope: event.target.value as DashboardFilterValue["requestScope"],
              })
            }
          >
            <option value="all">All activity</option>
            <option value="text_search">Text searches</option>
            <option value="browse">Catalog browsing</option>
          </select>
        </label>
        <button
          className="analytics-filter-toggle"
          aria-expanded={open}
          aria-controls="dashboard-filter-panel"
          onClick={() => setOpen(!open)}
        >
          <SlidersHorizontal size={15} />
          {open ? "Close filters" : "More filters"}
          {active.length > 0 && ` (${active.length})`}
        </button>
        {isFetching && (
          <span role="status" className="analytics-updating">
            <LoaderCircle size={14} className="animate-spin" />
            Updating
          </span>
        )}
      </div>
      {(active.length > 0 || value.requestScope !== "all" || value.period !== "30d") && (
        <div className="analytics-filter-chips" aria-label="Active filters">
          {active.map((key) => (
            <button
              key={key}
              aria-label={`Remove ${labels[key]} filter`}
              onClick={() =>
                onChange({
                  ...value,
                  [key]: "",
                  ...(key === "from" || key === "to"
                    ? { from: "", to: "", period: "30d" as const }
                    : {}),
                })
              }
            >
              {labels[key]}:{" "}
              {key === "cityId"
                ? (available.city_options.find((city) => String(city.id) === value[key])?.label ??
                  value[key])
                : key === "outcome"
                  ? (outcomeOptions.find((o) => o.value === value[key])?.label ?? value[key])
                  : value[key]}
              <X size={12} />
            </button>
          ))}
          <button
            className="analytics-clear"
            onClick={() => {
              onReset();
              setOpen(false);
            }}
          >
            Clear filters
          </button>
        </div>
      )}
      {open && (
        <AdvancedFilters key={JSON.stringify(value)} {...props} onClose={() => setOpen(false)} />
      )}
    </section>
  );
}
function AdvancedFilters({
  audience,
  value,
  available,
  onChange,
  onClose,
}: Props & { onClose: () => void }) {
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState("");
  function update(key: keyof DashboardFilterValue, next: string) {
    setDraft({ ...draft, [key]: next });
    setError("");
  }
  function select(
    key: keyof DashboardFilterValue,
    label: string,
    options: Array<{ value: string; label: string }>,
  ) {
    const list =
      options.some((o) => o.value === draft[key]) || !draft[key]
        ? options
        : [...options, { value: draft[key], label: draft[key] }];
    return (
      <label key={key}>
        {label}
        <select
          id={`${audience}-dashboard-${key === "cityId" ? "city" : key === "executionPath" ? "path" : key}`}
          value={draft[key]}
          onChange={(e) => update(key, e.target.value)}
        >
          <option value="">All</option>
          {list.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
    );
  }
  const options = (items: string[]) => items.map((value) => ({ value, label: humanizeKey(value) }));
  return (
    <form
      id="dashboard-filter-panel"
      className="analytics-filter-panel"
      onSubmit={(event) => {
        event.preventDefault();
        if (
          (draft.from && !validDate(draft.from)) ||
          (draft.to && !validDate(draft.to)) ||
          (draft.from && draft.to && draft.from > draft.to)
        ) {
          setError("Enter a valid date range with the start before the end.");
          return;
        }
        onChange({
          ...draft,
          period:
            draft.from || draft.to ? "custom" : draft.period === "custom" ? "30d" : draft.period,
        });
        onClose();
      }}
    >
      <div className="analytics-filter-grid">
        {select("outcome", "Outcome", outcomeOptions)}
        {select(
          "cityId",
          "City",
          available.city_options.map((city) => ({ value: String(city.id), label: city.label })),
        )}
        {select("category", "Category", options(available.categories))}
        {select("language", "Language", options(available.languages))}
        {select("adType", "Listing type", options(available.ad_types))}
        {audience === "internal" && (
          <>
            {select("executionPath", "Execution path", options(available.execution_paths ?? []))}
            {select("provider", "Provider", options(available.providers ?? []))}
            {select("operation", "Operation", options(available.operations ?? []))}
          </>
        )}
        <label>
          Start date
          <input
            type="date"
            value={draft.from}
            max={draft.to || undefined}
            onChange={(e) => update("from", e.target.value)}
          />
        </label>
        <label>
          End date
          <input
            type="date"
            value={draft.to}
            min={draft.from || undefined}
            onChange={(e) => update("to", e.target.value)}
          />
        </label>
      </div>
      {error && (
        <p role="alert" className="text-workspace-danger text-sm mt-3">
          {error}
        </p>
      )}
      <div className="analytics-filter-actions">
        <span>Changes take effect when you apply them.</span>
        <button type="button" onClick={() => setDraft(createDashboardFilters())}>
          Reset selection
        </button>
        <button type="button" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="qx-action bg-workspace-ink">
          Apply filters
        </button>
      </div>
    </form>
  );
}
