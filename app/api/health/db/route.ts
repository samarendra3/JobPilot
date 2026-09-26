import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";


export const dynamic = "force-dynamic";

const READY_STATES: Record<number, string> = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
};

function diagnose(error: unknown): { name: string; hint: string } {
  const name = error instanceof Error ? error.name : "UnknownError";
  const message = error instanceof Error ? error.message : String(error);

  if (name === "MongooseServerSelectionError" || name === "MongoServerSelectionError") {
    return {
      name,
      hint: "Cannot reach the cluster. Check that your current IP is Active in Atlas > Database & Network Access, and that the cluster isn't paused.",
    };
  }

  if (/auth/i.test(message)) {
    return {
      name,
      hint: "Authentication failed. Check the username and password in MONGODB_URI (URL-encode special characters) and that the DB user exists in Atlas.",
    };
  }

  if (/ENOTFOUND|querySrv|EREFUSED/i.test(message)) {
    return {
      name,
      hint: "DNS lookup failed. Try a different network or DNS (1.1.1.1 / 8.8.8.8), or use the standard (non-SRV) connection string.",
    };
  }

  return { name, hint: "Unexpected error. Check the dev server terminal for details." };
}

export async function GET() {
  const startedAt = Date.now();

  try {
    const mongoose = await connectToDatabase();
    const readyState = mongoose.connection.readyState;

    return NextResponse.json({
      success: true,
      message: "MongoDB connected successfully",
      readyState,
      state: READY_STATES[readyState] ?? "unknown",
      latencyMs: Date.now() - startedAt,
    });
  } catch (error) {
    const { name, hint } = diagnose(error);
    console.error("health/db: connection failed", error);

    // Detailed connectivity hints (Atlas IP allowlist, DNS, credentials)
    // are useful for local development but are internal infrastructure
    // details that shouldn't be disclosed to an unauthenticated caller
    // in production.
    const isProd = process.env.NODE_ENV === "production";

    return NextResponse.json(
      {
        success: false,
        message: "MongoDB connection failed",
        errorName: name,
        ...(isProd ? {} : { hint }),
        latencyMs: Date.now() - startedAt,
      },
      { status: 503 }
    );
  }
}