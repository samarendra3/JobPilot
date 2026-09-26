"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { UseFormRegisterReturn } from "react-hook-form";

interface ApplicationOption {
  _id: string;
  company: string;
  jobTitle: string;
}

interface ApplicationSelectProps {
  registration: UseFormRegisterReturn;
  error?: string;
}

export default function ApplicationSelect({ registration, error }: ApplicationSelectProps) {
  const [options, setOptions] = useState<ApplicationOption[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/applications?limit=50&sort=company&order=asc")
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error ?? "Failed to load applications");
        }
        if (!cancelled) {
          setOptions(
            json.data.applications.map((application: ApplicationOption) => ({
              _id: application._id,
              company: application.company,
              jobTitle: application.jobTitle,
            }))
          );
        }
      })
      .catch(() => {
        if (!cancelled) setLoadError("Failed to load your applications");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loadError) {
    return <p className="text-sm text-destructive">{loadError}</p>;
  }

  if (options === null) {
    return <div className="h-9 w-full animate-pulse rounded-md bg-muted" />;
  }

  if (options.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border px-3 py-3 text-sm">
        <p className="font-medium text-foreground">No applications available</p>
        <p className="mt-1 text-muted-foreground">Create an application before scheduling an interview.</p>
        <Link
          href="/dashboard/applications/new"
          className="mt-2 inline-block text-sm font-medium text-foreground underline hover:text-foreground"
        >
          Create an application
        </Link>
      </div>
    );
  }

  return (
    <>
      <select
        id="applicationId"
        className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground"
        {...registration}
      >
        <option value="">Select an application</option>
        {options.map((application) => (
          <option key={application._id} value={application._id}>
            {application.company} — {application.jobTitle}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </>
  );
}
