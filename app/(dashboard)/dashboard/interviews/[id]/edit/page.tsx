import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { getInterviewById } from "@/services/interview.service";
import EditInterviewForm from "@/components/interviews/edit-interview-form";
import { Card } from "@/components/ui/card";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Edit Interview | JobPilot",
};

export default async function EditInterviewPage({ params }: PageProps) {
  const { id } = await params;
  const user = await requireUser();
  const interview = await getInterviewById(id, user._id);

  if (!interview) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Edit Interview</h1>
        <p className="mt-1 text-sm text-muted-foreground">Update the details of this interview.</p>
      </div>

      <Card className="p-6">
        <EditInterviewForm interview={interview} />
      </Card>
    </div>
  );
}
