import type { Metadata } from "next";
import Link from "next/link";
import { User, Sun, Shield, Database, TriangleAlert } from "lucide-react";

import { requireUser } from "@/lib/auth";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import ThemeToggle from "@/components/theme/theme-toggle";
import DangerZoneSection from "@/components/settings/danger-zone-section";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Settings | JobPilot",
  description: "Manage your account and application preferences.",
};

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account and application preferences.
        </p>
      </div>

      {/* Account */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User aria-hidden="true" className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Account</CardTitle>
          </div>
          <CardDescription>Your personal account information.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">{user.name}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{user.email}</p>
            </div>
            <Link
              href="/dashboard/profile"
              className={cn(
                "inline-flex h-10 shrink-0 items-center justify-center rounded-md border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors",
                "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              )}
            >
              Edit Profile
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sun aria-hidden="true" className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Appearance</CardTitle>
          </div>
          <CardDescription>Choose how JobPilot looks on this device.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm font-medium text-foreground">Theme</p>
          <ThemeToggle />
        </CardContent>
      </Card>

      {/* Privacy & Data */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield aria-hidden="true" className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Privacy &amp; Data</CardTitle>
          </div>
          <CardDescription>Manage your data on JobPilot.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3">
            <Database aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <Alert variant="info" title="Data export" className="w-full border-0 bg-transparent p-0 text-muted-foreground">
              Data export will be available in a future update.
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TriangleAlert aria-hidden="true" className="h-5 w-5 text-destructive" />
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
          </div>
          <CardDescription>Irreversible and destructive actions.</CardDescription>
        </CardHeader>
        <CardContent>
          <DangerZoneSection />
        </CardContent>
      </Card>
    </div>
  );
}
