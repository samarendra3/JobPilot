import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { loginSchema } from "@/schemas/auth.schema";
import { verifyPassword, createSessionToken, sessionCookieOptions, SESSION_COOKIE_NAME } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-response";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const LOGIN_LIMIT = 10;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(
    `login:${getClientIp(request)}`,
    LOGIN_LIMIT,
    LOGIN_WINDOW_MS
  );

  if (!rateLimit.allowed) {
    return errorResponse(
      "Too many login attempts. Please try again later.",
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

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message ?? "Invalid input", 400);
  }

  const email = parsed.data.email.trim().toLowerCase();
  const { password } = parsed.data;

  try {
    await connectToDatabase();

    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse("Invalid email or password", 401);
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return errorResponse("Invalid email or password", 401);
    }

    const token = await createSessionToken(String(user._id));
    const response = successResponse({
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
      },
    });
    response.cookies.set(SESSION_COOKIE_NAME, token, sessionCookieOptions());
    return response;
  } catch {
    return errorResponse("Something went wrong. Please try again.", 500);
  }
}
