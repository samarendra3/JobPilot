"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import DeleteAccountDialog from "@/components/settings/delete-account-dialog";

export default function DangerZoneSection() {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">Delete account</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Permanently deletes your account, profile, applications, interviews, AI analyses, and resume.
            This cannot be undone.
          </p>
        </div>
        <Button
          type="button"
          variant="destructive"
          onClick={() => setShowDialog(true)}
          className="shrink-0"
        >
          <Trash2 aria-hidden="true" className="h-4 w-4" />
          Delete account
        </Button>
      </div>

      {showDialog && <DeleteAccountDialog onClose={() => setShowDialog(false)} />}
    </>
  );
}
