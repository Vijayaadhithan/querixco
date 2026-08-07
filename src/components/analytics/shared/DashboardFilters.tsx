import { CalendarDays, LoaderCircle, RotateCcw } from "lucide-react";
import type { ReactNode } from "react";

import { humanizeKey } from "@/features/analytics/lib/format";
import type {
  AnalyticsAudience,
  DashboardAvailableFilters,
  DashboardFilterValue,
  DashboardPeriod,
  QueryOutcome,
} from "@/features/analytics/model/types";

const periodOptions: Array<{ value: Exclude<DashboardPeriod, "custom">; label: string }> = [
  { value: "24h", label: "24 hours" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "all", label: "All time" },
];

export function DashboardFilters({
  audience,
  value,
  available,
  isFetching,
  onChange,
  onReset,
}: {
  audience: AnalyticsAudience;
  value: DashboardFilterValue;
  available: DashboardAvailableFilters;
  isFetching: boolean;
  onChange: (next: DashboardFilterValue) => void;
  onReset: () => void;
}) {
  const internal = audience === "internal";

  function update<Key extends keyof DashboardFilterValue>(
    key: Key,
    next: DashboardFilterValue[Key],
  ) {
    onChange({ ...value, [key]: next });
  }

  function setPeriod(period: Exclude<DashboardPeriod, "custom">) {
    onChange({ ...value, period, from: "", to: "" });
  }

  function setDate(key: "from" | "to", next: string) {
    const updated = { ...value, [key]: next };
    onChange({
      ...updated,
      period: updated.from || updated.to ? "custom" : "30d",
    });
  }

  const outcomes = optionsWithCurrent(available.outcomes, value.outcome);
  const categories = optionsWithCurrent(available.categories, value.category);
  const languages = optionsWithCurrent(available.languages, value.language);
  const adTypes = optionsWithCurrent(available.ad_types, value.adType);
  const executionPaths = optionsWithCurrent(available.execution_paths ?? [], value.executionPath);
  const providers = optionsWithCurrent(available.providers ?? [], value.provider);
  const operations = optionsWithCurrent(available.operations ?? [], value.operation);
  const cityOptions = [...available.city_options];
  if (value.cityId && !cityOptions.some((option) => String(option.id) === value.cityId)) {
    cityOptions.push({ id: Number(value.cityId), label: `City ${value.cityId}` });
  }

  return (
    <form
      className="rounded-2xl border border-white/8 bg-white/[0.035] p-4 sm:p-5"
      onSubmit={(event) => event.preventDefault()}
      aria-label="Filter dashboard activity"
    >
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-white">Activity filters</h2>
            {isFetching && (
              <LoaderCircle
                className="h-4 w-4 animate-spin text-blue-300"
                aria-label="Refreshing analytics"
              />
            )}
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Filters update the live activity overview. Daily snapshot questions remain unchanged.
          </p>
        </div>
        <div className="flex flex-wrap gap-2" aria-label="Dashboard period">
          {periodOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setPeriod(option.value)}
              aria-pressed={value.period === option.value}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300 ${
                value.period === option.value
                  ? "border-blue-400/35 bg-blue-400/12 text-blue-100"
                  : "border-white/10 bg-white/[0.025] text-slate-400 hover:bg-white/6 hover:text-white"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <FilterField label="Outcome" htmlFor={`${audience}-dashboard-outcome`}>
          <select
            id={`${audience}-dashboard-outcome`}
            value={value.outcome}
            onChange={(event) => update("outcome", event.target.value as QueryOutcome | "")}
            className={inputClass}
          >
            <option value="">All outcomes</option>
            {outcomes.map((option) => (
              <option key={option} value={option}>
                {humanizeKey(option)}
              </option>
            ))}
          </select>
        </FilterField>

        <FilterField label="Category" htmlFor={`${audience}-dashboard-category`}>
          <select
            id={`${audience}-dashboard-category`}
            value={value.category}
            onChange={(event) => update("category", event.target.value)}
            className={inputClass}
          >
            <option value="">All categories</option>
            {categories.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </FilterField>

        <FilterField label="Language" htmlFor={`${audience}-dashboard-language`}>
          <select
            id={`${audience}-dashboard-language`}
            value={value.language}
            onChange={(event) => update("language", event.target.value)}
            className={inputClass}
          >
            <option value="">All languages</option>
            {languages.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </FilterField>

        <FilterField label="City" htmlFor={`${audience}-dashboard-city`}>
          <select
            id={`${audience}-dashboard-city`}
            value={value.cityId}
            onChange={(event) => update("cityId", event.target.value)}
            className={inputClass}
          >
            <option value="">All cities</option>
            {cityOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </FilterField>

        <FilterField label="Ad type" htmlFor={`${audience}-dashboard-ad-type`}>
          <select
            id={`${audience}-dashboard-ad-type`}
            value={value.adType}
            onChange={(event) => update("adType", event.target.value)}
            className={inputClass}
          >
            <option value="">All ad types</option>
            {adTypes.map((option) => (
              <option key={option} value={option}>
                {humanizeKey(option)}
              </option>
            ))}
          </select>
        </FilterField>

        {internal && (
          <>
            <FilterField label="Execution path" htmlFor="internal-dashboard-path">
              <select
                id="internal-dashboard-path"
                value={value.executionPath}
                onChange={(event) => update("executionPath", event.target.value)}
                className={inputClass}
              >
                <option value="">All execution paths</option>
                {executionPaths.map((option) => (
                  <option key={option} value={option}>
                    {humanizeKey(option)}
                  </option>
                ))}
              </select>
            </FilterField>

            <FilterField label="Provider" htmlFor="internal-dashboard-provider">
              <select
                id="internal-dashboard-provider"
                value={value.provider}
                onChange={(event) => update("provider", event.target.value)}
                className={inputClass}
              >
                <option value="">All providers</option>
                {providers.map((option) => (
                  <option key={option} value={option}>
                    {humanizeKey(option)}
                  </option>
                ))}
              </select>
            </FilterField>

            <FilterField label="Operation" htmlFor="internal-dashboard-operation">
              <select
                id="internal-dashboard-operation"
                value={value.operation}
                onChange={(event) => update("operation", event.target.value)}
                className={inputClass}
              >
                <option value="">All operations</option>
                {operations.map((option) => (
                  <option key={option} value={option}>
                    {humanizeKey(option)}
                  </option>
                ))}
              </select>
            </FilterField>
          </>
        )}
      </div>

      <div className="mt-5 grid gap-4 border-t border-white/8 pt-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
        <FilterField label="Custom start date" htmlFor={`${audience}-dashboard-from`}>
          <DateInput
            id={`${audience}-dashboard-from`}
            value={value.from}
            max={value.to || undefined}
            onChange={(next) => setDate("from", next)}
          />
        </FilterField>
        <FilterField label="Custom end date" htmlFor={`${audience}-dashboard-to`}>
          <DateInput
            id={`${audience}-dashboard-to`}
            value={value.to}
            min={value.from || undefined}
            onChange={(next) => setDate("to", next)}
          />
        </FilterField>
        <div className="flex items-end sm:col-span-2 lg:col-span-1">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-4 text-sm font-medium text-slate-300 transition hover:bg-white/6 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300 lg:w-auto"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset filters
          </button>
        </div>
      </div>
    </form>
  );
}

function FilterField({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="text-xs font-medium text-slate-300">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function DateInput({
  id,
  value,
  min,
  max,
  onChange,
}: {
  id: string;
  value: string;
  min?: string;
  max?: string;
  onChange: (next: string) => void;
}) {
  return (
    <div className="relative">
      <CalendarDays
        className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-500"
        aria-hidden="true"
      />
      <input
        id={id}
        type="date"
        value={value}
        min={min}
        max={max}
        onChange={(event) => onChange(event.target.value)}
        className={`${inputClass} pr-3 pl-9 [color-scheme:dark]`}
      />
    </div>
  );
}

function optionsWithCurrent(options: string[], current: string): string[] {
  return Array.from(new Set([...options, ...(current ? [current] : [])])).sort((left, right) =>
    left.localeCompare(right),
  );
}

const inputClass =
  "h-10 w-full rounded-xl border border-white/10 bg-[#0b1728] px-3 text-sm text-white outline-none focus:border-blue-400/70 focus:ring-3 focus:ring-blue-400/10";
