import Link from "next/link";
import { CalendarClock } from "lucide-react";
import EmptyState from "@/components/dashboard/empty-state";
import InterviewTypeBadge from "@/components/interviews/interview-type-badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { UpcomingInterview } from "@/types/dashboard";

interface UpcomingInterviewsProps {
  interviews: UpcomingInterview[];
}

function formatDateTime(value: string): string {
  const dt = new Date(value);
  const date = dt.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const time = dt.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return `${date} · ${time}`;
}

export default function UpcomingInterviews({ interviews }: UpcomingInterviewsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming interviews</CardTitle>
      </CardHeader>
      <CardContent>
        {interviews.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="No upcoming interviews"
            description="Scheduled interviews will appear here."
            actionHref="/dashboard/interviews/new"
            actionLabel="Schedule Interview"
          />
        ) : (
          <ul className="divide-y divide-border">
            {interviews.map((interview) => (
              <li key={interview._id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <Link
                  href={`/dashboard/interviews/${interview._id}`}
                  className="min-w-0 flex-1 hover:underline"
                >
                  <p className="truncate text-sm font-medium text-foreground">
                    {interview.company} — {interview.jobTitle}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(interview.scheduledAt)}</p>
                </Link>
                <InterviewTypeBadge type={interview.type} />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
