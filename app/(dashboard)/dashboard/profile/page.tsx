import type { Metadata } from "next";

import {
  requireUser,
} from "@/lib/auth";

import {
  getResumeMetadata,
} from "@/lib/profile";

import ProfileForm
  from "@/components/profile/profile-form";

export const metadata: Metadata = {
  title:
    "Profile & Resume | JobPilot",

  description:
    "Manage your professional profile and resume.",
};

export default async function
  ProfilePage() {
  const user =
    await requireUser();

  const resume =
    await getResumeMetadata(
      user._id
    );

  return (
    <div className="w-full space-y-6">

      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Profile & Resume
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Keep your professional profile current so JobPilot can use it across applications and AI analysis.
        </p>
      </div>

      <ProfileForm
        initialUser={{
          ...user,
          resume,
        }}
      />

    </div>
  );
}