"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import DeleteInterviewDialog from "@/components/interviews/delete-interview-dialog";

interface InterviewDetailActionsProps {
  interviewId: string;
}

export default function InterviewDetailActions({ interviewId }: InterviewDetailActionsProps) {
  const router = useRouter();
  const [showDelete, setShowDelete] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/dashboard/interviews/${interviewId}/edit`}
        className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted"
      >
        <Pencil aria-hidden="true" className="h-4 w-4" />
        Edit
      </Link>
      <button
        type="button"
        onClick={() => setShowDelete(true)}
        className="inline-flex items-center gap-1.5 rounded-md border border-destructive/30 px-3 py-1.5 text-sm font-medium text-destructive hover:bg-destructive/10"
      >
        <Trash2 aria-hidden="true" className="h-4 w-4" />
        Delete
      </button>

      {showDelete && (
        <DeleteInterviewDialog
          interviewId={interviewId}
          onClose={() => setShowDelete(false)}
          onDeleted={() => {
            router.push("/dashboard/interviews");
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
