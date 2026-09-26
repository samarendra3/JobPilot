import { APPLICATION_STATUS_LABELS, type ApplicationStatus } from "@/constants/application-status";
import { Badge, type BadgeVariant } from "@/components/ui/badge";

const STATUS_VARIANTS: Record<ApplicationStatus, BadgeVariant> = {
  SAVED: "neutral",
  APPLIED: "info",
  SCREENING: "warning",
  INTERVIEW: "primary",
  OFFER: "success",
  REJECTED: "danger",
  WITHDRAWN: "neutral",
};

export default function StatusBadge({ status }: { status: ApplicationStatus }) {
  return <Badge variant={STATUS_VARIANTS[status]}>{APPLICATION_STATUS_LABELS[status]}</Badge>;
}
