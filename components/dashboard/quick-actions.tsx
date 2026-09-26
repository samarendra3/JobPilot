import Link from "next/link";
import { PlusCircle, List, CalendarPlus, Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const actions = [
  { label: "Add Application", href: "/dashboard/applications/new", icon: PlusCircle },
  { label: "View Applications", href: "/dashboard/applications", icon: List },
  { label: "Log Interview", href: "/dashboard/interviews", icon: CalendarPlus },
  { label: "AI Job Analysis", href: "/dashboard/ai-analysis", icon: Sparkles },
];

export default function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="flex flex-col items-center gap-2 rounded-md border border-border px-3 py-4 text-center text-xs font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Icon aria-hidden="true" className="h-5 w-5 text-muted-foreground" />
                {action.label}
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
