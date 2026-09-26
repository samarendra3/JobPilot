// @vitest-environment node
//
// jose performs a strict `instanceof Uint8Array` check on the signing
// key. Under jsdom, TypedArrays constructed via TextEncoder come from a
// different global realm than jose's bundled reference, so the check
// fails even though the bytes are correct. This file has no DOM
// dependency, so it runs under the plain Node environment instead.
import { describe, it, expect } from "vitest";
import { SignJWT } from "jose";
import {
  hashPassword,
  verifyPassword,
  createSessionToken,
  verifySessionToken,
  toPublicUser,
} from "@/lib/auth";

describe("password hashing", () => {
  it("hashes a password and verifies it correctly", async () => {
    const hash = await hashPassword("correct-horse-battery-staple");
    expect(hash).not.toBe("correct-horse-battery-staple");
    expect(await verifyPassword("correct-horse-battery-staple", hash)).toBe(true);
  });

  it("rejects an incorrect password against a hash", async () => {
    const hash = await hashPassword("correct-horse-battery-staple");
    expect(await verifyPassword("wrong-password", hash)).toBe(false);
  });

  it("produces different hashes for the same password (salted)", async () => {
    const hash1 = await hashPassword("same-password");
    const hash2 = await hashPassword("same-password");
    expect(hash1).not.toBe(hash2);
  });
});

describe("session JWT", () => {
  it("creates a token that verifies back to the same user id", async () => {
    const token = await createSessionToken("507f1f77bcf86cd799439011");
    const userId = await verifySessionToken(token);
    expect(userId).toBe("507f1f77bcf86cd799439011");
  });

  it("rejects a malformed token", async () => {
    const userId = await verifySessionToken("not-a-real-jwt");
    expect(userId).toBeNull();
  });

  it("rejects a token signed with the wrong secret", async () => {
    const secret = new TextEncoder().encode("a-completely-different-secret");
    const token = await new SignJWT({ sub: "someone" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(secret);

    const userId = await verifySessionToken(token);
    expect(userId).toBeNull();
  });

  it("rejects an expired token", async () => {
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
    const expiredToken = await new SignJWT({ sub: "someone" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt(Math.floor(Date.now() / 1000) - 1000)
      .setExpirationTime(Math.floor(Date.now() / 1000) - 500)
      .sign(secret);

    const userId = await verifySessionToken(expiredToken);
    expect(userId).toBeNull();
  });

  it("rejects a token with a non-string sub claim", async () => {
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
    const token = await new SignJWT({ sub: undefined, other: 123 })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(secret);

    const userId = await verifySessionToken(token);
    expect(userId).toBeNull();
  });
});

describe("toPublicUser", () => {
  it("never includes passwordHash even if present on the source document", () => {
    const doc = {
      _id: "507f1f77bcf86cd799439011",
      name: "Jane Doe",
      email: "jane@example.com",
      passwordHash: "$2b$12$super-secret-hash-value",
      skills: ["React"],
      experience: [],
      education: [],
      createdAt: new Date("2026-01-01T00:00:00Z"),
      updatedAt: new Date("2026-01-01T00:00:00Z"),
    };

    const publicUser = toPublicUser(doc as never);

    expect(publicUser).not.toHaveProperty("passwordHash");
    expect(JSON.stringify(publicUser)).not.toContain("super-secret-hash-value");
    expect(publicUser._id).toBe("507f1f77bcf86cd799439011");
    expect(publicUser.email).toBe("jane@example.com");
  });

  it("converts ObjectId-like _id and Date fields to strings", () => {
    const doc = {
      _id: { toString: () => "abc123" },
      name: "A",
      email: "a@a.com",
      skills: [],
      experience: [],
      education: [],
      createdAt: new Date("2026-01-01T00:00:00Z"),
      updatedAt: new Date("2026-01-02T00:00:00Z"),
    };

    const publicUser = toPublicUser(doc as never);
    expect(publicUser._id).toBe("abc123");
    expect(typeof publicUser.createdAt).toBe("string");
    expect(typeof publicUser.updatedAt).toBe("string");
  });
});
