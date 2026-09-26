import type { Metadata } from "next";
import NewInterviewForm from "@/components/interviews/new-interview-form";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Schedule Interview | JobPilot",
  description: "Schedule a new interview.",
};

export default function NewInterviewPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Schedule Interview</h1>
        <p className="mt-1 text-sm text-muted-foreground">Add an interview for one of your applications.</p>
      </div>

      <Card className="p-6">
        <NewInterviewForm />
      </Card>
    </div>
  );
}
