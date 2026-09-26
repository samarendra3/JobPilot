import {
  AuthError,
  requireUser,
} from "@/lib/auth";

import connectToDatabase
  from "@/lib/mongodb";

import Resume
  from "@/models/Resume";

import {
  errorResponse,
  successResponse,
} from "@/lib/api-response";

export async function DELETE() {
  try {
    const user =
      await requireUser();

    await connectToDatabase();

    await Resume.deleteOne({
      userId: user._id,
    });

    return successResponse({
      deleted: true,
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
      "Resume delete error",
      error
    );

    return errorResponse(
      "Unable to delete resume",
      500
    );
  }
}