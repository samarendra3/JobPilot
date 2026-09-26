import { describe, it, expect } from "vitest";
import { checkRateLimit } from "@/lib/rate-limit";

describe("checkRateLimit", () => {
  it("allows requests up to the limit", () => {
    const key = `test-${Math.random()}`;
    for (let i = 0; i < 5; i += 1) {
      expect(checkRateLimit(key, 5, 60_000).allowed).toBe(true);
    }
  });

  it("blocks the request that exceeds the limit and returns retryAfterSeconds", () => {
    const key = `test-${Math.random()}`;
    for (let i = 0; i < 3; i += 1) {
      checkRateLimit(key, 3, 60_000);
    }
    const result = checkRateLimit(key, 3, 60_000);
    expect(result.allowed).toBe(false);
    expect(result.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("tracks separate keys independently", () => {
    const keyA = `a-${Math.random()}`;
    const keyB = `b-${Math.random()}`;

    checkRateLimit(keyA, 1, 60_000);
    const blockedA = checkRateLimit(keyA, 1, 60_000);
    const allowedB = checkRateLimit(keyB, 1, 60_000);

    expect(blockedA.allowed).toBe(false);
    expect(allowedB.allowed).toBe(true);
  });

  it("resets the window after it expires", async () => {
    const key = `expiring-${Math.random()}`;
    expect(checkRateLimit(key, 1, 50).allowed).toBe(true);
    expect(checkRateLimit(key, 1, 50).allowed).toBe(false);

    await new Promise((resolve) => setTimeout(resolve, 60));

    expect(checkRateLimit(key, 1, 50).allowed).toBe(true);
  });
});
