import { SESSION_COOKIE_NAME, clearedSessionCookieOptions } from "@/lib/auth";
import { successResponse } from "@/lib/api-response";

export async function POST() {
  const response = successResponse({ loggedOut: true });
  response.cookies.set(SESSION_COOKIE_NAME, "", clearedSessionCookieOptions());
  return response;
}
