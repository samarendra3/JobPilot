import { requireUser, AuthError } from "@/lib/auth";
import { getDashboardData } from "@/services/dashboard.service";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET() {
  try {
    const user = await requireUser();
    const data = await getDashboardData(user._id);
    return successResponse(data);
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse("Something went wrong. Please try again.", 500);
  }
}
