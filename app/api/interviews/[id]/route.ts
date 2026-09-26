import { NextRequest } from "next/server";
import { requireUser, AuthError } from "@/lib/auth";
import { updateInterviewSchema } from "@/schemas/interview.schema";
import { getInterviewById, updateInterview, deleteInterview } from "@/services/interview.service";
import { successResponse, errorResponse, validationErrorResponse } from "@/lib/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const interview = await getInterviewById(id, user._id);
    if (!interview) {
      return errorResponse("Interview not found", 404);
    }

    return successResponse({ interview });
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse("Something went wrong. Please try again.", 500);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireUser();
    const { id } = await params;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return errorResponse("Invalid request body", 400);
    }

    const parsed = updateInterviewSchema.safeParse(body);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const result = await updateInterview(id, user._id, parsed.data);
    if (result === "APPLICATION_NOT_FOUND") {
      return errorResponse("Application not found", 404);
    }
    if (!result) {
      return errorResponse("Interview not found", 404);
    }

    return successResponse({ interview: result });
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse("Something went wrong. Please try again.", 500);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const deleted = await deleteInterview(id, user._id);
    if (!deleted) {
      return errorResponse("Interview not found", 404);
    }

    return successResponse({ deleted: true });
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse("Something went wrong. Please try again.", 500);
  }
}
