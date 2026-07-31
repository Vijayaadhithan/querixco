import { RotateCcw, Search } from "lucide-react";

import type { QueryFilters as QueryFiltersValue, QueryOutcome } from "@/lib/analytics-types";

const outcomes: Array<{ value: QueryOutcome | ""; label: string }> = [
  { value: "", label: "All outcomes" },
  { value: "fulfilled", label: "Fulfilled" },
  { value: "zero_result", label: "Zero result" },
  { value: "failure", label: "Failure" },
  { value: "telemetry_missing", label: "Telemetry missing" },
];

export function QueryFilters({
  value,
  onChange,
  onReset,
}: {
  value: QueryFiltersValue;
  onChange: (next: QueryFiltersValue) => void;
  onReset: () => void;
}) {
  function update<Key extends keyof QueryFiltersValue>(key: Key, next: QueryFiltersValue[Key]) {
    onChange({ ...value, [key]: next });
  }

  return (
    <form
      className="rounded-2xl border border-white/8 bg-white/[0.035] p-4"
      onSubmit={(event) => event.preventDefault()}
      aria-label="Filter query history"
    >
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-4">
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
              className="h-10 w-full rounded-xl border border-white/10 bg-[#0b1728] pr-3 pl-9 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-400/70 focus:ring-3 focus:ring-blue-400/10"
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
        <FilterField label="Category" htmlFor="category-filter" className="lg:col-span-2">
          <input
            id="category-filter"
            maxLength={191}
            value={value.category}
            onChange={(event) => update("category", event.target.value)}
            placeholder="Any"
            className={inputClass}
          />
        </FilterField>
        <FilterField label="Language" htmlFor="language-filter" className="lg:col-span-2">
          <input
            id="language-filter"
            maxLength={64}
            value={value.language}
            onChange={(event) => update("language", event.target.value)}
            placeholder="Any"
            className={inputClass}
          />
        </FilterField>
        <div className="flex items-end lg:col-span-2">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-3 text-sm font-medium text-slate-300 transition hover:bg-white/6 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:max-w-2xl">
        <FilterField label="From" htmlFor="from-filter">
          <input
            id="from-filter"
            type="datetime-local"
            value={value.from}
            onChange={(event) => update("from", event.target.value)}
            className={inputClass}
          />
        </FilterField>
        <FilterField label="To" htmlFor="to-filter">
          <input
            id="to-filter"
            type="datetime-local"
            value={value.to}
            onChange={(event) => update("to", event.target.value)}
            className={inputClass}
          />
        </FilterField>
      </div>
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
  children: React.ReactNode;
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

const inputClass =
  "h-10 w-full rounded-xl border border-white/10 bg-[#0b1728] px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-400/70 focus:ring-3 focus:ring-blue-400/10";
