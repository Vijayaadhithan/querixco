import { CalendarDays, RotateCcw } from "lucide-react";
import { useState, type ReactNode } from "react";
import { formatDateTime } from "@/features/analytics/lib/format";
import { emptyQueryFilters, queryDateRange, validDate } from "@/features/analytics/lib/navigation";

import { humanizeKey } from "@/features/analytics/lib/format";
import type {
  AnalyticsAudience,
  QueryFilters as QueryFiltersValue,
  QueryFacets,
  QueryOutcome,
  QuerySortBy,
  QuerySortDirection,
} from "@/features/analytics/model/types";

const outcomes: Array<{ value: QueryOutcome | ""; label: string }> = [
  { value: "", label: "All outcomes" },
  { value: "fulfilled", label: "Results found" },
  { value: "zero_result", label: "No results" },
  { value: "failure", label: "Failed request" },
  { value: "telemetry_missing", label: "Telemetry unavailable" },
];

const filterLabels: Record<string, string> = {
  cityId: "City",
  subcategoryId: "Subcategory",
  adType: "Listing type",
  executionPath: "Execution path",
  requestKind: "Request type",
  diagnosticCode: "Diagnosis",
  includeFilteredResults: "Include browsing",
  hasFilters: "Applied filters",
};
const knownExecutionPaths = ["semantic", "direct_semantic", "deterministic_filter"];
const knownLanguages = ["English", "Hindi", "Tamil", "Likely Tamil (Latin script)", "Unknown"];

const commonSortOptions: Array<{ value: QuerySortBy; label: string }> = [
  { value: "created_at", label: "Time" },
  { value: "results", label: "Results" },
  { value: "outcome", label: "Outcome" },
];

const internalSortOptions: Array<{ value: QuerySortBy; label: string }> = [
  ...commonSortOptions,
  { value: "execution_path", label: "Execution path" },
  { value: "duration", label: "Server duration" },
  { value: "tokens", label: "Total tokens" },
];

type FilterProps = {
  audience: AnalyticsAudience;
  value: QueryFiltersValue;
  classificationOptions: string[];
  executionPathOptions: string[];
  languageOptions: string[];
  facets?: QueryFacets;
  onOpenAdvanced?: () => void;
  facetStatus?: ReactNode;
  onChange: (value: QueryFiltersValue) => void;
  onReset: () => void;
};
export function QueryFilters(props: FilterProps) {
  const { value, onChange, onReset } = props;
  const [open, setOpen] = useState(false);
  const active = Object.entries(value).filter(
    ([key, item]) =>
      !["sortBy", "sortDirection", "query", "exactFrom", "exactTo"].includes(key) &&
      item !== "" &&
      item !== false &&
      item != null,
  );
  function dates(days: number | null) {
    onChange(queryDateRange(value, days));
  }
  return (
    <section className="analytics-filterbar" aria-label="Search history filters">
      <div className="analytics-query-toolbar">
        <label>
          Search text
          <input
            type="search"
            aria-label="Search query text"
            maxLength={1000}
            value={value.query}
            onChange={(e) => onChange({ ...value, query: e.target.value })}
            placeholder="Find a customer search…"
          />
        </label>
        <label>
          Outcome
          <select
            aria-label="Outcome"
            value={value.outcome}
            onChange={(e) => onChange({ ...value, outcome: e.target.value as QueryOutcome | "" })}
          >
            {outcomes.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <button
          className="analytics-filter-toggle"
          aria-expanded={open}
          onClick={() => {
            if (!open) props.onOpenAdvanced?.();
            setOpen(!open);
          }}
        >
          More filters & sorting
        </button>
      </div>
      <div className="analytics-query-presets">
        <span>Date range</span>
        <button onClick={() => dates(1)}>Today</button>
        <button onClick={() => dates(7)}>Last 7 days</button>
        <button onClick={() => dates(30)}>Last 30 days</button>
        <button onClick={() => dates(null)}>All time</button>
      </div>
      {(value.exactFrom || value.exactTo) && (
        <p className="analytics-small-note">
          Exact dashboard range:{" "}
          {value.exactFrom ? formatDateTime(value.exactFrom) : "Start of records"} —{" "}
          {value.exactTo ? formatDateTime(value.exactTo) : "Latest records"}.{" "}
          <button
            className="underline"
            onClick={() => onChange({ ...value, exactFrom: "", exactTo: "" })}
          >
            Clear range
          </button>
        </p>
      )}
      <div className="analytics-filter-chips" aria-label="Active query filters">
        {active.map(([key, item]) => (
          <button
            key={key}
            onClick={() => onChange({ ...value, [key]: typeof item === "boolean" ? false : "" })}
            aria-label={`Remove ${filterLabels[key] ?? humanizeKey(key)} filter`}
          >
            {filterLabels[key] ?? humanizeKey(key)}:{" "}
            {typeof item === "boolean"
              ? "On"
              : key === "outcome"
                ? outcomes.find((outcome) => outcome.value === item)?.label
                : humanizeKey(String(item))}{" "}
            ×
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
      {open && props.facetStatus}
      {open && (
        <QueryFilterDraft key={JSON.stringify(value)} {...props} onClose={() => setOpen(false)} />
      )}
    </section>
  );
}
function QueryFilterDraft(props: FilterProps & { onClose: () => void }) {
  const [draft, setDraft] = useState(props.value);
  return (
    <div className="analytics-query-advanced">
      <QueryFilterEditor
        {...props}
        value={draft}
        onChange={setDraft}
        onReset={() => setDraft(emptyQueryFilters)}
        onApply={() => {
          props.onChange(draft);
          props.onClose();
        }}
        onCancel={props.onClose}
      />
    </div>
  );
}
function QueryFilterEditor({
  audience,
  value,
  classificationOptions,
  executionPathOptions,
  languageOptions,
  facets,
  onChange,
  onReset,
  onApply,
  onCancel,
}: {
  audience: AnalyticsAudience;
  value: QueryFiltersValue;
  classificationOptions: string[];
  executionPathOptions: string[];
  languageOptions: string[];
  facets?: QueryFacets;
  onOpenAdvanced?: () => void;
  facetStatus?: ReactNode;
  onChange: (next: QueryFiltersValue) => void;
  onReset: () => void;
  onApply: () => void;
  onCancel: () => void;
}) {
  const internal = audience === "internal";
  const availableExecutionPaths = optionsWithCurrent(
    [...knownExecutionPaths, ...executionPathOptions],
    value.executionPath,
  );
  const [error, setError] = useState("");
  const availableClassifications = optionsWithCurrent(classificationOptions, value.category);
  const availableLanguages = optionsWithCurrent(
    [...knownLanguages, ...languageOptions],
    value.language,
  );
  const sortOptions = internal ? internalSortOptions : commonSortOptions;

  function update<Key extends keyof QueryFiltersValue>(key: Key, next: QueryFiltersValue[Key]) {
    setError("");
    onChange({
      ...value,
      [key]: next,
      ...(key === "from" || key === "to" ? { exactFrom: "", exactTo: "" } : {}),
    });
  }

  return (
    <form
      className="rounded-lg border border-workspace-line bg-workspace-surface p-4 sm:p-5"
      onSubmit={(event) => {
        event.preventDefault();
        if (
          (value.from && !validDate(value.from)) ||
          (value.to && !validDate(value.to)) ||
          (value.from && value.to && value.from > value.to)
        ) {
          setError("Enter a valid date range with the start before the end.");
          return;
        }
        onApply();
      }}
      aria-label="Filter query history"
    >
      <div className={`grid gap-4 ${internal ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
        <FilterField label="City" htmlFor="city-filter" className="">
          <select
            id="city-filter"
            value={value.cityId}
            onChange={(event) => update("cityId", event.target.value)}
            className={inputClass}
          >
            <option value="">All cities</option>
            {value.cityId &&
              !(facets?.cities ?? []).some((item) => String(item.id) === value.cityId) && (
                <option value={value.cityId}>ID {value.cityId}</option>
              )}
            {(facets?.cities ?? []).map((city) => (
              <option key={city.id} value={city.id}>
                {city.label}
              </option>
            ))}
          </select>
        </FilterField>

        {internal && (
          <FilterField label="Execution path" htmlFor="execution-path-filter" className="">
            <select
              id="execution-path-filter"
              value={value.executionPath}
              onChange={(event) => update("executionPath", event.target.value)}
              className={inputClass}
            >
              <option value="">All execution paths</option>
              {availableExecutionPaths.map((path) => (
                <option key={path} value={path}>
                  {humanizeKey(path)}
                </option>
              ))}
            </select>
          </FilterField>
        )}
        <FilterField label="Classification" htmlFor="classification-filter" className="">
          <select
            id="classification-filter"
            value={value.category}
            onChange={(event) => update("category", event.target.value)}
            className={inputClass}
          >
            <option value="">All classifications</option>
            {availableClassifications.map((classification) => (
              <option key={classification} value={classification}>
                {classification}
              </option>
            ))}
          </select>
        </FilterField>
      </div>

      <div className="mt-4 grid gap-4 rounded-md border border-workspace-line bg-workspace-wash p-4 sm:grid-cols-2">
        <FilterField label="Sort results by" htmlFor="query-sort-field">
          <select
            id="query-sort-field"
            value={value.sortBy}
            onChange={(event) => update("sortBy", event.target.value as QuerySortBy)}
            className={inputClass}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FilterField>
        <FilterField label="Order" htmlFor="query-sort-direction">
          <select
            id="query-sort-direction"
            value={value.sortDirection}
            onChange={(event) => update("sortDirection", event.target.value as QuerySortDirection)}
            className={inputClass}
          >
            <option value="desc">{sortDirectionLabel(value.sortBy, "desc")}</option>
            <option value="asc">{sortDirectionLabel(value.sortBy, "asc")}</option>
          </select>
        </FilterField>
      </div>

      <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-md border border-workspace-line bg-workspace-wash px-4 py-3">
        <input
          type="checkbox"
          checked={value.includeFilteredResults}
          onChange={(event) => update("includeFilteredResults", event.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-workspace-line bg-workspace-surface text-workspace-blue focus:ring-blue-300"
        />
        <span>
          <span className="block text-sm font-medium text-workspace-ink">
            Include filtered and catalogue browse results
          </span>
          <span className="mt-0.5 block text-xs leading-5 text-workspace-muted">
            Off by default so query history and zero-result review contain original text searches.
          </span>
        </span>
      </label>

      <div className="grid gap-4 border-t border-workspace-line p-4 sm:grid-cols-2 lg:grid-cols-4">
        <FilterField label="Request type" htmlFor="request-kind-filter">
          <select
            id="request-kind-filter"
            value={value.requestKind}
            onChange={(event) => update("requestKind", event.target.value)}
            className={inputClass}
          >
            <option value="">All request types</option>
            {optionsWithCurrent(facets?.request_kinds ?? [], value.requestKind).map((kind) => (
              <option key={kind} value={kind}>
                {humanizeKey(kind)}
              </option>
            ))}
          </select>
        </FilterField>

        <FilterField label="Subcategory" htmlFor="subcategory-filter">
          <select
            id="subcategory-filter"
            value={value.subcategoryId}
            onChange={(event) => update("subcategoryId", event.target.value)}
            className={inputClass}
          >
            <option value="">All subcategories</option>
            {value.subcategoryId &&
              !(facets?.subcategories ?? []).some(
                (item) => String(item.id) === value.subcategoryId,
              ) && <option value={value.subcategoryId}>ID {value.subcategoryId}</option>}
            {(facets?.subcategories ?? []).map((subcategory) => (
              <option key={subcategory.id} value={subcategory.id}>
                {subcategory.label}
              </option>
            ))}
          </select>
        </FilterField>

        <FilterField label="Ad type" htmlFor="ad-type-filter">
          <select
            id="ad-type-filter"
            value={value.adType}
            onChange={(event) => update("adType", event.target.value)}
            className={inputClass}
          >
            <option value="">All ad types</option>
            {optionsWithCurrent(facets?.ad_types ?? [], value.adType).map((adType) => (
              <option key={adType} value={adType}>
                {humanizeKey(adType)}
              </option>
            ))}
          </select>
        </FilterField>

        <FilterField label="Language" htmlFor="language-filter">
          <select
            id="language-filter"
            value={value.language}
            onChange={(event) => update("language", event.target.value)}
            className={inputClass}
          >
            <option value="">All languages</option>
            {availableLanguages.map((language) => (
              <option key={language} value={language}>
                {language}
              </option>
            ))}
          </select>
        </FilterField>

        {internal && (
          <FilterField label="Observed diagnosis" htmlFor="diagnostic-filter">
            <select
              id="diagnostic-filter"
              value={value.diagnosticCode}
              onChange={(event) => update("diagnosticCode", event.target.value)}
              className={inputClass}
            >
              <option value="">All diagnoses</option>
              {optionsWithCurrent(facets?.diagnostic_codes ?? [], value.diagnosticCode).map(
                (code) => (
                  <option key={code} value={code}>
                    {humanizeKey(code)}
                  </option>
                ),
              )}
            </select>
          </FilterField>
        )}

        <label className="flex items-center gap-3 rounded-md border border-workspace-line px-3 py-2 text-sm text-workspace-body">
          <input
            type="checkbox"
            checked={value.hasFilters}
            onChange={(event) => update("hasFilters", event.target.checked)}
            className="h-4 w-4 rounded border-workspace-line bg-workspace-surface text-workspace-blue"
          />
          Only requests with applied filters
        </label>
      </div>

      <fieldset className="mt-5 border-t border-workspace-line pt-4">
        <legend className="sr-only">Date range</legend>
        <p className="text-sm font-semibold text-workspace-ink">Custom date range</p>
        {(value.exactFrom || value.exactTo) && (
          <p className="analytics-small-note">
            The exact dashboard range stays active until you choose calendar dates.
          </p>
        )}
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-12">
          <FilterField label="Start date" htmlFor="from-filter" className="lg:col-span-4">
            <DateInput
              id="from-filter"
              value={value.from}
              max={value.to || undefined}
              onChange={(next) => update("from", next)}
            />
          </FilterField>
          <FilterField label="End date" htmlFor="to-filter" className="lg:col-span-4">
            <DateInput
              id="to-filter"
              value={value.to}
              min={value.from || undefined}
              onChange={(next) => update("to", next)}
            />
          </FilterField>
          <div className="flex items-end sm:col-span-2 lg:col-span-4 lg:justify-end">
            <button
              type="button"
              onClick={onReset}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-workspace-line px-4 text-sm font-medium text-workspace-body transition hover:bg-workspace-wash hover:text-workspace-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300 lg:w-auto"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset all filters
            </button>
          </div>
        </div>
      </fieldset>
      {error && (
        <p role="alert" className="text-sm text-workspace-danger mt-3">
          {error}
        </p>
      )}
      <div className="analytics-filter-actions">
        <span>Apply all changes together.</span>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="qx-action bg-workspace-ink">
          Apply filters
        </button>
      </div>
    </form>
  );
}

function sortDirectionLabel(sortBy: QuerySortBy, direction: QuerySortDirection): string {
  if (sortBy === "created_at") return direction === "desc" ? "Newest first" : "Oldest first";
  if (["results", "duration", "tokens"].includes(sortBy)) {
    return direction === "desc" ? "Highest first" : "Lowest first";
  }
  return direction === "desc" ? "Z to A" : "A to Z";
}

function FilterField({
  label,
  htmlFor,
  className = "",
  children,
}: {
  label: string;
  htmlFor: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
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
  "h-10 w-full rounded-md border border-workspace-line bg-workspace-surface px-3 text-sm text-workspace-ink outline-none placeholder:text-workspace-muted focus:border-workspace-blue focus:ring-3 focus:ring-blue-400/10";
