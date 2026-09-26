import { getCurrentUser } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return errorResponse("Unauthorized", 401);
  }

  return successResponse({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      image: user.image,
      skills: user.skills,
    },
  });
}
