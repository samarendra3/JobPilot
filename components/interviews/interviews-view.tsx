"use client";

import { useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { CalendarClock } from "lucide-react";
import { useInterviews } from "@/hooks/use-interviews";
import InterviewsToolbar from "@/components/interviews/interviews-toolbar";
import InterviewsTable from "@/components/interviews/interviews-table";
import InterviewsPagination from "@/components/interviews/interviews-pagination";
import EmptyState from "@/components/dashboard/empty-state";

export default function InterviewsView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") ?? "";
  const type = searchParams.get("type") ?? "";
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";
  const sort = searchParams.get("sort") ?? "scheduledAt";
  const order = searchParams.get("order") ?? "asc";
  const page = searchParams.get("page") ?? "1";

  const quickFilter: "all" | "upcoming" | "past" = from && !to ? "upcoming" : to && !from ? "past" : "all";

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (type) params.set("type", type);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    params.set("sort", sort);
    params.set("order", order);
    params.set("page", page);
    params.set("limit", "10");
    return params.toString();
  }, [search, type, from, to, sort, order, page]);

  const { data, isLoading, error, refetch } = useInterviews(queryString);

  const updateParams = (patch: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    if (!("page" in patch)) {
      params.delete("page");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleQuickFilterChange = (value: "all" | "upcoming" | "past") => {
    const now = new Date().toISOString();
    if (value === "upcoming") {
      updateParams({ from: now, to: "" });
    } else if (value === "past") {
      updateParams({ from: "", to: now });
    } else {
      updateParams({ from: "", to: "" });
    }
  };

  const clearFilters = () => {
    router.push(pathname);
  };

  const hasActiveFilters = Boolean(search || type || from || to);

  return (
    <div className="flex flex-col gap-4">
      <InterviewsToolbar
        search={search}
        type={type}
        quickFilter={quickFilter}
        sort={sort}
        order={order}
        hasActiveFilters={hasActiveFilters}
        onChange={updateParams}
        onQuickFilterChange={handleQuickFilterChange}
        onClear={clearFilters}
      />

      {isLoading && (
        <div role="status" aria-label="Loading interviews" className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-16 animate-pulse rounded-lg border border-border bg-muted" />
          ))}
        </div>
      )}

      {!isLoading && error && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card px-6 py-10 text-center">
          <p className="text-sm font-medium text-foreground">Couldn&apos;t load interviews</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <button
            type="button"
            onClick={refetch}
            className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Try again
          </button>
        </div>
      )}

      {!isLoading && !error && data && data.interviews.length === 0 && !hasActiveFilters && (
        <EmptyState
          icon={CalendarClock}
          title="No interviews scheduled"
          description="Schedule your first interview to keep your job search organized."
          actionHref="/dashboard/interviews/new"
          actionLabel="Schedule Interview"
        />
      )}

      {!isLoading && !error && data && data.interviews.length === 0 && hasActiveFilters && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border px-6 py-10 text-center">
          <p className="text-sm font-medium text-foreground">No interviews match your filters</p>
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm font-medium text-foreground underline hover:text-foreground"
          >
            Clear filters
          </button>
        </div>
      )}

      {!isLoading && !error && data && data.interviews.length > 0 && (
        <>
          <InterviewsTable interviews={data.interviews} onDeleted={refetch} />
          <InterviewsPagination
            pagination={data.pagination}
            onPageChange={(nextPage) => updateParams({ page: String(nextPage) })}
          />
        </>
      )}
    </div>
  );
}
