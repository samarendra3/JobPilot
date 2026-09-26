import { Skeleton } from "@/components/ui/skeleton";

export default function ApplicationDetailLoading() {
  return (
    <div role="status" aria-label="Loading application" className="flex flex-col gap-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-40 border border-border" />
      <Skeleton className="h-40 border border-border" />
    </div>
  );
}
