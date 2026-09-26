import { cache } from "react";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import type { PublicUser } from "@/types/user";

export const SESSION_COOKIE_NAME = "jobpilot_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const PASSWORD_SALT_ROUNDS = 12;

export class AuthError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "AuthError";
  }
}

function getSessionSecret(): Uint8Array {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("Missing NEXTAUTH_SECRET environment variable");
  }
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

export async function createSessionToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSessionSecret());
}

export async function verifySessionToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, getSessionSecret());
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

export function clearedSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
}

export function toPublicUser(userDoc: {
  _id: unknown;
  name: string;
  email: string;
  image?: string;
  skills: string[];
  experience: unknown[];
  education: unknown[];
  createdAt: Date;
  updatedAt: Date;
}): PublicUser {
  return {
    _id: String(userDoc._id),
    name: userDoc.name,
    email: userDoc.email,
    image: userDoc.image,
    skills: userDoc.skills,
    experience: userDoc.experience as PublicUser["experience"],
    education: userDoc.education as PublicUser["education"],
    createdAt: userDoc.createdAt.toISOString(),
    updatedAt: userDoc.updatedAt.toISOString(),
  };
}

export const getCurrentUser = cache(async (): Promise<PublicUser | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  const userId = await verifySessionToken(token);
  if (!userId) {
    return null;
  }

  try {
    await connectToDatabase();
    const userDoc = await User.findById(userId).lean();
    if (!userDoc) {
      return null;
    }

    return toPublicUser(userDoc as never);
  } catch (err) {
   
    console.error("getCurrentUser: database unavailable", err);
    return null;
  }
});

export async function requireUser(): Promise<PublicUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new AuthError();
  }
  return user;
}