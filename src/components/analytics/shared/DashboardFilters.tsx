import {
  CalendarDays,
  ChevronDown,
  LoaderCircle,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import { humanizeKey } from "@/features/analytics/lib/format";
import type {
  AnalyticsAudience,
  DashboardAvailableFilters,
  DashboardFilterValue,
  DashboardPeriod,
  DashboardRequestScope,
  QueryOutcome,
} from "@/features/analytics/model/types";

const periodOptions: Array<{ value: Exclude<DashboardPeriod, "custom">; label: string }> = [
  { value: "24h", label: "24 hours" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "all", label: "All time" },
];

const requestScopeOptions: Array<{
  value: DashboardRequestScope;
  label: string;
  description: string;
}> = [
  {
    value: "all",
    label: "All activity",
    description: "Text searches and catalogue/filter browsing",
  },
  {
    value: "text_search",
    label: "Text searches",
    description: "Queries typed into the search box",
  },
  {
    value: "browse",
    label: "Browse activity",
    description: "Catalogue and filter-only requests",
  },
];

const outcomeLabels: Record<string, string> = {
  fulfilled: "Results found",
  zero_result: "No results",
  failure: "System error",
  telemetry_missing: "Telemetry unavailable",
};

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
  const activeAdvancedFilters = [
    value.category,
    value.language,
    value.adType,
    value.executionPath,
    value.provider,
    value.operation,
    value.from,
    value.to,
  ].filter(Boolean).length;
  const [advancedOpen, setAdvancedOpen] = useState(activeAdvancedFilters > 0);

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
      className="rounded-lg border border-workspace-line bg-workspace-surface p-4 sm:p-5"
      onSubmit={(event) => event.preventDefault()}
      aria-label="Filter dashboard activity"
    >
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-workspace-ink">Activity filters</h2>
            {isFetching && (
              <LoaderCircle
                className="h-4 w-4 animate-spin text-workspace-blue"
                aria-label="Refreshing analytics"
              />
            )}
          </div>
          <p className="mt-1 text-xs leading-5 text-workspace-muted">
            Filters update activity and demand insights. Company-wide inventory reports remain a
            latest-snapshot view.
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
                  ? "border-workspace-blue-line bg-workspace-tint text-workspace-blue"
                  : "border-workspace-line bg-workspace-surface text-workspace-muted hover:bg-workspace-wash hover:text-workspace-blue"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <fieldset className="mt-5">
        <legend className="text-xs font-medium text-workspace-body">Search scope</legend>
        <div className="mt-2 grid gap-2 md:grid-cols-3">
          {requestScopeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => update("requestScope", option.value)}
              aria-pressed={value.requestScope === option.value}
              className={`rounded-md border px-3 py-2.5 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300 ${
                value.requestScope === option.value
                  ? "border-workspace-blue-line bg-workspace-tint"
                  : "border-workspace-line bg-black/10 hover:bg-workspace-wash"
              }`}
            >
              <span className="block text-sm font-medium text-workspace-ink">{option.label}</span>
              <span className="mt-0.5 block text-xs leading-5 text-workspace-muted">
                {option.description}
              </span>
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
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
                {outcomeLabels[option] ?? humanizeKey(option)}
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
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-workspace-line pt-4">
        <button
          type="button"
          onClick={() => setAdvancedOpen((open) => !open)}
          aria-expanded={advancedOpen}
          aria-controls={`${audience}-advanced-filters`}
          className="inline-flex min-h-10 items-center gap-2 rounded-md border border-workspace-line px-3.5 text-sm font-medium text-workspace-body transition hover:bg-workspace-wash hover:text-workspace-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
        >
          <SlidersHorizontal className="h-4 w-4 text-workspace-blue" aria-hidden="true" />
          {advancedOpen ? "Hide advanced filters" : "More filters"}
          {activeAdvancedFilters > 0 && (
            <span className="rounded-full bg-workspace-tint px-2 py-0.5 text-xs text-workspace-blue">
              {activeAdvancedFilters}
            </span>
          )}
          <ChevronDown
            className={`h-4 w-4 transition-transform ${advancedOpen ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </button>

        <button
          type="button"
          onClick={() => {
            onReset();
            setAdvancedOpen(false);
          }}
          className="inline-flex min-h-10 items-center gap-2 rounded-md px-3 text-sm font-medium text-workspace-muted transition hover:bg-workspace-wash hover:text-workspace-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset
        </button>
      </div>

      {advancedOpen && (
        <div
          id={`${audience}-advanced-filters`}
          className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
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
        </div>
      )}
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
      <label htmlFor={htmlFor} className="text-xs font-medium text-workspace-body">
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
        className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-workspace-muted"
        aria-hidden="true"
      />
      <input
        id={id}
        type="date"
        value={value}
        min={min}
        max={max}
        onChange={(event) => onChange(event.target.value)}
        className={`${inputClass} pr-3 pl-9 [color-scheme:light]`}
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
  "h-10 w-full rounded-md border border-workspace-line bg-workspace-surface px-3 text-sm text-workspace-ink outline-none focus:border-workspace-blue focus:ring-3 focus:ring-blue-400/10";
