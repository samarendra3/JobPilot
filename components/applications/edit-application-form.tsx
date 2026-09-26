"use client";

import { useRouter } from "next/navigation";
import ApplicationForm from "@/components/applications/application-form";
import type { ApplicationInput } from "@/schemas/application.schema";
import type { Application } from "@/types/application";

interface EditApplicationFormProps {
  application: Application;
}

export default function EditApplicationForm({ application }: EditApplicationFormProps) {
  const router = useRouter();

  const handleSubmit = async (values: ApplicationInput) => {
    const res = await fetch(`/api/applications/${application._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const json = await res.json();

    if (!res.ok || !json.success) {
      throw new Error(json.error ?? json.message ?? "Failed to update application");
    }

    router.push(`/dashboard/applications/${application._id}`);
    router.refresh();
  };

  return (
    <ApplicationForm
      defaultValues={{
        company: application.company,
        jobTitle: application.jobTitle,
        location: application.location ?? "",
        jobType: application.jobType ?? "",
        workMode: application.workMode ?? "",
        salary: application.salary ?? "",
        jobUrl: application.jobUrl ?? "",
        description: application.description ?? "",
        status: application.status,
        appliedAt: application.appliedAt ? application.appliedAt.slice(0, 10) : "",
        notes: application.notes ?? "",
      }}
      onSubmit={handleSubmit}
      submitLabel="Save Changes"
    />
  );
}
