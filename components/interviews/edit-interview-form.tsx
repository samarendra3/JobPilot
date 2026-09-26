"use client";

import { useRouter } from "next/navigation";
import InterviewForm from "@/components/interviews/interview-form";
import type { InterviewInput } from "@/schemas/interview.schema";
import type { Interview } from "@/types/interview";

interface EditInterviewFormProps {
  interview: Interview;
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function toLocalDateAndTime(iso: string): { date: string; time: string } {
  const dt = new Date(iso);
  const date = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
  const time = `${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
  return { date, time };
}

export default function EditInterviewForm({ interview }: EditInterviewFormProps) {
  const router = useRouter();
  const { date, time } = toLocalDateAndTime(interview.scheduledAt);

  const handleSubmit = async (values: InterviewInput) => {
    const res = await fetch(`/api/interviews/${interview._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const json = await res.json();

    if (!res.ok || !json.success) {
      throw new Error(json.error ?? json.message ?? "Failed to update interview");
    }

    router.push(`/dashboard/interviews/${interview._id}`);
    router.refresh();
  };

  return (
    <InterviewForm
      defaultValues={{
        applicationId: interview.applicationId,
        type: interview.type,
        date,
        time,
        meetingUrl: interview.meetingUrl ?? "",
        interviewer: interview.interviewer ?? "",
        notes: interview.notes ?? "",
      }}
      onSubmit={handleSubmit}
      submitLabel="Save Changes"
    />
  );
}
