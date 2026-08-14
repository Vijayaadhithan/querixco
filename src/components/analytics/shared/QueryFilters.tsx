import { CalendarDays, RotateCcw, Search } from "lucide-react";
import type { ReactNode } from "react";

import { humanizeKey } from "@/features/analytics/lib/format";
import type {
  AnalyticsAudience,
  QueryFilters as QueryFiltersValue,
  QueryOutcome,
} from "@/features/analytics/model/types";

const outcomes: Array<{ value: QueryOutcome | ""; label: string }> = [
  { value: "", label: "All outcomes" },
  { value: "fulfilled", label: "Fulfilled" },
  { value: "zero_result", label: "Zero result" },
  { value: "failure", label: "Failure" },
  { value: "telemetry_missing", label: "Telemetry missing" },
];

const knownExecutionPaths = ["semantic", "direct_semantic", "deterministic_filter"];
const knownLanguages = ["English", "Hindi", "Tamil", "Transliterated Tamil", "Unknown"];

export function QueryFilters({
  audience,
  value,
  classificationOptions,
  executionPathOptions,
  languageOptions,
  onChange,
  onReset,
}: {
  audience: AnalyticsAudience;
  value: QueryFiltersValue;
  classificationOptions: string[];
  executionPathOptions: string[];
  languageOptions: string[];
  onChange: (next: QueryFiltersValue) => void;
  onReset: () => void;
}) {
  const internal = audience === "internal";
  const availableExecutionPaths = Array.from(
    new Set([...knownExecutionPaths, ...executionPathOptions]),
  );
  const availableClassifications = optionsWithCurrent(classificationOptions, value.category);
  const availableLanguages = optionsWithCurrent(
    [...knownLanguages, ...languageOptions],
    value.language,
  );

  function update<Key extends keyof QueryFiltersValue>(key: Key, next: QueryFiltersValue[Key]) {
    onChange({ ...value, [key]: next });
  }

  function setDateRange(days: number | null) {
    if (days === null) {
      onChange({ ...value, from: "", to: "" });
      return;
    }

    const end = new Date();
    const start = new Date(end);
    start.setDate(start.getDate() - (days - 1));
    onChange({ ...value, from: dateInputValue(start), to: dateInputValue(end) });
  }

  return (
    <form
      className="rounded-2xl border border-white/8 bg-white/[0.035] p-4 sm:p-5"
      onSubmit={(event) => event.preventDefault()}
      aria-label="Filter query history"
    >
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <label htmlFor="query-filter" className="text-xs font-medium text-slate-300">
            Search query text
          </label>
          <div className="relative mt-1.5">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-500"
              aria-hidden="true"
            />
            <input
              id="query-filter"
              type="search"
              maxLength={1000}
              value={value.query}
              onChange={(event) => update("query", event.target.value)}
              placeholder="Search query text"
              className={`${inputClass} pr-3 pl-9`}
            />
          </div>
        </div>

        <FilterField label="Outcome" htmlFor="outcome-filter" className="lg:col-span-2">
          <select
            id="outcome-filter"
            value={value.outcome}
            onChange={(event) => update("outcome", event.target.value as QueryOutcome | "")}
            className={inputClass}
          >
            {outcomes.map((outcome) => (
              <option key={outcome.value} value={outcome.value}>
                {outcome.label}
              </option>
            ))}
          </select>
        </FilterField>

        {internal ? (
          <FilterField
            label="Execution path"
            htmlFor="execution-path-filter"
            className="lg:col-span-3"
          >
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
        ) : (
          <FilterField
            label="Classification"
            htmlFor="classification-filter"
            className="lg:col-span-3"
          >
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
        )}

        <FilterField label="Language" htmlFor="language-filter" className="lg:col-span-2">
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
      </div>

      <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-white/8 bg-black/10 px-4 py-3">
        <input
          type="checkbox"
          checked={value.includeFilteredResults}
          onChange={(event) => update("includeFilteredResults", event.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-white/20 bg-slate-950 text-blue-500 focus:ring-blue-300"
        />
        <span>
          <span className="block text-sm font-medium text-slate-200">
            Include filtered and catalogue browse results
          </span>
          <span className="mt-0.5 block text-xs leading-5 text-slate-500">
            Off by default so query history and zero-result review contain original text searches.
          </span>
        </span>
      </label>

      <fieldset className="mt-5 border-t border-white/8 pt-4">
        <legend className="sr-only">Date range</legend>
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <p className="text-sm font-semibold text-slate-200">Date range</p>
          <div className="flex flex-wrap gap-2" aria-label="Quick date ranges">
            <DatePreset label="All time" onClick={() => setDateRange(null)} />
            <DatePreset label="Today" onClick={() => setDateRange(1)} />
            <DatePreset label="Last 7 days" onClick={() => setDateRange(7)} />
            <DatePreset label="Last 30 days" onClick={() => setDateRange(30)} />
          </div>
        </div>

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
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-4 text-sm font-medium text-slate-300 transition hover:bg-white/6 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300 lg:w-auto"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset all filters
            </button>
          </div>
        </div>
      </fieldset>
    </form>
  );
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

function DatePreset({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-white/10 bg-white/[0.035] px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-blue-400/30 hover:bg-blue-400/8 hover:text-blue-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
    >
      {label}
    </button>
  );
}

function dateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function optionsWithCurrent(options: string[], current: string): string[] {
  return Array.from(new Set([...options, ...(current ? [current] : [])])).sort((left, right) =>
    left.localeCompare(right),
  );
}

const inputClass =
  "h-10 w-full rounded-xl border border-white/10 bg-[#0b1728] px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-400/70 focus:ring-3 focus:ring-blue-400/10";
