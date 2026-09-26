import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant = "neutral" | "primary" | "success" | "warning" | "danger" | "info";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  neutral: "bg-badge-neutral text-badge-neutral-foreground",
  primary: "bg-badge-primary text-badge-primary-foreground",
  success: "bg-badge-success text-badge-success-foreground",
  warning: "bg-badge-warning text-badge-warning-foreground",
  danger: "bg-badge-danger text-badge-danger-foreground",
  info: "bg-badge-info text-badge-info-foreground",
};

export function Badge({ className, variant = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        VARIANT_STYLES[variant],
        className
      )}
      {...props}
    />
  );
}
