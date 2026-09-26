"use client";

import { useRouter } from "next/navigation";
import InterviewForm from "@/components/interviews/interview-form";
import type { InterviewInput } from "@/schemas/interview.schema";

export default function NewInterviewForm() {
  const router = useRouter();

  const handleSubmit = async (values: InterviewInput) => {
    const res = await fetch("/api/interviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const json = await res.json();

    if (!res.ok || !json.success) {
      throw new Error(json.error ?? json.message ?? "Failed to schedule interview");
    }

    router.push("/dashboard/interviews");
    router.refresh();
  };

  return <InterviewForm onSubmit={handleSubmit} submitLabel="Schedule Interview" />;
}
