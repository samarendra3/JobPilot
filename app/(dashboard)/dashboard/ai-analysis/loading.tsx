import { Skeleton } from "@/components/ui/skeleton";

export default function AiAnalysisLoading() {
  return (
    <div role="status" aria-label="Loading AI analysis" className="flex flex-col gap-4">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton className="h-64 border border-border" />
        <Skeleton className="h-64 border border-border" />
      </div>
    </div>
  );
}
