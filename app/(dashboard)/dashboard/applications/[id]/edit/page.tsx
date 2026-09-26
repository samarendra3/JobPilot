import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { getApplicationById } from "@/services/application.service";
import EditApplicationForm from "@/components/applications/edit-application-form";
import { Card } from "@/components/ui/card";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Edit Application | JobPilot",
};

export default async function EditApplicationPage({ params }: PageProps) {
  const { id } = await params;
  const user = await requireUser();
  const application = await getApplicationById(id, user._id);

  if (!application) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Edit Application</h1>
        <p className="mt-1 text-sm text-muted-foreground">Update the details of this application.</p>
      </div>

      <Card className="p-6">
        <EditApplicationForm application={application} />
      </Card>
    </div>
  );
}
