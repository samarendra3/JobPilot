"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, Pencil, Trash2, Video } from "lucide-react";
import InterviewTypeBadge from "@/components/interviews/interview-type-badge";
import InterviewTimingBadge from "@/components/interviews/interview-timing-badge";
import DeleteInterviewDialog from "@/components/interviews/delete-interview-dialog";
import type { InterviewWithApplication } from "@/types/interview";

interface InterviewsTableProps {
  interviews: InterviewWithApplication[];
  onDeleted: () => void;
}

function formatDateTime(value: string): { date: string; time: string } {
  const dt = new Date(value);
  return {
    date: dt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }),
    time: dt.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }),
  };
}

export default function InterviewsTable({ interviews, onDeleted }: InterviewsTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <tr>
              <th scope="col" className="px-4 py-3">Application</th>
              <th scope="col" className="px-4 py-3">Type</th>
              <th scope="col" className="px-4 py-3">Date &amp; Time</th>
              <th scope="col" className="px-4 py-3">Interviewer</th>
              <th scope="col" className="px-4 py-3">Meeting</th>
              <th scope="col" className="px-4 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {interviews.map((interview) => {
              const { date, time } = formatDateTime(interview.scheduledAt);
              return (
                <tr key={interview._id}>
                  <td className="px-4 py-3">
                    {interview.application ? (
                      <>
                        <p className="font-medium text-foreground">{interview.application.company}</p>
                        <p className="text-xs text-muted-foreground">{interview.application.jobTitle}</p>
                      </>
                    ) : (
                      <span className="text-muted-foreground">Application unavailable</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <InterviewTypeBadge type={interview.type} />
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    <div className="flex items-center gap-2">
                      <span>
                        {date} · {time}
                      </span>
                      <InterviewTimingBadge scheduledAt={interview.scheduledAt} />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{interview.interviewer || "—"}</td>
                  <td className="px-4 py-3">
                    {interview.meetingUrl ? (
                      <a
                        href={interview.meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Join meeting (opens in a new tab)"
                        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                      >
                        <Video aria-hidden="true" className="h-4 w-4" />
                        Join
                      </a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/dashboard/interviews/${interview._id}`}
                        aria-label="View interview"
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <Eye aria-hidden="true" className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/dashboard/interviews/${interview._id}/edit`}
                        aria-label="Edit interview"
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <Pencil aria-hidden="true" className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(interview._id)}
                        aria-label="Delete interview"
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 aria-hidden="true" className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-border md:hidden">
        {interviews.map((interview) => {
          const { date, time } = formatDateTime(interview.scheduledAt);
          return (
            <li key={interview._id} className="flex flex-col gap-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  {interview.application ? (
                    <>
                      <p className="font-medium text-foreground">{interview.application.company}</p>
                      <p className="text-sm text-muted-foreground">{interview.application.jobTitle}</p>
                    </>
                  ) : (
                    <p className="text-muted-foreground">Application unavailable</p>
                  )}
                </div>
                <InterviewTypeBadge type={interview.type} />
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
                  className="inline-flex w-fit items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  <Video aria-hidden="true" className="h-4 w-4" />
                  Join meeting
                </a>
              )}
              <div className="flex items-center gap-3 pt-1">
                <Link
                  href={`/dashboard/interviews/${interview._id}`}
                  className="text-sm font-medium text-foreground hover:text-foreground"
                >
                  View
                </Link>
                <Link
                  href={`/dashboard/interviews/${interview._id}/edit`}
                  className="text-sm font-medium text-foreground hover:text-foreground"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(interview._id)}
                  className="text-sm font-medium text-destructive hover:opacity-80"
                >
                  Delete
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {deleteTarget && (
        <DeleteInterviewDialog
          interviewId={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={() => {
            setDeleteTarget(null);
            onDeleted();
          }}
        />
      )}
    </div>
  );
}
