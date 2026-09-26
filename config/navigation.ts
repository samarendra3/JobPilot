import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Briefcase,
  CalendarClock,
  BarChart3,
  Sparkles,
  User,
  Settings,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const dashboardNavItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Applications", href: "/dashboard/applications", icon: Briefcase },
  { label: "Interviews", href: "/dashboard/interviews", icon: CalendarClock },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "AI Analysis", href: "/dashboard/ai-analysis", icon: Sparkles },
  { label: "Profile", href: "/dashboard/profile", icon: User },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
