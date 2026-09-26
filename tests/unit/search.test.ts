import { describe, it, expect } from "vitest";
import { toSafeSearchRegex } from "@/lib/search";

describe("toSafeSearchRegex", () => {
  it("matches a plain substring case-insensitively", () => {
    const pattern = toSafeSearchRegex("acme");
    expect(pattern.test("Acme Corp")).toBe(true);
    expect(pattern.test("Other Company")).toBe(false);
  });

  it("treats regex metacharacters as literal text instead of regex syntax", () => {
    const pattern = toSafeSearchRegex("a.b");
    expect(pattern.test("aXb")).toBe(false);
    expect(pattern.test("a.b")).toBe(true);
  });

  it("does not let a malicious .* pattern match everything", () => {
    const pattern = toSafeSearchRegex(".*");
    expect(pattern.test("some unrelated text")).toBe(false);
    expect(pattern.test(".*")).toBe(true);
  });

  it("does not throw on unbalanced regex syntax like an unclosed group", () => {
    expect(() => toSafeSearchRegex("(unclosed")).not.toThrow();
    expect(toSafeSearchRegex("(unclosed").test("(unclosed group")).toBe(true);
  });

  it("escapes alternation so it is not treated as regex OR", () => {
    const pattern = toSafeSearchRegex("a|b");
    expect(pattern.test("a")).toBe(false);
    expect(pattern.test("b")).toBe(false);
    expect(pattern.test("a|b")).toBe(true);
  });
});
