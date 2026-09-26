import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div role="status" aria-label="Loading settings" className="flex flex-col gap-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-24 border border-border" />
      <Skeleton className="h-24 border border-border" />
      <Skeleton className="h-24 border border-border" />
    </div>
  );
}
