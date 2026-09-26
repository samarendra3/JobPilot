"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { dashboardNavItems, isNavItemActive } from "@/config/navigation";
import { cn } from "@/lib/utils";

interface NavListProps {
  onNavigate?: () => void;
}

export default function NavList({ onNavigate }: NavListProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Dashboard navigation" className="flex flex-col gap-1">
      {dashboardNavItems.map((item) => {
        const active = isNavItemActive(pathname, item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
