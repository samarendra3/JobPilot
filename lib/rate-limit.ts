import type { NextRequest } from "next/server";

/**
 * In-memory, per-process rate limiter.
 *
 * LIMITATION: this only limits requests within a single Node process.
 * It does NOT provide distributed rate limiting across multiple
 * serverless instances / horizontally scaled deployments, and counters
 * reset on every restart or redeploy. For real production use behind
 * more than one instance, replace this with a shared store (e.g. Redis /
 * Upstash rate limiting). This implementation is a reasonable baseline
 * for a single-instance deployment and local development.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

let lastSweep = Date.now();
const SWEEP_INTERVAL_MS = 60_000;

function sweepExpired(now: number) {
  if (now - lastSweep < SWEEP_INTERVAL_MS) {
    return;
  }

  lastSweep = now;

  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  sweepExpired(now);

  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return {
      allowed: true,
      remaining: limit - 1,
      resetAt: now + windowMs,
      retryAfterSeconds: 0,
    };
  }

  if (bucket.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: bucket.resetAt,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((bucket.resetAt - now) / 1000)
      ),
    };
  }

  bucket.count += 1;

  return {
    allowed: true,
    remaining: Math.max(0, limit - bucket.count),
    resetAt: bucket.resetAt,
    retryAfterSeconds: 0,
  };
}

export function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  return "unknown";
}
