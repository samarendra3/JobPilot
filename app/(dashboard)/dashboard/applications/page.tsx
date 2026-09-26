import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import ApplicationsView from "@/components/applications/applications-view";

export const metadata: Metadata = {
  title: "Applications | JobPilot",
  description: "Track and manage your job applications.",
};

export default function ApplicationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Applications</h1>
          <p className="mt-1 text-sm text-muted-foreground">Track and manage your job applications.</p>
        </div>
        <Link
          href="/dashboard/applications/new"
          className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Plus aria-hidden="true" className="h-4 w-4" />
          Add Application
        </Link>
      </div>

      <Suspense fallback={<div className="h-40 animate-pulse rounded-lg border border-border bg-muted" />}>
        <ApplicationsView />
      </Suspense>
    </div>
  );
}
