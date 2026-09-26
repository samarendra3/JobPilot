import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "destructive" | "link";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:opacity-90 focus-visible:ring-ring disabled:opacity-40",
  secondary:
    "bg-secondary text-secondary-foreground hover:opacity-90 focus-visible:ring-ring disabled:opacity-40",
  outline:
    "border border-border bg-card text-foreground hover:bg-muted focus-visible:ring-ring disabled:opacity-40",
  ghost:
    "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring disabled:opacity-40",
  destructive:
    "bg-destructive text-destructive-foreground hover:opacity-90 focus-visible:ring-destructive disabled:opacity-40",
  link: "bg-transparent text-foreground underline-offset-4 hover:underline focus-visible:ring-ring h-auto px-0 py-0",
};

const SIZE_STYLES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-11 px-5 text-sm gap-2",
  icon: "h-10 w-10 p-0",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", isLoading = false, disabled, children, type = "button", ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:cursor-not-allowed",
          variant !== "link" && SIZE_STYLES[size],
          VARIANT_STYLES[variant],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 aria-hidden="true" className="h-4 w-4 shrink-0 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
