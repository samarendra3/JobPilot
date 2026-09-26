import { NextRequest } from "next/server";

import {
  requireUser,
  AuthError,
} from "@/lib/auth";

import {
  errorResponse,
  successResponse,
  validationErrorResponse,
} from "@/lib/api-response";

import {
  aiAnalysisQuerySchema,
  jobAnalysisSchema,
} from "@/schemas/ai.schema";

import {
  ApplicationForAIAnalysisNotFoundError,
  createAIAnalysis,
  getLatestAIAnalysis,
} from "@/services/ai.service";

import {
  checkRateLimit,
} from "@/lib/rate-limit";

export async function GET(
  request: NextRequest
) {
  try {
    const user = await requireUser();

    const parsed =
      aiAnalysisQuerySchema.safeParse({
        applicationId:
          request.nextUrl.searchParams.get(
            "applicationId"
          ) || "",
      });

    if (!parsed.success) {
      return validationErrorResponse(
        parsed.error
      );
    }

    const analysis =
      await getLatestAIAnalysis(
        user._id,
        parsed.data.applicationId
      );

    return successResponse({
      analysis,
    });
  } catch (error) {
    if (error instanceof AuthError) {
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

const AI_ANALYSIS_LIMIT = 10;
const AI_ANALYSIS_WINDOW_MS = 60 * 60 * 1000;

export async function POST(
  request: NextRequest
) {
  try {
    const user = await requireUser();

    const rateLimit = checkRateLimit(
      `ai-analysis:${user._id}`,
      AI_ANALYSIS_LIMIT,
      AI_ANALYSIS_WINDOW_MS
    );

    if (!rateLimit.allowed) {
      return errorResponse(
        "Too many AI analysis requests. Please try again later.",
        429,
        {
          "Retry-After":
            String(rateLimit.retryAfterSeconds),
        }
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return errorResponse(
        "Invalid request body",
        400
      );
    }

    const parsed =
      jobAnalysisSchema.safeParse(body);

    if (!parsed.success) {
      return validationErrorResponse(
        parsed.error
      );
    }

    const analysis =
      await createAIAnalysis({
        userId: user._id,

        applicationId:
          parsed.data.applicationId,

        jobDescription:
          parsed.data.jobDescription,

        resumeText:
          parsed.data.resumeText || undefined,
      });

    return successResponse(
      {
        analysis,
      },
      201
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(
        "Unauthorized",
        401
      );
    }

    if (
      error instanceof
      ApplicationForAIAnalysisNotFoundError
    ) {
      return errorResponse(
        "Application not found",
        404
      );
    }

    if (
      error instanceof Error &&
      error.name === "AIProviderError"
    ) {
      return errorResponse(
        error.message,
        503
      );
    }

    console.error(
      "AI analysis error",
      error
    );

    return errorResponse(
      "Something went wrong. Please try again.",
      500
    );
  }
}