import { NextResponse } from "next/server";
import type { ZodError } from "zod";

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(
  message: string,
  status = 400,
  headers?: Record<string, string>
) {
  return NextResponse.json(
    { success: false, error: message },
    { status, headers }
  );
}

export function validationErrorResponse(error: ZodError, status = 400) {
  return NextResponse.json(
    {
      success: false,
      message: "Validation failed",
      errors: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    },
    { status }
  );
}
