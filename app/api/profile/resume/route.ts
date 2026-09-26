import { NextRequest } from "next/server";

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

import {
  checkRateLimit,
} from "@/lib/rate-limit";

const RESUME_UPLOAD_LIMIT = 10;
const RESUME_UPLOAD_WINDOW_MS =
  60 * 60 * 1000;

const MAX_RESUME_SIZE =
  4 * 1024 * 1024;

const ALLOWED_TYPES =
  new Set([
    "application/pdf",

    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ]);

function safeFileName(
  name: string
): string {
  const cleaned =
    name.replace(
      /[^a-zA-Z0-9._-]/g,
      "_"
    );

  return (
    cleaned.slice(0, 255) ||
    "resume"
  );
}

const PDF_SIGNATURE = [
  0x25, 0x50, 0x44, 0x46,
];

const ZIP_SIGNATURE = [
  0x50, 0x4b, 0x03, 0x04,
];

function hasSignature(
  data: Buffer,
  signature: number[]
): boolean {
  if (data.length < signature.length) {
    return false;
  }

  return signature.every(
    (byte, index) =>
      data[index] === byte
  );
}

function matchesDeclaredType(
  data: Buffer,
  contentType: string
): boolean {
  if (contentType === "application/pdf") {
    return hasSignature(
      data,
      PDF_SIGNATURE
    );
  }

  if (
    contentType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return hasSignature(
      data,
      ZIP_SIGNATURE
    );
  }

  return false;
}

export async function POST(
  request: NextRequest
) {
  try {
    const user =
      await requireUser();

    const rateLimit =
      checkRateLimit(
        `resume-upload:${user._id}`,
        RESUME_UPLOAD_LIMIT,
        RESUME_UPLOAD_WINDOW_MS
      );

    if (!rateLimit.allowed) {
      return errorResponse(
        "Too many resume uploads. Please try again later.",
        429,
        {
          "Retry-After":
            String(
              rateLimit.retryAfterSeconds
            ),
        }
      );
    }

    const formData =
      await request.formData();

    const file =
      formData.get("file");

    if (!(file instanceof File)) {
      return errorResponse(
        "Resume file is required",
        400
      );
    }

    if (
      !ALLOWED_TYPES.has(
        file.type
      )
    ) {
      return errorResponse(
        "Only PDF and DOCX resumes are supported",
        400
      );
    }

    if (
      file.size < 1 ||
      file.size >
        MAX_RESUME_SIZE
    ) {
      return errorResponse(
        "Resume must be smaller than 4 MB",
        400
      );
    }

    const data =
      Buffer.from(
        await file.arrayBuffer()
      );

    if (
      !matchesDeclaredType(
        data,
        file.type
      )
    ) {
      return errorResponse(
        "File content does not match a valid PDF or DOCX",
        400
      );
    }

    await connectToDatabase();

    await Resume.findOneAndUpdate(
      {
        userId: user._id,
      },

      {
        $set: {
          fileName:
            safeFileName(
              file.name
            ),

          contentType:
            file.type,

          size:
            file.size,

          data,
        },
      },

      {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return successResponse({
      resume: {
        fileName:
          safeFileName(
            file.name
          ),

        contentType:
          file.type,

        size:
          file.size,
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

    console.error(
      "Resume upload error",
      error
    );

    return errorResponse(
      "Resume upload failed",
      500
    );
  }
}