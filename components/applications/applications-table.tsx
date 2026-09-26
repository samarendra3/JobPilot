"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, Pencil, Trash2 } from "lucide-react";
import StatusBadge from "@/components/applications/status-badge";
import DeleteApplicationDialog from "@/components/applications/delete-application-dialog";
import { JOB_TYPE_LABELS } from "@/constants/job-type";
import { WORK_MODE_LABELS } from "@/constants/work-mode";
import type { Application } from "@/types/application";

interface ApplicationsTableProps {
  applications: Application[];
  onDeleted: () => void;
}

function formatDate(value?: string): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function ApplicationsTable({ applications, onDeleted }: ApplicationsTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <tr>
              <th scope="col" className="px-4 py-3">Company</th>
              <th scope="col" className="px-4 py-3">Job Title</th>
              <th scope="col" className="px-4 py-3">Location</th>
              <th scope="col" className="px-4 py-3">Type</th>
              <th scope="col" className="px-4 py-3">Work Mode</th>
              <th scope="col" className="px-4 py-3">Status</th>
              <th scope="col" className="px-4 py-3">Applied Date</th>
              <th scope="col" className="px-4 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {applications.map((application) => (
              <tr key={application._id}>
                <td className="px-4 py-3 font-medium text-foreground">{application.company}</td>
                <td className="px-4 py-3 text-foreground">{application.jobTitle}</td>
                <td className="px-4 py-3 text-muted-foreground">{application.location || "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {application.jobType ? JOB_TYPE_LABELS[application.jobType] : "—"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {application.workMode ? WORK_MODE_LABELS[application.workMode] : "—"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={application.status} />
                </td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(application.appliedAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/dashboard/applications/${application._id}`}
                      aria-label={`View ${application.company} application`}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <Eye aria-hidden="true" className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/dashboard/applications/${application._id}/edit`}
                      aria-label={`Edit ${application.company} application`}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <Pencil aria-hidden="true" className="h-4 w-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(application._id)}
                      aria-label={`Delete ${application.company} application`}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 aria-hidden="true" className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-border md:hidden">
        {applications.map((application) => (
          <li key={application._id} className="flex flex-col gap-2 p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-foreground">{application.company}</p>
                <p className="text-sm text-muted-foreground">{application.jobTitle}</p>
              </div>
              <StatusBadge status={application.status} />
            </div>
            <p className="text-xs text-muted-foreground">
              {application.location || "—"} · {formatDate(application.appliedAt)}
            </p>
            <div className="flex items-center gap-3 pt-1">
              <Link
                href={`/dashboard/applications/${application._id}`}
                className="text-sm font-medium text-foreground hover:text-foreground"
              >
                View
              </Link>
              <Link
                href={`/dashboard/applications/${application._id}/edit`}
                className="text-sm font-medium text-foreground hover:text-foreground"
              >
                Edit
              </Link>
              <button
                type="button"
                onClick={() => setDeleteTarget(application._id)}
                className="text-sm font-medium text-destructive hover:opacity-80"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {deleteTarget && (
        <DeleteApplicationDialog
          applicationId={deleteTarget}
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
