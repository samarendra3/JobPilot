import { cn } from "@/lib/utils";

export default function InterviewTimingBadge({ scheduledAt }: { scheduledAt: string }) {
  // eslint-disable-next-line react-hooks/purity -- deriving "upcoming" from wall-clock time is intentional for this display-only badge
  const isUpcoming = new Date(scheduledAt).getTime() >= Date.now();

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        isUpcoming ? "bg-badge-info text-badge-info-foreground" : "bg-muted text-muted-foreground"
      )}
    >
      {isUpcoming ? "Upcoming" : "Past"}
    </span>
  );
}
