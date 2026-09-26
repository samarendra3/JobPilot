"use client";

import { useEffect } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore, type ThemePreference } from "@/stores/ui-store";

const OPTIONS: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export default function ThemeToggle() {
  const theme = useUIStore((state) => state.theme);
  const themeHydrated = useUIStore((state) => state.themeHydrated);
  const hydrateTheme = useUIStore((state) => state.hydrateTheme);
  const setTheme = useUIStore((state) => state.setTheme);

  useEffect(() => {
    hydrateTheme();
  }, [hydrateTheme]);

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="inline-flex flex-wrap gap-2"
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const isSelected = themeHydrated && theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => setTheme(value)}
            className={cn(
              "flex min-h-10 items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              isSelected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground hover:bg-muted"
            )}
          >
            <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
