import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { registerSchema } from "@/schemas/auth.schema";
import { hashPassword, createSessionToken, sessionCookieOptions, SESSION_COOKIE_NAME } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-response";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const REGISTER_LIMIT = 5;
const REGISTER_WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(
    `register:${getClientIp(request)}`,
    REGISTER_LIMIT,
    REGISTER_WINDOW_MS
  );

  if (!rateLimit.allowed) {
    return errorResponse(
      "Too many registration attempts. Please try again later.",
      429,
      { "Retry-After": String(rateLimit.retryAfterSeconds) }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid request body", 400);
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message ?? "Invalid input", 400);
  }

  const { name, password } = parsed.data;
  const email = parsed.data.email.trim().toLowerCase();

  try {
    await connectToDatabase();

    const existingUser = await User.findOne({ email }).lean();
    if (existingUser) {
      return errorResponse("An account with this email already exists", 409);
    }

    const passwordHash = await hashPassword(password);
    const user = await User.create({ name, email, passwordHash });

    const token = await createSessionToken(String(user._id));
    const response = successResponse(
      {
        user: {
          id: String(user._id),
          name: user.name,
          email: user.email,
        },
      },
      201
    );
    response.cookies.set(SESSION_COOKIE_NAME, token, sessionCookieOptions());
    return response;
  } catch {
    return errorResponse("Something went wrong. Please try again.", 500);
  }
}
