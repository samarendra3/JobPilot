import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div role="status" aria-label="Loading profile" className="flex flex-col gap-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-32 border border-border" />
      <Skeleton className="h-48 border border-border" />
    </div>
  );
}
