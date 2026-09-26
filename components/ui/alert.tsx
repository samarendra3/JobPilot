import type { HTMLAttributes } from "react";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type AlertVariant = "info" | "success" | "warning" | "danger";

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
}

const VARIANT_STYLES: Record<AlertVariant, { wrap: string; icon: typeof Info }> = {
  info: { wrap: "border-badge-info/30 bg-badge-info/40 text-badge-info-foreground", icon: Info },
  success: { wrap: "border-badge-success/30 bg-badge-success/40 text-badge-success-foreground", icon: CheckCircle2 },
  warning: { wrap: "border-badge-warning/30 bg-badge-warning/40 text-badge-warning-foreground", icon: AlertTriangle },
  danger: { wrap: "border-badge-danger/30 bg-badge-danger/40 text-badge-danger-foreground", icon: XCircle },
};

export function Alert({ className, variant = "info", title, children, ...props }: AlertProps) {
  const { wrap, icon: Icon } = VARIANT_STYLES[variant];
  return (
    <div role="alert" className={cn("flex gap-3 rounded-md border p-3 text-sm", wrap, className)} {...props}>
      <Icon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
      <div>
        {title && <p className="font-medium">{title}</p>}
        {children && <div className={cn(title && "mt-0.5")}>{children}</div>}
      </div>
    </div>
  );
}
