import { INTERVIEW_TYPE_LABELS, type InterviewType } from "@/constants/interview-types";
import { cn } from "@/lib/utils";

const TYPE_STYLES: Record<InterviewType, string> = {
  HR: "bg-badge-info text-badge-info-foreground",
  TECHNICAL: "bg-badge-purple text-badge-purple-foreground",
  MANAGERIAL: "bg-badge-warning text-badge-warning-foreground",
  FINAL: "bg-badge-success text-badge-success-foreground",
  OTHER: "bg-muted text-foreground",
};

export default function InterviewTypeBadge({ type }: { type: InterviewType }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        TYPE_STYLES[type]
      )}
    >
      {INTERVIEW_TYPE_LABELS[type]}
    </span>
  );
}
