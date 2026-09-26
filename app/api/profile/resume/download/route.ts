import {
  AuthError,
  requireUser,
} from "@/lib/auth";

import connectToDatabase
  from "@/lib/mongodb";

import Resume
  from "@/models/Resume";

export async function GET() {
  try {
    const user =
      await requireUser();

    await connectToDatabase();

    const resumeDoc =
      await Resume.findOne({
        userId: user._id,
      }).lean();

    if (!resumeDoc) {
      return new Response(
        "Resume not found",
        {
          status: 404,
        }
      );
    }

    const resume =
      resumeDoc as unknown as {
        data: Buffer;
        contentType: string;
        fileName: string;
      };

    return new Response(
      new Uint8Array(resume.data),
      {
        status: 200,

        headers: {
          "Content-Type":
            resume.contentType,

          "Content-Disposition":
            `attachment; filename="${resume.fileName.replace(
              /"/g,
              ""
            )}"`,

          "Cache-Control":
            "private, no-store",
        },
      }
    );
  } catch (error) {
    if (
      error instanceof AuthError
    ) {
      return new Response(
        "Unauthorized",
        {
          status: 401,
        }
      );
    }

    console.error(
      "Resume download error",
      error
    );

    return new Response(
      "Unable to download resume",
      {
        status: 500,
      }
    );
  }
}