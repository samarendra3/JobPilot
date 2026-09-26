import type { Metadata } from "next";
import NewApplicationForm from "@/components/applications/new-application-form";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Add Application | JobPilot",
  description: "Add a new job application.",
};

export default function NewApplicationPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Add Application</h1>
        <p className="mt-1 text-sm text-muted-foreground">Track a new job application.</p>
      </div>

      <Card className="p-6">
        <NewApplicationForm />
      </Card>
    </div>
  );
}
