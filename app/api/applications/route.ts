import { NextRequest } from "next/server";
import { requireUser, AuthError } from "@/lib/auth";
import { applicationSchema, applicationListQuerySchema } from "@/schemas/application.schema";
import { listApplications, createApplication } from "@/services/application.service";
import { successResponse, errorResponse, validationErrorResponse } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();

    const rawQuery = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parsedQuery = applicationListQuerySchema.safeParse(rawQuery);
    if (!parsedQuery.success) {
      return validationErrorResponse(parsedQuery.error);
    }

    const result = await listApplications(user._id, parsedQuery.data);
    return successResponse(result);
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse("Something went wrong. Please try again.", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return errorResponse("Invalid request body", 400);
    }

    const parsed = applicationSchema.safeParse(body);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const application = await createApplication(user._id, parsed.data);
    return successResponse({ application }, 201);
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse("Something went wrong. Please try again.", 500);
  }
}
