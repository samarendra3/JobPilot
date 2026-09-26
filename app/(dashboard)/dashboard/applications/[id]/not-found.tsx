import Link from "next/link";

export default function ApplicationNotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-border bg-card px-6 py-16 text-center">
      <p className="text-sm font-medium text-foreground">Application not found</p>
      <p className="text-sm text-muted-foreground">
        This application may have been deleted or you don&apos;t have access to it.
      </p>
      <Link
        href="/dashboard/applications"
        className="mt-2 text-sm font-medium text-foreground underline hover:text-foreground"
      >
        Back to Applications
      </Link>
    </div>
  );
}
