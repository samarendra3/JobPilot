import Link from "next/link";
import { Briefcase } from "lucide-react";
import EmptyState from "@/components/dashboard/empty-state";
import StatusBadge from "@/components/applications/status-badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { RecentApplication } from "@/types/dashboard";

interface RecentApplicationsProps {
  applications: RecentApplication[];
}

export default function RecentApplications({ applications }: RecentApplicationsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent applications</CardTitle>
      </CardHeader>
      <CardContent>
        {applications.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No applications yet"
            description="Add your first job application to start tracking your job search."
            actionHref="/dashboard/applications/new"
            actionLabel="Add Application"
          />
        ) : (
          <ul className="divide-y divide-border">
            {applications.map((application) => (
              <li key={application._id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <Link
                  href={`/dashboard/applications/${application._id}`}
                  className="min-w-0 flex-1 hover:underline"
                >
                  <p className="truncate text-sm font-medium text-foreground">{application.company}</p>
                  <p className="truncate text-xs text-muted-foreground">{application.jobTitle}</p>
                </Link>
                <StatusBadge status={application.status} />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
