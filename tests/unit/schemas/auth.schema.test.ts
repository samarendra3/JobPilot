import { describe, it, expect } from "vitest";
import { registerSchema, loginSchema } from "@/schemas/auth.schema";

describe("registerSchema", () => {
  const valid = {
    name: "Jane Doe",
    email: "jane@example.com",
    password: "password123",
    confirmPassword: "password123",
  };

  it("accepts valid input", () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects mismatched passwords", () => {
    const result = registerSchema.safeParse({ ...valid, confirmPassword: "different" });
    expect(result.success).toBe(false);
  });

  it("rejects a name shorter than 2 characters", () => {
    expect(registerSchema.safeParse({ ...valid, name: "J" }).success).toBe(false);
  });

  it("rejects an invalid email", () => {
    expect(registerSchema.safeParse({ ...valid, email: "not-an-email" }).success).toBe(false);
  });

  it("rejects a password shorter than 8 characters", () => {
    expect(
      registerSchema.safeParse({ ...valid, password: "short", confirmPassword: "short" }).success
    ).toBe(false);
  });

  it("rejects an oversized name", () => {
    expect(registerSchema.safeParse({ ...valid, name: "a".repeat(101) }).success).toBe(false);
  });

  it("rejects missing required fields", () => {
    expect(registerSchema.safeParse({ email: "jane@example.com" }).success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts valid input", () => {
    expect(loginSchema.safeParse({ email: "a@a.com", password: "x" }).success).toBe(true);
  });

  it("rejects an invalid email", () => {
    expect(loginSchema.safeParse({ email: "not-an-email", password: "x" }).success).toBe(false);
  });

  it("rejects an empty password", () => {
    expect(loginSchema.safeParse({ email: "a@a.com", password: "" }).success).toBe(false);
  });
});
