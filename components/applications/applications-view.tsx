"use client";

import { useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Briefcase } from "lucide-react";
import { useApplications } from "@/hooks/use-applications";
import ApplicationsToolbar from "@/components/applications/applications-toolbar";
import ApplicationsTable from "@/components/applications/applications-table";
import Pagination from "@/components/applications/pagination";
import EmptyState from "@/components/dashboard/empty-state";

const FILTER_KEYS = ["search", "status", "jobType", "workMode", "sort", "order", "page"] as const;

export default function ApplicationsView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";
  const jobType = searchParams.get("jobType") ?? "";
  const workMode = searchParams.get("workMode") ?? "";
  const sort = searchParams.get("sort") ?? "createdAt";
  const order = searchParams.get("order") ?? "desc";
  const page = searchParams.get("page") ?? "1";

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    if (jobType) params.set("jobType", jobType);
    if (workMode) params.set("workMode", workMode);
    params.set("sort", sort);
    params.set("order", order);
    params.set("page", page);
    params.set("limit", "10");
    return params.toString();
  }, [search, status, jobType, workMode, sort, order, page]);

  const { data, isLoading, error, refetch } = useApplications(queryString);

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

  const clearFilters = () => {
    router.push(pathname);
  };

  const hasActiveFilters = FILTER_KEYS.some((key) => key !== "sort" && key !== "order" && key !== "page" && searchParams.get(key));

  return (
    <div className="flex flex-col gap-4">
      <ApplicationsToolbar
        search={search}
        status={status}
        jobType={jobType}
        workMode={workMode}
        sort={sort}
        order={order}
        hasActiveFilters={hasActiveFilters}
        onChange={updateParams}
        onClear={clearFilters}
      />

      {isLoading && (
        <div role="status" aria-label="Loading applications" className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-16 animate-pulse rounded-lg border border-border bg-muted" />
          ))}
        </div>
      )}

      {!isLoading && error && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card px-6 py-10 text-center">
          <p className="text-sm font-medium text-foreground">Couldn&apos;t load applications</p>
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

      {!isLoading && !error && data && data.applications.length === 0 && !hasActiveFilters && (
        <EmptyState
          icon={Briefcase}
          title="No applications yet"
          description="Start tracking your job search by adding your first application."
          actionHref="/dashboard/applications/new"
          actionLabel="Add Application"
        />
      )}

      {!isLoading && !error && data && data.applications.length === 0 && hasActiveFilters && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border px-6 py-10 text-center">
          <p className="text-sm font-medium text-foreground">No applications match your filters</p>
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm font-medium text-foreground underline hover:text-foreground"
          >
            Clear filters
          </button>
        </div>
      )}

      {!isLoading && !error && data && data.applications.length > 0 && (
        <>
          <ApplicationsTable applications={data.applications} onDeleted={refetch} />
          <Pagination
            pagination={data.pagination}
            onPageChange={(nextPage) => updateParams({ page: String(nextPage) })}
          />
        </>
      )}
    </div>
  );
}
