"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { INTERVIEW_TYPES, INTERVIEW_TYPE_LABELS } from "@/constants/interview-types";

interface InterviewsToolbarProps {
  search: string;
  type: string;
  quickFilter: "all" | "upcoming" | "past";
  sort: string;
  order: string;
  hasActiveFilters: boolean;
  onChange: (patch: Record<string, string>) => void;
  onQuickFilterChange: (value: "all" | "upcoming" | "past") => void;
  onClear: () => void;
}

const selectClass =
  "rounded-md border border-border bg-card px-2.5 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30";

export default function InterviewsToolbar({
  search,
  type,
  quickFilter,
  sort,
  order,
  hasActiveFilters,
  onChange,
  onQuickFilterChange,
  onClear,
}: InterviewsToolbarProps) {
  const [searchInput, setSearchInput] = useState(search);
  const [prevSearch, setPrevSearch] = useState(search);
  const debouncedSearch = useDebounce(searchInput, 400);

  if (search !== prevSearch) {
    setPrevSearch(search);
    setSearchInput(search);
  }

  useEffect(() => {
    if (debouncedSearch !== search) {
      onChange({ search: debouncedSearch });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
      <div className="relative">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        />
        <label htmlFor="interview-search" className="sr-only">
          Search interviews
        </label>
        <input
          id="interview-search"
          type="search"
          placeholder="Search by interviewer or notes"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          className="w-full rounded-md border border-border bg-card py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div role="group" aria-label="Filter by timing" className="flex overflow-hidden rounded-md border border-border">
          {(["all", "upcoming", "past"] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={quickFilter === value}
              onClick={() => onQuickFilterChange(value)}
              className={`px-3 py-2 text-sm font-medium capitalize ${
                quickFilter === value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {value}
            </button>
          ))}
        </div>

        <label className="sr-only" htmlFor="type-filter">
          Filter by interview type
        </label>
        <select
          id="type-filter"
          className={selectClass}
          value={type}
          onChange={(event) => onChange({ type: event.target.value })}
        >
          <option value="">All types</option>
          {INTERVIEW_TYPES.map((value) => (
            <option key={value} value={value}>
              {INTERVIEW_TYPE_LABELS[value]}
            </option>
          ))}
        </select>

        <label className="sr-only" htmlFor="sort-field">
          Sort by
        </label>
        <select
          id="sort-field"
          className={selectClass}
          value={sort}
          onChange={(event) => onChange({ sort: event.target.value })}
        >
          <option value="scheduledAt">Scheduled date</option>
          <option value="createdAt">Date created</option>
          <option value="updatedAt">Date updated</option>
          <option value="interviewer">Interviewer</option>
          <option value="type">Type</option>
        </select>

        <label className="sr-only" htmlFor="sort-order">
          Sort order
        </label>
        <select
          id="sort-order"
          className={selectClass}
          value={order}
          onChange={(event) => onChange({ order: event.target.value })}
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
