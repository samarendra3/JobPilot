import type { Metadata } from "next";

import { requireUser } from "@/lib/auth";

import { listApplications } from "@/services/application.service";

import AIAnalysisForm from "@/components/ai/ai-analysis-form";

export const metadata: Metadata = {
  title: "AI Job Analysis | JobPilot",

  description:
    "Analyze job requirements against your JobPilot profile.",
};

export default async function AIAnalysisPage() {
  const user = await requireUser();

  const result =
    await listApplications(user._id, {
      page: 1,
      limit: 50,
      sort: "createdAt",
      order: "desc",
    });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          AI Job Analysis
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Understand your fit for a role and prepare
          more deliberately.
        </p>
      </div>

      <AIAnalysisForm
        applications={result.applications}
      />
    </div>
  );
}