import { NextRequest } from "next/server";

import {
  requireUser,
  AuthError,
  SESSION_COOKIE_NAME,
  clearedSessionCookieOptions,
} from "@/lib/auth";

import connectToDatabase
  from "@/lib/mongodb";

import User
  from "@/models/User";

import Application
  from "@/models/Application";

import Interview
  from "@/models/Interview";

import AIAnalysis
  from "@/models/AIAnalysis";

import Resume
  from "@/models/Resume";

import {
  updateProfileSchema,
} from "@/schemas/profile.schema";

import {
  errorResponse,
  successResponse,
  validationErrorResponse,
} from "@/lib/api-response";

import {
  toPublicProfile,
  getResumeMetadata,
} from "@/lib/profile";

export async function GET() {
  try {
    const user =
      await requireUser();

    const resume =
      await getResumeMetadata(
        user._id
      );

    return successResponse({
      user: {
        ...user,
        resume,
      },
    });
  } catch (error) {
    if (
      error instanceof AuthError
    ) {
      return errorResponse(
        "Unauthorized",
        401
      );
    }

    return errorResponse(
      "Something went wrong. Please try again.",
      500
    );
  }
}

export async function PATCH(
  request: NextRequest
) {
  try {
    const currentUser =
      await requireUser();

    let body: unknown;

    try {
      body =
        await request.json();
    } catch {
      return errorResponse(
        "Invalid request body",
        400
      );
    }

    const parsed =
      updateProfileSchema.safeParse(
        body
      );

    if (!parsed.success) {
      return validationErrorResponse(
        parsed.error
      );
    }

    await connectToDatabase();

    const userDoc =
      await User.findByIdAndUpdate(
        currentUser._id,

        {
          $set: {
            name:
              parsed.data.name,

            headline:
              parsed.data.headline ||
              undefined,

            phone:
              parsed.data.phone ||
              undefined,

            location:
              parsed.data.location ||
              undefined,

            image:
              parsed.data.image ||
              undefined,

            linkedinUrl:
              parsed.data.linkedinUrl ||
              undefined,

            githubUrl:
              parsed.data.githubUrl ||
              undefined,

            portfolioUrl:
              parsed.data.portfolioUrl ||
              undefined,

            resumeText:
              parsed.data.resumeText ||
              undefined,

            skills: [
              ...new Set(
                parsed.data.skills
                  .map((skill) =>
                    skill.trim()
                  )
                  .filter(Boolean)
              ),
            ],

            experience:
              parsed.data.experience.map(
                (entry) => ({
                  ...entry,

                  startDate:
                    entry.startDate ||
                    undefined,

                  endDate:
                    entry.endDate ||
                    undefined,
                })
              ),

            education:
              parsed.data.education.map(
                (entry) => ({
                  ...entry,

                  startDate:
                    entry.startDate ||
                    undefined,

                  endDate:
                    entry.endDate ||
                    undefined,
                })
              ),
          },
        },

        {
          new: true,
          runValidators: true,
        }
      )
        .lean();

    if (!userDoc) {
      return errorResponse(
        "User not found",
        404
      );
    }

    const resume =
      await getResumeMetadata(
        currentUser._id
      );

    return successResponse({
      user:
        toPublicProfile(
          userDoc as never,
          resume
        ),
    });
  } catch (error) {
    if (
      error instanceof AuthError
    ) {
      return errorResponse(
        "Unauthorized",
        401
      );
    }

    console.error(
      "Profile update error",
      error
    );

    return errorResponse(
      "Something went wrong. Please try again.",
      500
    );
  }
}

export async function DELETE() {
  try {
    const currentUser = await requireUser();

    await connectToDatabase();

    const userId = currentUser._id;

    // Delete all data owned by this user. Sequential deletes are used
    // since the existing Mongoose connection is not configured for
    // multi-document transactions (no guaranteed replica set).
    await AIAnalysis.deleteMany({ userId });
    await Interview.deleteMany({ userId });
    await Application.deleteMany({ userId });
    await Resume.deleteMany({ userId });
    await User.findByIdAndDelete(userId);

    const response = successResponse({ deleted: true });
    response.cookies.set(SESSION_COOKIE_NAME, "", clearedSessionCookieOptions());
    return response;
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse("Unauthorized", 401);
    }

    console.error("Account deletion error", error);

    return errorResponse(
      "Something went wrong. Please try again.",
      500
    );
  }
}