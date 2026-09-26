"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

interface DeleteAccountDialogProps {
  onClose: () => void;
}

const CONFIRM_TEXT = "DELETE";

export default function DeleteAccountDialog({ onClose }: DeleteAccountDialogProps) {
  const router = useRouter();
  const [confirmValue, setConfirmValue] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canDelete = confirmValue === CONFIRM_TEXT && !isDeleting;

  const handleDelete = async () => {
    if (!canDelete) return;
    setIsDeleting(true);
    setError(null);
    try {
      const res = await fetch("/api/profile", { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "Failed to delete account");
      }
      router.push("/login");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete account");
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-foreground/40" onClick={isDeleting ? undefined : onClose} aria-hidden="true" />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-account-title"
        aria-describedby="delete-account-description"
        className="relative w-full max-w-sm rounded-lg bg-card p-6 shadow-lg"
      >
        <h2 id="delete-account-title" className="text-base font-semibold text-foreground">
          Delete your account?
        </h2>
        <p id="delete-account-description" className="mt-2 text-sm text-muted-foreground">
          This permanently deletes your profile, applications, interviews, AI analyses, and resume.
          This action cannot be undone.
        </p>

        <div className="mt-4">
          <Label htmlFor="delete-confirm-input">
            Type <span className="font-mono font-semibold">{CONFIRM_TEXT}</span> to confirm
          </Label>
          <Input
            id="delete-confirm-input"
            type="text"
            value={confirmValue}
            onChange={(event) => setConfirmValue(event.target.value)}
            disabled={isDeleting}
            autoComplete="off"
            className="focus:ring-destructive/30 focus:border-destructive"
          />
        </div>

        {error && (
          <p role="alert" className="mt-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={!canDelete} isLoading={isDeleting}>
            Delete account
          </Button>
        </div>
      </div>
    </div>
  );
}
