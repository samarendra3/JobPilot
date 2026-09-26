"use client";

import { useRouter } from "next/navigation";
import ApplicationForm from "@/components/applications/application-form";
import type { ApplicationInput } from "@/schemas/application.schema";

export default function NewApplicationForm() {
  const router = useRouter();

  const handleSubmit = async (values: ApplicationInput) => {
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const json = await res.json();

    if (!res.ok || !json.success) {
      throw new Error(json.error ?? json.message ?? "Failed to create application");
    }

    router.push("/dashboard/applications");
    router.refresh();
  };

  return <ApplicationForm onSubmit={handleSubmit} submitLabel="Add Application" />;
}
