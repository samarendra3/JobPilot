import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getApplicationById } from "@/services/application.service";
import StatusBadge from "@/components/applications/status-badge";
import ApplicationDetailActions from "@/components/applications/application-detail-actions";
import { Card } from "@/components/ui/card";
import { JOB_TYPE_LABELS } from "@/constants/job-type";
import { WORK_MODE_LABELS } from "@/constants/work-mode";

interface PageProps {
  params: Promise<{ id: string }>;
}

function formatDate(value?: string): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

export default async function ApplicationDetailPage({ params }: PageProps) {
  const { id } = await params;
  const user = await requireUser();
  const application = await getApplicationById(id, user._id);

  if (!application) {
    notFound();
  }

  const fields = [
    { label: "Location", value: application.location || "—" },
    { label: "Job Type", value: application.jobType ? JOB_TYPE_LABELS[application.jobType] : "—" },
    { label: "Work Mode", value: application.workMode ? WORK_MODE_LABELS[application.workMode] : "—" },
    { label: "Salary", value: application.salary || "—" },
    { label: "Applied Date", value: formatDate(application.appliedAt) },
    { label: "Created", value: formatDate(application.createdAt) },
    { label: "Updated", value: formatDate(application.updatedAt) },
  ];

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/dashboard/applications"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        Back to Applications
      </Link>

      <Card className="p-6">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{application.jobTitle}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{application.company}</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={application.status} />
            <ApplicationDetailActions applicationId={application._id} />
          </div>
        </div>

        {application.jobUrl && (
          <a
            href={application.jobUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-sm text-primary underline"
          >
            View job posting
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

        {application.description && (
          <div className="mt-6">
            <h2 className="text-sm font-medium text-foreground">Description</h2>
            <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{application.description}</p>
          </div>
        )}

        {application.notes && (
          <div className="mt-6">
            <h2 className="text-sm font-medium text-foreground">Notes</h2>
            <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{application.notes}</p>
          </div>
        )}
      </Card>
    </div>
  );
}
