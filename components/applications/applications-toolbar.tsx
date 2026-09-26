"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { APPLICATION_STATUSES, APPLICATION_STATUS_LABELS } from "@/constants/application-status";
import { JOB_TYPES, JOB_TYPE_LABELS } from "@/constants/job-type";
import { WORK_MODES, WORK_MODE_LABELS } from "@/constants/work-mode";

interface ApplicationsToolbarProps {
  search: string;
  status: string;
  jobType: string;
  workMode: string;
  sort: string;
  order: string;
  hasActiveFilters: boolean;
  onChange: (patch: Record<string, string>) => void;
  onClear: () => void;
}

const selectClass =
  "rounded-md border border-border bg-card px-2.5 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30";

export default function ApplicationsToolbar({
  search,
  status,
  jobType,
  workMode,
  sort,
  order,
  hasActiveFilters,
  onChange,
  onClear,
}: ApplicationsToolbarProps) {
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
        <label htmlFor="application-search" className="sr-only">
          Search applications
        </label>
        <input
          id="application-search"
          type="search"
          placeholder="Search by company, job title, or location"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          className="w-full rounded-md border border-border bg-card py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="sr-only" htmlFor="status-filter">
          Filter by status
        </label>
        <select
          id="status-filter"
          className={selectClass}
          value={status}
          onChange={(event) => onChange({ status: event.target.value })}
        >
          <option value="">All statuses</option>
          {APPLICATION_STATUSES.map((value) => (
            <option key={value} value={value}>
              {APPLICATION_STATUS_LABELS[value]}
            </option>
          ))}
        </select>

        <label className="sr-only" htmlFor="job-type-filter">
          Filter by job type
        </label>
        <select
          id="job-type-filter"
          className={selectClass}
          value={jobType}
          onChange={(event) => onChange({ jobType: event.target.value })}
        >
          <option value="">All job types</option>
          {JOB_TYPES.map((value) => (
            <option key={value} value={value}>
              {JOB_TYPE_LABELS[value]}
            </option>
          ))}
        </select>

        <label className="sr-only" htmlFor="work-mode-filter">
          Filter by work mode
        </label>
        <select
          id="work-mode-filter"
          className={selectClass}
          value={workMode}
          onChange={(event) => onChange({ workMode: event.target.value })}
        >
          <option value="">All work modes</option>
          {WORK_MODES.map((value) => (
            <option key={value} value={value}>
              {WORK_MODE_LABELS[value]}
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
          <option value="createdAt">Date created</option>
          <option value="updatedAt">Date updated</option>
          <option value="appliedAt">Date applied</option>
          <option value="company">Company</option>
          <option value="jobTitle">Job title</option>
          <option value="status">Status</option>
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
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
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
