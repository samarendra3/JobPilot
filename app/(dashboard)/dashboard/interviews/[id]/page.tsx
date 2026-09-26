import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Video } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getInterviewById } from "@/services/interview.service";
import InterviewTypeBadge from "@/components/interviews/interview-type-badge";
import InterviewTimingBadge from "@/components/interviews/interview-timing-badge";
import InterviewDetailActions from "@/components/interviews/interview-detail-actions";
import { Card } from "@/components/ui/card";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InterviewDetailPage({ params }: PageProps) {
  const { id } = await params;
  const user = await requireUser();
  const interview = await getInterviewById(id, user._id);

  if (!interview) {
    notFound();
  }

  const scheduled = new Date(interview.scheduledAt);
  const date = scheduled.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  const time = scheduled.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  const created = new Date(interview.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const updated = new Date(interview.updatedAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const fields = [
    { label: "Interviewer", value: interview.interviewer || "—" },
    { label: "Created", value: created },
    { label: "Updated", value: updated },
  ];

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/dashboard/interviews"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        Back to Interviews
      </Link>

      <Card className="p-6">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              {interview.application ? interview.application.jobTitle : "Interview"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {interview.application ? interview.application.company : "Application unavailable"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <InterviewTypeBadge type={interview.type} />
            <InterviewDetailActions interviewId={interview._id} />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm text-foreground">
          <span>
            {date} · {time}
          </span>
          <InterviewTimingBadge scheduledAt={interview.scheduledAt} />
        </div>

        {interview.meetingUrl && (
          <a
            href={interview.meetingUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Join meeting (opens in a new tab)"
            className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted"
          >
            <Video aria-hidden="true" className="h-4 w-4" />
            Join meeting
          </a>
        )}

        <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field.label}>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{field.label}</dt>
              <dd className="mt-1 text-sm text-foreground">{field.value}</dd>
            </div>
          ))}
        </dl>

        {interview.notes && (
          <div className="mt-6">
            <h2 className="text-sm font-medium text-foreground">Notes</h2>
            <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{interview.notes}</p>
          </div>
        )}
      </Card>
    </div>
  );
}
