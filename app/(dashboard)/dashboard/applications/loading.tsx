import { Skeleton } from "@/components/ui/skeleton";

export default function ApplicationsLoading() {
  return (
    <div role="status" aria-label="Loading applications" className="flex flex-col gap-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-20 border border-border" />
      <Skeleton className="h-64 border border-border" />
    </div>
  );
}
