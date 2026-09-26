"use client";

import { ErrorState } from "@/components/ui/error-state";

interface DashboardErrorProps {
  reset: () => void;
}

export default function DashboardError({ reset }: DashboardErrorProps) {
  return (
    <ErrorState
      title="Something went wrong"
      description="We couldn't load this page. Please try again."
      onRetry={reset}
    />
  );
}
