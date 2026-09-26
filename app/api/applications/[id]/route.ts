import { NextRequest } from "next/server";
import { requireUser, AuthError } from "@/lib/auth";
import { updateApplicationSchema } from "@/schemas/application.schema";
import { getApplicationById, updateApplication, deleteApplication } from "@/services/application.service";
import { successResponse, errorResponse, validationErrorResponse } from "@/lib/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const application = await getApplicationById(id, user._id);
    if (!application) {
      return errorResponse("Application not found", 404);
    }

    return successResponse({ application });
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

    const parsed = updateApplicationSchema.safeParse(body);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const application = await updateApplication(id, user._id, parsed.data);
    if (!application) {
      return errorResponse("Application not found", 404);
    }

    return successResponse({ application });
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

    const deleted = await deleteApplication(id, user._id);
    if (!deleted) {
      return errorResponse("Application not found", 404);
    }

    return successResponse({ deleted: true });
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse("Something went wrong. Please try again.", 500);
  }
}
