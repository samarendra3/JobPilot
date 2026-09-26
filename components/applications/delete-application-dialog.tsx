"use client";

import { useState } from "react";

interface DeleteApplicationDialogProps {
  applicationId: string;
  onDeleted: () => void;
  onClose: () => void;
}

export default function DeleteApplicationDialog({
  applicationId,
  onDeleted,
  onClose,
}: DeleteApplicationDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/applications/${applicationId}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "Failed to delete application");
      }
      onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete application");
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-primary/40" onClick={onClose} aria-hidden="true" />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        className="relative w-full max-w-sm rounded-lg bg-card p-6 shadow-lg"
      >
        <h2 id="delete-dialog-title" className="text-base font-semibold text-foreground">
          Delete application?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">This action cannot be undone.</p>

        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="rounded-md bg-destructive px-3 py-1.5 text-sm font-medium text-destructive-foreground hover:opacity-90 disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
